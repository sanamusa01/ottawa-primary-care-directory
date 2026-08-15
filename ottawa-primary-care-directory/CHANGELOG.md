# Changelog

## 2.2.0 — 2026-08-14

- Made **All locations** the explicit default for Clinics & Services so all
  published service records appear unless a visitor narrows the scope.
- Deduplicated the all-sections Clinics & Services view while retaining every
  listing in each relevant section.
- Removed record totals from the main Specialists, Clinics & Services, and Fax
  Lookup tab labels, from unfiltered specialist/service panels, and from map
  filter suggestions/segments.
- Removed the requested map coverage statement from the visible interface.
- Added Dr. Danielle Gervais to the Family Medicine specialist group using the
  same public fields as the existing physician roster.

## 2.1.6 — 2026-08-14

- Completed map autocomplete selection on click so the event cannot be redirected to a filter beneath the suggestion list.

## 2.1.5 — 2026-08-14

- Added a first guard around map autocomplete pointer handling; superseded by
  the completed click-event handling in 2.1.6.

## 2.1.4 — 2026-08-14

- Added an explicit first autocomplete choice for all records matching the
  typed map search, preventing a narrow legacy category from hiding broader
  Resource results with the same term.

## 2.1.3 — 2026-08-14

- Counted the newly supported adjacent postal district in the map coverage
  metadata as well as in the rendered markers.

## 2.1.2 — 2026-08-14

- Added the adjacent J8Z district needed by the verified Gatineau clinic.
- Normalized common street abbreviations when matching a resource address to a
  uniquely located published clinic record.
- Prevented title-based location inference when a resource explicitly states
  that its location is private, unpublished, virtual, or not open to walk-ins.

## 2.1.1 — 2026-08-14

- Removed nonessential per-listing permalink generation from the bulk REST
  transformation after staging exposed a WordPress warning in that context.

## 2.1.0 — 2026-08-14

- Made every published Business Directory listing searchable from the Map tab,
  rather than limiting map search to Specialists and Clinics & Services.
- Added markers for Resources and other records when they contain a supported
  public postal district.
- Added a separate results view for online, confidential-location, and
  addressless records that cannot honestly receive a physical marker.
- Added conservative postal-district inference when the same title or street
  address has a unique known location elsewhere in the published directory.
- Added a Resources & other map filter and complete category suggestions.

## 2.0.4 — 2026-08-14

- Prevented HTML entity text from being double-escaped in map filter labels.

## 2.0.3 — 2026-08-14

- Decode WordPress HTML entities in listing titles, categories, tags, and form
  field values before presenting them in the escaped public interface.

## 2.0.2 — 2026-08-14

- Restored the fax lookup's original model: one searchable entry per service
  plus the five separately verified intake/form destinations.

## 2.0.1 — 2026-08-14

- Restored cross-specialty roster membership while retaining one editable
  WordPress post per unique physician.
- Restored separate fax-index entries when one service publishes multiple fax
  numbers.

## 2.0.0 — 2026-08-14

- Converted the former standalone directory into a read-only presentation
  adapter for Business Directory Plugin.
- Added the public `/wp-json/opcd/v1/directory` endpoint.
- Made published WordPress listings the source of truth for titles, contact
  fields, descriptions, categories, tags, additions, deletions, and status.
- Restored the complete original tabbed interface, filters, fax lookup, forms,
  resources, quick numbers, feedback links, and bilingual controls.
- Restored the locally bundled Leaflet/OpenStreetMap postal-district map.
- Added five-minute response caching with automatic invalidation on directory
  listing and taxonomy changes.
- Declared Business Directory Plugin as a WordPress plugin dependency.
- Kept the adapter strictly read-only: it contains no public write routes,
  submissions, account handling, or custom database tables.

## 1.0.0 — 2026-08-13

- Initial WordPress integration generated from the latest Monica HTML source.
- Separated the large JSON dataset from WordPress page content.
- Added a shortcode-based integration for the existing Breakdance page.
- Mapped directory styling to the Ottawa OHT-ÉSO Breakdance design system.
- Integrated language selection with the WordPress/TranslatePress locale.
- Removed hard-coded local file links.
- Bundled Leaflet locally and retained OpenStreetMap attribution and fallback.
