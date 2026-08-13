# Ottawa Primary Care Directory — Staging Change Record

Date: 2026-08-13  
Staging site: https://wordpress-403092-6560255.cloudwaysapps.com/  
Public directory: https://wordpress-403092-6560255.cloudwaysapps.com/business-directory/

## Authoritative source and build

- Source: `Ottawa-Primary-Care-Directory-CLEANED_16.html`
- Source SHA-256: `bccaca84f77b219a599a9a5485d3aeabc9cc651f13758d6315dffa8c5e62b417`
- WordPress plugin: Ottawa Primary Care Directory 1.0.0
- Deployable ZIP: `build/ottawa-primary-care-directory-1.0.0.zip`
- ZIP SHA-256: `a667d5028c3ebf8666c673a46d87b7ff02912750604af8f4499046a6739bd3c6`
- Shortcode: `[ottawa_primary_care_directory]`

The plugin was generated from the Monica source, not from the developer's earlier CSV. It keeps the directory dataset in a versioned static JSON file, scopes all CSS under `.ottrx`, uses the parent site's Breakdance typography and colour variables, and bundles Leaflet locally. OpenStreetMap tiles are requested only after a visitor opens the Map tab.

## Staging changes made

1. Uploaded and activated **Ottawa Primary Care Directory 1.0.0**.
2. Created draft QA page **Ottawa Primary Care Directory — Integration Preview**, page ID `1946`, containing the new shortcode. It remains a draft and does not appear in public navigation.
3. Tested the draft in English and French before cutover.
4. Cloned the existing **Business Directory** page as a rollback copy:
   - public page ID: `1941`
   - rollback draft page ID: `1948`
   - original content: `[businessdirectory]`
5. Replaced only the content of page `1941` with:

   ```text
   <!-- wp:shortcode -->
   [ottawa_primary_care_directory]
   <!-- /wp:shortcode -->
   ```

   The title, slug, published status, default page template, and `/business-directory/` URL were preserved.
6. Deactivated **Business Directory Plugin 6.4.26** after the new page passed public checks. The plugin was not deleted, and its data was not modified or removed.
7. Updated the active Breakdance header **Site Header with Mega Menu** (header ID `252`):
   - duplicated the existing **Find a service** Menu Link so it inherited the established header styling and responsive behavior;
   - changed the duplicate to **Referral & Resource Directory** → `/business-directory/`;
   - placed it immediately before **Find a service** in the top-level header navigation;
   - added the TranslatePress French translation **Répertoire des orientations et des ressources**; TranslatePress localizes the destination to `/fr/business-directory/`.

The standard WordPress **Main Nav** menu was tested first, but the live Breakdance header does not consume that menu. The temporary menu item was removed, leaving the Breakdance header as the single active navigation implementation.

No global theme files, footer templates, users, listings, or unrelated pages/plugins were changed. Available Breakdance and TranslatePress updates were intentionally left untouched.

## Verification completed

- Local generator and dataset validation passed.
- JavaScript syntax validation passed.
- Dataset counts: 785 unique specialists, 2,217 service listings, 1,156 fax entries, 27 service sections, 40 specialist groups in source data, 49 routing entries, 11 resource sections, and 4 form agencies.
- English and French public routes load within the existing site header and footer.
- English title: **Referral & Resource Directory**.
- French title: **Répertoire des orientations et des ressources**.
- Cardiology specialist search: 51 displayed table rows.
- Diabetes service search: 107 displayed table rows.
- Fax search `613-737-8944`: one correct Eastern Ontario MRI Central Intake result.
- Map: 2,527 mappable records represented by 52 district markers; local Leaflet assets and OpenStreetMap attribution loaded correctly.
- Responsive check at 390 px: no horizontal page overflow.
- Desktop check at 1,280 px: no horizontal page overflow.
- Final public browser console: no warnings or errors from the directory.
- Anonymous cache-busting request returned the new plugin assets and no Business Directory Plugin assets.
- A second full public acceptance run on 2026-08-13 reconfirmed all nine sections, the known-result searches, 52 map circles, 12 loaded map tiles, English/French routes, 390 px and 1,280 px layouts, the feedback email link, valid public JSON, and a clean browser console.

## Current public access

The page is public at `/business-directory/` and `/fr/business-directory/`. The active Breakdance header now provides a visible, top-level link from the homepage and every page using that header. English and French labels and destinations were verified through anonymous cache-bypassing requests.

## Rollback on staging

Fast rollback:

1. Edit page `1941` and restore its content to the original shortcode block using `[businessdirectory]`.
2. Reactivate **Business Directory Plugin 6.4.26** from Plugins → Installed Plugins.
3. Verify `/business-directory/` in English and French.

The draft clone at page `1948` is an additional copy of the pre-integration page. The Ottawa Primary Care Directory plugin can remain active during rollback because it has no effect on pages that do not contain its shortcode.
