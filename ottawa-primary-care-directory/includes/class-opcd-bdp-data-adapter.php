<?php
/**
 * Convert published Business Directory Plugin listings into the presentation
 * schema used by the Ottawa directory interface.
 *
 * This class is deliberately read-only: it registers no forms, mutations, or
 * privileged REST operations. WordPress administrators continue to maintain
 * listings through Business Directory Plugin.
 *
 * @package OttawaPrimaryCareDirectory
 */

defined( 'ABSPATH' ) || exit;

final class OPCD_BDP_Data_Adapter {
	const REST_NAMESPACE = 'opcd/v1';
	const REST_ROUTE     = '/directory';
	const CACHE_KEY      = 'opcd_bdp_directory_v2_3_2';
	const CACHE_TTL      = 5 * MINUTE_IN_SECONDS;

	/**
	 * Register public route and cache invalidation hooks.
	 */
	public static function register() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_rest_route' ) );
		add_action( 'save_post_wpbdp_listing', array( __CLASS__, 'invalidate_cache' ) );
		add_action( 'before_delete_post', array( __CLASS__, 'maybe_invalidate_deleted_post' ) );
		add_action( 'set_object_terms', array( __CLASS__, 'maybe_invalidate_terms' ), 10, 6 );
	}

	/**
	 * Register a public, read-only endpoint containing published directory data.
	 */
	public static function register_rest_route() {
		register_rest_route(
			self::REST_NAMESPACE,
			self::REST_ROUTE,
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( __CLASS__, 'rest_response' ),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * Return the transformed public payload.
	 *
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_response() {
		if ( ! post_type_exists( 'wpbdp_listing' ) || ! function_exists( 'wpbdp_get_form_fields' ) ) {
			return new WP_Error(
				'opcd_dependency_missing',
				__( 'Business Directory Plugin is not active.', 'ottawa-primary-care-directory' ),
				array( 'status' => 503 )
			);
		}

		$data = self::get_data();
		if ( is_wp_error( $data ) ) {
			return $data;
		}

		$response = rest_ensure_response( $data );
		$response->header( 'Cache-Control', 'public, max-age=300, stale-while-revalidate=60' );
		$response->header( 'X-OPCD-Source', 'business-directory-plugin' );
		return $response;
	}

	/**
	 * Build or retrieve the directory payload.
	 *
	 * @return array|WP_Error
	 */
	public static function get_data() {
		$cached = get_transient( self::CACHE_KEY );
		if ( is_array( $cached ) ) {
			return $cached;
		}

		$baseline_path = OPCD_DIR . 'assets/data/directory.json';
		if ( ! is_readable( $baseline_path ) ) {
			return new WP_Error(
				'opcd_baseline_missing',
				__( 'The directory presentation schema is unavailable.', 'ottawa-primary-care-directory' ),
				array( 'status' => 503 )
			);
		}

		$baseline = json_decode( file_get_contents( $baseline_path ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		if ( ! is_array( $baseline ) ) {
			return new WP_Error(
				'opcd_baseline_invalid',
				__( 'The directory presentation schema is invalid.', 'ottawa-primary-care-directory' ),
				array( 'status' => 503 )
			);
		}

		$data = self::build_from_listings( $baseline );
		set_transient( self::CACHE_KEY, $data, self::CACHE_TTL );
		return $data;
	}

	/**
	 * Transform published listings while retaining the original presentation
	 * taxonomy, verification text, and map geography.
	 *
	 * @param array $baseline Original presentation schema.
	 * @return array
	 */
	private static function build_from_listings( $baseline ) {
		$records   = self::get_listing_records();
		$templates = self::build_template_indexes( $baseline );
		$data      = $baseline;

		$data['specialists'] = self::empty_specialist_groups( $baseline );
		$data['svcRows']     = array();
		$data['routing']     = array();
		$data['intakes']     = array();
		$data['forms']       = self::empty_form_agencies( $baseline );
		$data['resources']   = self::empty_resource_sections( $baseline );
		$data['quick']       = array();

		$category_names = isset( $baseline['catNames'] ) && is_array( $baseline['catNames'] ) ? $baseline['catNames'] : array();
		$category_ids   = isset( $baseline['catIds'] ) && is_array( $baseline['catIds'] ) ? $baseline['catIds'] : array();
		$category_map   = array();
		foreach ( $category_names as $index => $name ) {
			$category_map[ self::normalize( $name ) ] = (int) $index;
		}

		foreach ( $records as $record ) {
			$type = self::record_type( $record['categories'] );
			switch ( $type ) {
				case 'specialist':
					self::append_specialist( $data, $record, $templates['specialists'] );
					break;
				case 'service':
					self::append_service( $data, $record, $templates['services'], $category_names, $category_ids, $category_map );
					break;
				case 'intake':
					$data['intakes'][] = self::make_intake( $record, $templates['intakes'] );
					break;
				case 'route':
					$data['routing'][] = self::make_route( $record, $templates['routing'] );
					break;
				case 'form':
					self::append_form( $data, $record, $templates['forms'] );
					break;
				case 'resource':
					self::append_resource( $data, $record, $templates['resources'] );
					break;
				case 'quick':
					$data['quick'][] = self::make_quick_number( $record, $templates['quick'] );
					break;
			}
		}

		self::finalize_specialists( $data );
		self::finalize_services( $data, $baseline, $category_names );
		self::finalize_forms_and_resources( $data );

		$data['catNames'] = array_values( $category_names );
		$data['catIds']   = array_values( $category_ids );
		$data['fax']      = self::build_fax_index( $data['svcRows'], $baseline );
		if ( ! isset( $data['fsaGeo']['J8Z'] ) ) {
			$data['fsaGeo']['J8Z'] = array(
				'lat'  => 45.4659,
				'lon'  => -75.7379,
				'name' => 'Hull / Saint-Joseph',
				'area' => 'Gatineau',
			);
		}
		$data['mapRows'] = self::build_map_rows( $records, isset( $data['fsaGeo'] ) ? $data['fsaGeo'] : array() );

		$map_geo     = isset( $data['fsaGeo'] ) ? $data['fsaGeo'] : array();
		$mapped_rows = array_filter(
			$data['mapRows'],
			function ( $row ) use ( $map_geo ) {
				return ! empty( $row['fsa'] ) && isset( $map_geo[ $row['fsa'] ] );
			}
		);

		$data['meta']['specCount']   = self::specialist_unique_count( $data['specialists'] );
		$data['meta']['specGroups']  = count( $data['specialists'] );
		$data['meta']['specRows']    = self::specialist_count( $data['specialists'] );
		$data['meta']['svcCount']    = count( $data['svcRows'] );
		$data['meta']['svcSource']   = count( $data['svcRows'] );
		$data['meta']['svcSections'] = count( $data['services'] );
		$data['meta']['faxCount']    = count( $data['fax'] );
		$data['meta']['mapCount']    = count( $data['mapRows'] );
		$data['meta']['mapPlaced']   = count( $mapped_rows );
		$data['meta']['mapUnplaced'] = count( $data['mapRows'] ) - count( $mapped_rows );
		$data['meta']['runtime']     = 'Business Directory Plugin';

		return $data;
	}

	/**
	 * Read published records and public form fields from Business Directory.
	 *
	 * @return array
	 */
	private static function get_listing_records() {
		$query = new WP_Query(
			array(
				'post_type'              => 'wpbdp_listing',
				'post_status'            => 'publish',
				'posts_per_page'         => -1,
				'orderby'                => 'title',
				'order'                  => 'ASC',
				'no_found_rows'          => true,
				'update_post_meta_cache' => true,
				'update_post_term_cache' => true,
			)
		);

		$fields       = self::get_public_fields();
		$category_tax = defined( 'WPBDP_CATEGORY_TAX' ) ? WPBDP_CATEGORY_TAX : 'wpbdp_category';
		$records      = array();

		foreach ( $query->posts as $post ) {
			$values = array();
			foreach ( $fields as $shortname => $field ) {
				$value = $field->plain_value( $post->ID );
				$value_string = is_array( $value ) ? implode( ', ', array_map( 'strval', $value ) ) : (string) $value;
				$values[ $shortname ] = self::decode_text( $value_string );
			}

			$categories = wp_get_post_terms( $post->ID, $category_tax, array( 'fields' => 'names' ) );
			$tags       = wp_get_post_terms( $post->ID, 'wpbdp_tag', array( 'fields' => 'names' ) );
			$categories = is_wp_error( $categories ) ? array() : array_map( array( __CLASS__, 'decode_text' ), $categories );
			$tags       = is_wp_error( $tags ) ? array() : array_map( array( __CLASS__, 'decode_text' ), $tags );

			$records[] = array(
				'id'                => (int) $post->ID,
				'title'             => self::decode_text( get_the_title( $post ) ),
				'description'       => (string) $post->post_content,
				'short_description' => (string) $post->post_excerpt,
				'categories'        => array_values( $categories ),
				'tags'              => array_values( $tags ),
				'fields'            => $values,
			);
		}

		wp_reset_postdata();
		return $records;
	}

	/**
	 * Return only fields used by the public adapter.
	 *
	 * @return array
	 */
	private static function get_public_fields() {
		$wanted = array( 'website', 'phone', 'fax', 'email', 'address', 'zip_code', 'short_description', 'description' );
		$result = array();
		foreach ( wpbdp_get_form_fields() as $field ) {
			$shortname = $field->get_shortname();
			if ( in_array( $shortname, $wanted, true ) ) {
				$result[ $shortname ] = $field;
			}
		}
		return $result;
	}

	/**
	 * Create indexes of original items for feature-rich rendering.
	 *
	 * @param array $baseline Original data.
	 * @return array
	 */
	private static function build_template_indexes( $baseline ) {
		$indexes = array(
			'specialists' => array(),
			'services'    => array(),
			'routing'     => array(),
			'intakes'     => array(),
			'forms'       => array(),
			'resources'   => array(),
			'quick'       => array(),
		);

		foreach ( $baseline['specialists'] as $group ) {
			foreach ( $group['rows'] as $item ) {
				self::index_template( $indexes['specialists'], $item['name'], array( 'group' => $group['group'], 'item' => $item ) );
			}
		}
		foreach ( $baseline['svcRows'] as $item ) {
			self::index_template( $indexes['services'], $item['name'], $item );
		}
		foreach ( $baseline['routing'] as $item ) {
			self::index_template( $indexes['routing'], $item['s'], $item );
		}
		foreach ( $baseline['intakes'] as $item ) {
			self::index_template( $indexes['intakes'], $item['name'], $item );
		}
		foreach ( $baseline['forms'] as $agency ) {
			foreach ( $agency['items'] as $item ) {
				self::index_template( $indexes['forms'], $item['name'], array( 'agency' => $agency['agency'], 'item' => $item ) );
			}
		}
		foreach ( $baseline['resources'] as $section ) {
			foreach ( $section['groups'] as $group ) {
				foreach ( $group['items'] as $item ) {
					self::index_template(
						$indexes['resources'],
						$item['name'],
						array( 'section' => $section['title'], 'section_id' => $section['id'], 'group' => $group['title'], 'item' => $item )
					);
				}
			}
		}
		foreach ( $baseline['quick'] as $item ) {
			self::index_template( $indexes['quick'], $item['n'], $item );
		}
		return $indexes;
	}

	private static function index_template( &$index, $title, $item ) {
		$key = self::normalize( $title );
		if ( ! isset( $index[ $key ] ) ) {
			$index[ $key ] = array();
		}
		$index[ $key ][] = $item;
	}

	private static function empty_specialist_groups( $baseline ) {
		$result = array();
		foreach ( $baseline['specialists'] as $group ) {
			$result[] = array( 'group' => $group['group'], 'count' => 0, 'rows' => array() );
		}
		return $result;
	}

	private static function empty_form_agencies( $baseline ) {
		$result = array();
		foreach ( $baseline['forms'] as $agency ) {
			$result[] = array( 'agency' => $agency['agency'], 'items' => array() );
		}
		return $result;
	}

	private static function empty_resource_sections( $baseline ) {
		$result = array();
		foreach ( $baseline['resources'] as $section ) {
			$new_section = array( 'id' => $section['id'], 'title' => $section['title'], 'groups' => array() );
			foreach ( $section['groups'] as $group ) {
				$new_section['groups'][] = array( 'title' => $group['title'], 'items' => array() );
			}
			$result[] = $new_section;
		}
		return $result;
	}

	private static function record_type( $categories ) {
		$normalized = array_map( array( __CLASS__, 'normalize' ), $categories );
		if ( in_array( 'specialists', $normalized, true ) ) {
			return 'specialist';
		}
		if ( in_array( 'clinics services', $normalized, true ) ) {
			return 'service';
		}
		if ( in_array( 'forms', $normalized, true ) ) {
			return 'form';
		}
		if ( in_array( 'resources', $normalized, true ) ) {
			return 'resource';
		}
		if ( in_array( 'quick numbers', $normalized, true ) ) {
			return 'quick';
		}
		if ( in_array( 'referral routes', $normalized, true ) ) {
			return in_array( 'central intake', $normalized, true ) ? 'intake' : 'route';
		}
		return '';
	}

	private static function append_specialist( &$data, $record, $templates ) {
		$template_set = self::matching_specialist_templates( $record, $templates );
		if ( ! $template_set ) {
			$template_set = array(
				array(
					'group' => self::first_category_except( $record['categories'], array( 'Specialists' ) ),
					'item'  => array(),
				),
			);
		}

		$details = self::parse_details( $record['description'] );
		foreach ( $template_set as $template ) {
			$item = $template['item'];
			$item['name']  = $record['title'];
			$item['sub']   = self::detail( $details, 'Subspecialty / notes', isset( $item['sub'] ) ? $item['sub'] : '' );
			$item['site']  = self::field_or_detail( $record, 'address', $details, 'Location', isset( $item['site'] ) ? $item['site'] : '' );
			$item['phone'] = self::field_or_detail( $record, 'phone', $details, 'Phone', isset( $item['phone'] ) ? $item['phone'] : '' );
			$item['fax']   = self::field_or_detail( $record, 'fax', $details, 'Fax', isset( $item['fax'] ) ? $item['fax'] : '' );
			$item['langs'] = self::detail( $details, 'Languages', isset( $item['langs'] ) ? $item['langs'] : '' );
			$item['fsa']   = self::postal_district( self::field_value( $record, 'zip_code' ), $item['site'] );
			$item['geo']   = trim( $item['site'] . ' ' . $item['fsa'] );

			$group_index = self::find_or_add_specialist_group( $data['specialists'], $template['group'] );
			$data['specialists'][ $group_index ]['rows'][] = $item;
		}
	}

	/**
	 * Return every original specialty occurrence belonging to the current
	 * physician/practice. The migration stores one WordPress post per unique
	 * physician, while the designed roster intentionally shows cross-specialty
	 * occurrences.
	 */
	private static function matching_specialist_templates( $record, $templates ) {
		$key = self::normalize( $record['title'] );
		if ( empty( $templates[ $key ] ) ) {
			return array();
		}
		$candidates = $templates[ $key ];
		if ( 1 === count( $candidates ) ) {
			return $candidates;
		}

		$address   = self::field_value( $record, 'address' );
		$best      = 0;
		$by_score  = array();
		foreach ( $candidates as $candidate ) {
			$score = self::text_match_score( $address, isset( $candidate['item']['site'] ) ? $candidate['item']['site'] : '' );
			$best  = max( $best, $score );
			$by_score[] = array( 'score' => $score, 'candidate' => $candidate );
		}

		$result = array();
		foreach ( $by_score as $entry ) {
			if ( $entry['score'] === $best || ( 0 === $best && self::category_score( $record['categories'], array( $entry['candidate']['group'] ) ) ) ) {
				$result[] = $entry['candidate'];
			}
		}
		return $result ? $result : array( self::best_template( $record, $templates, 'specialist' ) );
	}

	private static function append_service( &$data, $record, $templates, &$category_names, &$category_ids, &$category_map ) {
		$template = self::best_template( $record, $templates, 'service' );
		$item     = $template ? $template : array( 'id' => 'wp-' . $record['id'] );
		$details  = self::parse_details( $record['description'] );

		$item['name']   = $record['title'];
		$item['desc']   = self::detail( $details, 'Description', self::short_description( $record, isset( $item['desc'] ) ? $item['desc'] : '' ) );
		$item['addr']   = self::field_or_detail( $record, 'address', $details, 'Address', isset( $item['addr'] ) ? $item['addr'] : '' );
		$item['postal'] = self::field_value( $record, 'zip_code', isset( $item['postal'] ) ? $item['postal'] : '' );
		$item['fsa']    = self::postal_district( $item['postal'], $item['addr'] );
		$item['phone']  = self::field_or_detail( $record, 'phone', $details, 'Phone', isset( $item['phone'] ) ? $item['phone'] : '' );
		$item['fax']    = self::field_or_detail( $record, 'fax', $details, 'Fax', isset( $item['fax'] ) ? $item['fax'] : '' );
		$item['email']  = self::field_or_detail( $record, 'email', $details, 'Email', isset( $item['email'] ) ? $item['email'] : '' );
		$item['web']    = self::field_or_detail( $record, 'website', $details, 'Website', isset( $item['web'] ) ? $item['web'] : '' );

		$label_map = array(
			'Intersection'          => 'cross',
			'Toll-free'             => 'tollfree',
			'TTY'                   => 'tty',
			'Contacts'              => 'contacts',
			'Leadership'            => 'execs',
			'Hours'                 => 'hours',
			'After hours'           => 'afterhours',
			'Eligibility'           => 'elig',
			'How to access / refer' => 'apply',
			'Fees'                  => 'fees',
			'Languages'             => 'lang',
			'Language notes'        => 'langnotes',
			'Accessibility'         => 'access',
			'Accessibility notes'   => 'accessnotes',
			'Service area'          => 'area',
			'Last verified'         => 'updated',
		);
		foreach ( $label_map as $label => $key ) {
			$item[ $key ] = self::detail( $details, $label, isset( $item[ $key ] ) ? $item[ $key ] : '' );
		}

		$item['c'] = array();
		foreach ( $record['categories'] as $category ) {
			if ( 'clinics services' === self::normalize( $category ) ) {
				continue;
			}
			$key = self::normalize( $category );
			if ( ! isset( $category_map[ $key ] ) ) {
				$category_map[ $key ] = count( $category_names );
				$category_names[]     = $category;
				$category_ids[]       = 0;
			}
			$item['c'][] = $category_map[ $key ];
		}

		$data['svcRows'][] = $item;
	}

	private static function make_route( $record, $templates ) {
		$template = self::best_template( $record, $templates, 'route' );
		$item     = $template ? $template : array();
		$details  = self::parse_details( $record['description'] );
		$item['s'] = $record['title'];
		$item['r'] = self::detail( $details, 'Route', self::short_description( $record, isset( $item['r'] ) ? $item['r'] : '' ) );
		$item['d'] = self::detail( $details, 'Referral details', isset( $item['d'] ) ? $item['d'] : '' );
		return $item;
	}

	private static function make_intake( $record, $templates ) {
		$template = self::best_template( $record, $templates, 'intake' );
		$item     = $template ? $template : array();
		$details  = self::parse_details( $record['description'] );
		$item['name']  = $record['title'];
		$item['scope'] = self::detail( $details, 'Scope', self::short_description( $record, isset( $item['scope'] ) ? $item['scope'] : '' ) );
		$item['url']   = self::field_or_detail( $record, 'website', $details, 'Website', isset( $item['url'] ) ? $item['url'] : '' );
		$item['phone'] = self::field_or_detail( $record, 'phone', $details, 'Phone', isset( $item['phone'] ) ? $item['phone'] : '' );
		$item['fax']   = self::field_or_detail( $record, 'fax', $details, 'Fax', isset( $item['fax'] ) ? $item['fax'] : '' );
		$item['email'] = self::field_or_detail( $record, 'email', $details, 'Email', isset( $item['email'] ) ? $item['email'] : '' );
		return $item;
	}

	private static function append_form( &$data, $record, $templates ) {
		$template = self::best_template( $record, $templates, 'form' );
		$agency   = $template ? $template['agency'] : self::first_category_except( $record['categories'], array( 'Forms' ) );
		$item     = $template ? $template['item'] : array( 'd' => array() );
		$details  = self::parse_details( $record['description'] );
		$item['name'] = $record['title'];
		$item['desc'] = self::detail( $details, 'Description', self::short_description( $record, isset( $item['desc'] ) ? $item['desc'] : '' ) );
		$item['d']    = self::merge_detail_items( isset( $item['d'] ) ? $item['d'] : array(), $details, array( 'Description' ) );
		$agency_index = self::find_or_add_agency( $data['forms'], $agency );
		$data['forms'][ $agency_index ]['items'][] = $item;
	}

	private static function append_resource( &$data, $record, $templates ) {
		$template = self::best_template( $record, $templates, 'resource' );
		$section  = $template ? $template['section'] : self::resource_section_from_categories( $record['categories'] );
		$group    = $template ? $template['group'] : self::resource_group_from_categories( $record['categories'] );
		$item     = $template ? $template['item'] : array( 'd' => array() );
		$details  = self::parse_details( $record['description'] );
		$item['name'] = $record['title'];
		$item['desc'] = self::detail( $details, 'Description', self::short_description( $record, isset( $item['desc'] ) ? $item['desc'] : '' ) );
		$item['d']    = self::merge_detail_items( isset( $item['d'] ) ? $item['d'] : array(), $details, array( 'Description', 'Last verified' ) );
		$item['lastVerified'] = self::detail( $details, 'Last verified', isset( $item['lastVerified'] ) ? $item['lastVerified'] : '' );
		$item['tags'] = array_values( array_unique( array_merge( isset( $item['tags'] ) ? $item['tags'] : array(), $record['tags'] ) ) );

		$section_index = self::find_or_add_resource_section( $data['resources'], $section, $template ? $template['section_id'] : sanitize_title( $section ) );
		$group_index   = self::find_or_add_resource_group( $data['resources'][ $section_index ]['groups'], $group );
		$data['resources'][ $section_index ]['groups'][ $group_index ]['items'][] = $item;
	}

	private static function make_quick_number( $record, $templates ) {
		$template = self::best_template( $record, $templates, 'quick' );
		$item     = $template ? $template : array();
		$details  = self::parse_details( $record['description'] );
		$item['n']    = $record['title'];
		$item['p']    = self::field_or_detail( $record, 'phone', $details, 'Phone', isset( $item['p'] ) ? $item['p'] : '' );
		$item['note'] = self::detail( $details, 'Note', self::short_description( $record, isset( $item['note'] ) ? $item['note'] : '' ) );
		$item['crit'] = isset( $item['crit'] ) ? (bool) $item['crit'] : in_array( 'urgent', array_map( array( __CLASS__, 'normalize' ), $record['tags'] ), true );
		return $item;
	}

	private static function best_template( $record, $templates, $type ) {
		$key = self::normalize( $record['title'] );
		if ( empty( $templates[ $key ] ) ) {
			return null;
		}
		if ( 1 === count( $templates[ $key ] ) ) {
			return $templates[ $key ][0];
		}

		$best       = null;
		$best_score = -1;
		foreach ( $templates[ $key ] as $candidate ) {
			$score = 0;
			if ( 'specialist' === $type ) {
				$score += self::category_score( $record['categories'], array( $candidate['group'] ) );
				$score += self::text_match_score( self::field_value( $record, 'address' ), isset( $candidate['item']['site'] ) ? $candidate['item']['site'] : '' );
			} elseif ( 'service' === $type ) {
				$score += self::text_match_score( self::field_value( $record, 'address' ), isset( $candidate['addr'] ) ? $candidate['addr'] : '' );
			} elseif ( 'form' === $type ) {
				$score += self::category_score( $record['categories'], array( $candidate['agency'] ) );
			} elseif ( 'resource' === $type ) {
				$score += self::category_score( $record['categories'], array( $candidate['section'], self::strip_count( $candidate['group'] ) ) );
			}
			if ( $score > $best_score ) {
				$best       = $candidate;
				$best_score = $score;
			}
		}
		return $best;
	}

	private static function parse_details( $content ) {
		$text    = html_entity_decode( wp_strip_all_tags( str_replace( array( '<br>', '<br/>', '<br />' ), "\n", $content ) ), ENT_QUOTES, 'UTF-8' );
		$lines   = preg_split( '/\r\n|\r|\n/', $text );
		$details = array();
		foreach ( $lines as $line ) {
			$line = trim( $line );
			if ( '' === $line || false === strpos( $line, ':' ) ) {
				continue;
			}
			list( $label, $value ) = array_map( 'trim', explode( ':', $line, 2 ) );
			if ( '' !== $label && '' !== $value ) {
				$details[ self::normalize( $label ) ] = array( 'label' => $label, 'value' => $value );
			}
		}
		return $details;
	}

	private static function detail( $details, $label, $fallback = '' ) {
		$key = self::normalize( $label );
		return isset( $details[ $key ] ) ? $details[ $key ]['value'] : $fallback;
	}

	private static function field_or_detail( $record, $field, $details, $label, $fallback = '' ) {
		$value = self::field_value( $record, $field );
		return '' !== trim( $value ) ? $value : self::detail( $details, $label, $fallback );
	}

	private static function field_value( $record, $field, $fallback = '' ) {
		return isset( $record['fields'][ $field ] ) && '' !== trim( $record['fields'][ $field ] ) ? trim( $record['fields'][ $field ] ) : $fallback;
	}

	private static function short_description( $record, $fallback = '' ) {
		$value = self::field_value( $record, 'short_description', $record['short_description'] );
		return '' !== trim( $value ) ? trim( $value ) : $fallback;
	}

	private static function merge_detail_items( $base_items, $details, $excluded ) {
		$result = array();
		$used   = array_map( array( __CLASS__, 'normalize' ), $excluded );
		foreach ( $base_items as $base ) {
			$key = self::normalize( isset( $base['l'] ) ? $base['l'] : '' );
			if ( isset( $details[ $key ] ) ) {
				$base = self::detail_item( $base['l'], $details[ $key ]['value'] );
				$used[] = $key;
			}
			$result[] = $base;
		}
		foreach ( $details as $key => $detail ) {
			if ( in_array( $key, $used, true ) ) {
				continue;
			}
			$result[] = self::detail_item( $detail['label'], $detail['value'] );
		}
		return $result;
	}

	private static function detail_item( $label, $value ) {
		if ( preg_match( '#^https?://\S+$#i', $value ) ) {
			return array( 'l' => $label, 'u' => esc_url_raw( $value ), 't' => $value );
		}
		return array( 'l' => $label, 'x' => $value );
	}

	private static function finalize_specialists( &$data ) {
		foreach ( $data['specialists'] as $index => $group ) {
			usort( $group['rows'], array( __CLASS__, 'compare_name' ) );
			$data['specialists'][ $index ]['rows']  = $group['rows'];
			$data['specialists'][ $index ]['count'] = count( $group['rows'] );
		}
		$data['specialists'] = array_values( array_filter( $data['specialists'], array( __CLASS__, 'has_rows' ) ) );
	}

	private static function finalize_services( &$data, $baseline, $category_names ) {
		usort( $data['svcRows'], array( __CLASS__, 'compare_name' ) );
		$sections = array();
		$assigned = array();
		foreach ( $baseline['services'] as $section ) {
			$leaf_indexes = array();
			foreach ( $section['leafs'] as $leaf ) {
				$index = array_search( self::normalize( $leaf ), array_map( array( __CLASS__, 'normalize' ), $category_names ), true );
				if ( false !== $index ) {
					$leaf_indexes[] = (int) $index;
				}
			}
			$section['idx'] = array();
			foreach ( $data['svcRows'] as $row_index => $item ) {
				if ( array_intersect( $leaf_indexes, isset( $item['c'] ) ? $item['c'] : array() ) ) {
					$section['idx'][] = $row_index;
					$assigned[ $row_index ] = true;
				}
			}
			$section['count'] = count( $section['idx'] );
			if ( $section['count'] ) {
				$sections[] = $section;
			}
		}

		$unassigned = array_values( array_diff( array_keys( $data['svcRows'] ), array_keys( $assigned ) ) );
		if ( $unassigned ) {
			$sections[] = array(
				'key'   => 'other',
				'title' => 'Other services',
				'catId' => 0,
				'src'   => 'directory',
				'count' => count( $unassigned ),
				'leafs' => array(),
				'idx'   => $unassigned,
			);
		}
		$data['services'] = $sections;
	}

	private static function finalize_forms_and_resources( &$data ) {
		foreach ( $data['forms'] as &$agency ) {
			usort( $agency['items'], array( __CLASS__, 'compare_name' ) );
		}
		unset( $agency );
		$data['forms'] = array_values( array_filter( $data['forms'], array( __CLASS__, 'has_items' ) ) );

		foreach ( $data['resources'] as &$section ) {
			foreach ( $section['groups'] as &$group ) {
				usort( $group['items'], array( __CLASS__, 'compare_name' ) );
			}
			unset( $group );
			$section['groups'] = array_values( array_filter( $section['groups'], array( __CLASS__, 'has_items' ) ) );
		}
		unset( $section );
		$data['resources'] = array_values( array_filter( $data['resources'], array( __CLASS__, 'has_groups' ) ) );
	}

	private static function build_fax_index( $rows, $baseline ) {
		$result = array();
		foreach ( $rows as $index => $row ) {
			if ( empty( $row['fax'] ) ) {
				continue;
			}
			$result[] = array( 'fax' => $row['fax'], 'd' => preg_replace( '/\D+/', '', $row['fax'] ), 'i' => $index, 'kind' => 'hl' );
		}

		// The designed fax view includes five separately verified intake/form
		// destinations in addition to service-listing fax values.
		foreach ( isset( $baseline['fax'] ) ? $baseline['fax'] : array() as $entry ) {
			if ( isset( $entry['kind'] ) && 'v' === $entry['kind'] ) {
				$result[] = $entry;
			}
		}
		return $result;
	}

	private static function specialist_count( $groups ) {
		$count = 0;
		foreach ( $groups as $group ) {
			$count += count( $group['rows'] );
		}
		return $count;
	}

	private static function specialist_unique_count( $groups ) {
		$unique = array();
		foreach ( $groups as $group ) {
			foreach ( $group['rows'] as $row ) {
				$key = ! empty( $row['_cpso'] ) ? 'cpso:' . $row['_cpso'] : self::normalize( $row['name'] . '|' . ( isset( $row['site'] ) ? $row['site'] : '' ) );
				$unique[ $key ] = true;
			}
		}
		return count( $unique );
	}

	private static function find_or_add_specialist_group( &$groups, $name ) {
		foreach ( $groups as $index => $group ) {
			if ( self::normalize( $group['group'] ) === self::normalize( $name ) ) {
				return $index;
			}
		}
		$groups[] = array( 'group' => $name ? $name : 'Other specialists', 'count' => 0, 'rows' => array() );
		return count( $groups ) - 1;
	}

	private static function find_or_add_agency( &$agencies, $name ) {
		foreach ( $agencies as $index => $agency ) {
			if ( self::normalize( $agency['agency'] ) === self::normalize( $name ) ) {
				return $index;
			}
		}
		$agencies[] = array( 'agency' => $name ? $name : 'Other', 'items' => array() );
		return count( $agencies ) - 1;
	}

	private static function find_or_add_resource_section( &$sections, $title, $id ) {
		foreach ( $sections as $index => $section ) {
			if ( self::normalize( $section['title'] ) === self::normalize( $title ) ) {
				return $index;
			}
		}
		$sections[] = array( 'id' => $id ? $id : 'other', 'title' => $title ? $title : 'Other resources', 'groups' => array() );
		return count( $sections ) - 1;
	}

	private static function find_or_add_resource_group( &$groups, $title ) {
		foreach ( $groups as $index => $group ) {
			if ( self::normalize( self::strip_count( $group['title'] ) ) === self::normalize( self::strip_count( $title ) ) ) {
				return $index;
			}
		}
		$groups[] = array( 'title' => $title ? $title : 'Other', 'items' => array() );
		return count( $groups ) - 1;
	}

	private static function resource_section_from_categories( $categories ) {
		foreach ( $categories as $category ) {
			if ( 0 === strpos( self::normalize( $category ), 'resources ' ) ) {
				return trim( preg_replace( '/^Resources\s*[—-]\s*/u', '', $category ) );
			}
		}
		return 'Other resources';
	}

	private static function resource_group_from_categories( $categories ) {
		foreach ( $categories as $category ) {
			$normalized = self::normalize( $category );
			if ( 'resources' !== $normalized && 0 !== strpos( $normalized, 'resources ' ) ) {
				return $category;
			}
		}
		return 'Other';
	}

	private static function first_category_except( $categories, $excluded ) {
		$excluded = array_map( array( __CLASS__, 'normalize' ), $excluded );
		foreach ( $categories as $category ) {
			if ( ! in_array( self::normalize( $category ), $excluded, true ) ) {
				return $category;
			}
		}
		return '';
	}

	/**
	 * Build one compact map/search row for every published Business Directory
	 * listing. A row does not need a public location to remain discoverable in
	 * the map tab; rows with a supported postal district also receive a marker.
	 *
	 * @param array $records Published directory records.
	 * @param array $fsa_geo Supported postal-district geography.
	 * @return array
	 */
	private static function build_map_rows( $records, $fsa_geo ) {
		$rows             = array();
		$address_index    = array();
		$title_index      = array();
		$supported_fsa    = is_array( $fsa_geo ) ? array_fill_keys( array_keys( $fsa_geo ), true ) : array();

		foreach ( $records as $record ) {
			$row    = self::make_map_row( $record );
			$rows[] = $row;

			if ( empty( $row['fsa'] ) || ! isset( $supported_fsa[ $row['fsa'] ] ) ) {
				continue;
			}
			$address_key = self::map_address_key( $row['geo'] );
			if ( $address_key ) {
				$address_index[ $address_key ][ $row['fsa'] ] = true;
			}
			foreach ( self::map_title_keys( $row['name'] ) as $title_key ) {
				$title_index[ $title_key ][ $row['fsa'] ] = true;
			}
		}

		foreach ( $rows as &$row ) {
			if ( ! empty( $row['fsa'] ) && isset( $supported_fsa[ $row['fsa'] ] ) ) {
				continue;
			}

			$candidates  = array();
			$address_key = self::map_address_key( $row['geo'] );
			if ( $address_key && isset( $address_index[ $address_key ] ) ) {
				$candidates = array_keys( $address_index[ $address_key ] );
			}
			if ( 1 !== count( $candidates ) && ! self::map_address_is_nonpublic( $row['geo'] ) ) {
				$candidates = array();
				foreach ( self::map_title_keys( $row['name'] ) as $title_key ) {
					if ( isset( $title_index[ $title_key ] ) ) {
						$candidates = array_values( array_unique( array_merge( $candidates, array_keys( $title_index[ $title_key ] ) ) ) );
					}
				}
			}
			if ( 1 === count( $candidates ) ) {
				$row['fsa']      = $candidates[0];
				$row['inferred'] = true;
			}
		}
		unset( $row );

		usort( $rows, array( __CLASS__, 'compare_name' ) );
		return $rows;
	}

	/**
	 * Convert one published listing into the compact map-search schema.
	 *
	 * @param array $record Business Directory record.
	 * @return array
	 */
	private static function make_map_row( $record ) {
		$type       = self::record_type( $record['categories'] );
		$details    = self::parse_details( $record['description'] );
		$type_names = array(
			'specialist' => 'Specialist',
			'service'    => 'Clinic or service',
			'intake'     => 'Central intake',
			'route'      => 'Referral route',
			'form'       => 'Form',
			'resource'   => 'Resource',
			'quick'      => 'Quick number',
		);
		$generic = array( 'specialists', 'clinics services', 'referral routes', 'central intake', 'forms', 'resources', 'quick numbers' );
		$cats    = array();
		foreach ( $record['categories'] as $category ) {
			if ( ! in_array( self::normalize( $category ), $generic, true ) ) {
				$cats[] = $category;
			}
		}
		$cats = array_values( array_unique( $cats ) );
		if ( ! $cats ) {
			$cats[] = isset( $type_names[ $type ] ) ? $type_names[ $type ] : 'Directory listing';
		}

		$address = self::field_value( $record, 'address' );
		if ( '' === $address ) {
			$address = self::detail( $details, 'Address', self::detail( $details, 'Location', '' ) );
		}
		$postal = self::field_value( $record, 'zip_code' );
		$phone  = self::field_or_detail( $record, 'phone', $details, 'Phone', '' );
		$web    = self::field_or_detail( $record, 'website', $details, 'Website', '' );
		$short  = self::short_description( $record, '' );
		$body   = wp_strip_all_tags( (string) $record['description'] );
		$search = implode( ' ', array_merge( $cats, $record['tags'], array( $short, wp_html_excerpt( $body, 700, '' ) ) ) );

		return array(
			'wpId'    => (int) $record['id'],
			'kind'    => 'specialist' === $type ? 'spec' : ( 'service' === $type ? 'svc' : 'other' ),
			'type'    => $type,
			'name'    => $record['title'],
			'cat'     => $cats[0],
			'catList' => $cats,
			'phone'   => $phone,
			'web'     => $web,
			'url'     => '',
			'geo'     => $address,
			'meta'    => $address ? $address : ( isset( $type_names[ $type ] ) ? $type_names[ $type ] : 'Directory listing' ),
			'fsa'     => self::postal_district( $postal, $address ),
			'search'  => $search,
		);
	}

	/**
	 * Normalize an address for conservative cross-record postal inference.
	 *
	 * @param string $address Address text.
	 * @return string
	 */
	private static function map_address_key( $address ) {
		$address = (string) $address;
		if ( self::map_address_is_nonpublic( $address ) ) {
			return '';
		}
		$address = preg_replace( '/\b[A-Z]\d[A-Z]\s*\d[A-Z]\d\b/i', ' ', $address );
		$key     = self::normalize( $address );
		$tokens  = array_values( array_filter( explode( ' ', $key ) ) );
		$tokens  = array_values( array_diff( $tokens, array( 'ottawa', 'ontario', 'on', 'canada' ) ) );
		$tokens  = array_map(
			function ( $token ) {
				$abbreviations = array( 'street' => 'st', 'road' => 'rd', 'avenue' => 'ave', 'boulevard' => 'blvd' );
				return isset( $abbreviations[ $token ] ) ? $abbreviations[ $token ] : $token;
			},
			$tokens
		);
		$key     = implode( ' ', $tokens );
		return strlen( $key ) >= 8 ? $key : '';
	}

	private static function map_address_is_nonpublic( $address ) {
		return (bool) preg_match( '/no public|not published|national service|online only|virtual|confidential location/i', (string) $address );
	}

	/**
	 * Return exact and conservative base-title keys for location matching.
	 *
	 * @param string $title Listing title.
	 * @return array
	 */
	private static function map_title_keys( $title ) {
		$keys = array( self::normalize( $title ) );
		$base = preg_replace( '/\s*(?:[—–]|\(|\s-\s).*$/u', '', (string) $title );
		$base = self::normalize( $base );
		if ( $base && strlen( $base ) >= 8 ) {
			$keys[] = $base;
		}
		return array_values( array_unique( array_filter( $keys ) ) );
	}

	private static function postal_district( $postal, $address = '' ) {
		if ( preg_match( '/\b([A-Z]\d[A-Z])\b/i', trim( $postal . ' ' . $address ), $match ) ) {
			return strtoupper( $match[1] );
		}
		return '';
	}

	private static function category_score( $categories, $expected ) {
		$categories = array_map( array( __CLASS__, 'normalize' ), $categories );
		$score      = 0;
		foreach ( $expected as $name ) {
			if ( in_array( self::normalize( self::strip_count( $name ) ), $categories, true ) ) {
				$score += 10;
			}
		}
		return $score;
	}

	private static function text_match_score( $a, $b ) {
		$a = self::normalize( $a );
		$b = self::normalize( $b );
		if ( ! $a || ! $b ) {
			return 0;
		}
		if ( $a === $b ) {
			return 100;
		}
		return false !== strpos( $a, $b ) || false !== strpos( $b, $a ) ? 40 : 0;
	}

	private static function strip_count( $value ) {
		return preg_replace( '/\s*\(\d+\)\s*$/', '', (string) $value );
	}

	public static function normalize( $value ) {
		$value = remove_accents( wp_strip_all_tags( (string) $value ) );
		$value = strtolower( html_entity_decode( $value, ENT_QUOTES, 'UTF-8' ) );
		$value = preg_replace( '/[^a-z0-9]+/', ' ', $value );
		return trim( preg_replace( '/\s+/', ' ', $value ) );
	}

	public static function decode_text( $value ) {
		return html_entity_decode( (string) $value, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	}

	public static function compare_name( $a, $b ) {
		$a_name = isset( $a['name'] ) ? $a['name'] : ( isset( $a['n'] ) ? $a['n'] : '' );
		$b_name = isset( $b['name'] ) ? $b['name'] : ( isset( $b['n'] ) ? $b['n'] : '' );
		return strcasecmp( remove_accents( $a_name ), remove_accents( $b_name ) );
	}

	public static function has_rows( $item ) {
		return ! empty( $item['rows'] );
	}

	public static function has_items( $item ) {
		return ! empty( $item['items'] );
	}

	public static function has_groups( $item ) {
		return ! empty( $item['groups'] );
	}

	public static function invalidate_cache() {
		delete_transient( self::CACHE_KEY );
	}

	public static function maybe_invalidate_deleted_post( $post_id ) {
		if ( 'wpbdp_listing' === get_post_type( $post_id ) ) {
			self::invalidate_cache();
		}
	}

	public static function maybe_invalidate_terms( $object_id, $terms, $tt_ids, $taxonomy ) {
		unset( $terms, $tt_ids );
		if ( in_array( $taxonomy, array( 'wpbdp_category', 'wpbdp_tag' ), true ) && 'wpbdp_listing' === get_post_type( $object_id ) ) {
			self::invalidate_cache();
		}
	}
}
