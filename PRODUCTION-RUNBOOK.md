# Ottawa Primary Care Directory — Production Runbook

This runbook reproduces the tested hybrid staging implementation. It does not
authorize production work; the production owner should execute it after review.

## 1. Preflight and backup

1. Back up the production database and `wp-content`; verify restore access.
2. Record the current `/business-directory/` page ID, content, slug, template,
   status, translations, and global menu/header relationships.
3. Export existing Business Directory data if production already contains it.
4. Confirm WordPress 6.3+, PHP 7.4+, Breakdance, TranslatePress, and Business
   Directory compatibility.
5. Review the adapter PHP/JS/CSS and locally bundled Leaflet 1.9.4.
6. Perform the cutover in a maintenance window with cache/CDN controls ready.

## 2. Configure the content engine

1. Install and activate Business Directory Plugin.
2. Apply every field and setting in `DEVELOPER-HANDOFF.md`.
3. Run the seven-row pilot in **Test Import** mode; require 7 accepted / 0 rejected.
4. Import the 3,520-row full CSV exactly once into an empty directory.
5. Confirm the published total is 3,520 before changing the public page.

## 3. Install the presentation adapter

1. Upload `build/ottawa-directory-presentation-adapter-2.2.0.zip`.
2. Confirm WordPress reports Business Directory Plugin as its dependency.
3. Activate **Ottawa Directory Presentation Adapter**.
4. Request `/wp-json/opcd/v1/directory` and require HTTP 200,
   `X-OPCD-Source: business-directory-plugin`, and the expected counts.

## 4. Reversible page cutover

1. Preserve the current page content/revision at the unchanged public URL.
2. Replace only the page content with:

   ```html
   <!-- wp:shortcode -->
   [ottawa_primary_care_directory]
   <!-- /wp:shortcode -->
   ```

3. Preserve page ID, title, slug, status, template, author, parent, translations,
   and menu/header relationships.
4. Keep **Referral & Resource Directory** → `/business-directory/` in the
   active global header.
5. Purge WordPress, Varnish, and CDN caches.

## 5. Acceptance tests

- Business Directory REST: HTTP 200 and `X-WP-Total: 3520`.
- Adapter REST: HTTP 200; 786 unique specialists, 820 specialty appearances,
  2,217 services, 49 routes, 9 intakes, 7 forms, 435 resources, 17 quick
  numbers, and 1,156 fax entries.
- Parent header/footer and Ottawa styling appear on `/business-directory/`.
- Every tab renders: Search Everything, Referral Routes, Map, Specialists,
  Clinics & Services, Fax Lookup, Forms, Resources, Quick Numbers.
- Search `Mitra Abaeian` returns one result with `613 830-1771`.
- Fax search `613-737-8944` returns Eastern Ontario MRI Central Intake.
- Map shows Ottawa postal-district circles, filtering, directions,
  Leaflet attribution, and OpenStreetMap attribution.
- Adapter metadata reports 3,520 searchable listings, with 2,583 represented by supported
  public postal-location markers and 937 in the separate no-public-location
  results group.
- Typing `abortion` offers **All matching listings for “abortion”** as the first
  suggestion without a visible count on its right; clicking it retains every
  matching record.
- Selecting **Pregnancy options & abortion — what each service states** shows
  14 results: 11 mapped and 3 explicitly listed without a public map location.
- Specialist specialty/language and service section/category/location filters work.
- Clinics & Services defaults to **All locations**, shows all 2,217 unique
  records, and retains the narrower Ottawa-only and outside-Ottawa choices.
- Specialist, Clinics & Services, and Fax Lookup tab labels do not expose
  totals; the unfiltered specialist/service panels do not repeat aggregate
  totals either.
- `Dr. Danielle Gervais` returns one Family Medicine record with no middle name.
- English/French interface controls work; `/fr/business-directory/` retains the
  French parent navigation.
- Feedback links open a correction email that warns against patient information.
- Mobile and desktop layouts have no horizontal overflow.
- No browser console errors occur during tab/map interaction.
- WordPress administrators can search, edit, add, publish, unpublish, and delete
  records through **Directory → Directory Content → Listings**.
- Anonymous users see no Edit/Delete controls or public mutation endpoints.

## 6. Rollback

1. Restore the prior page revision/content at the unchanged URL.
2. Deactivate **Ottawa Directory Presentation Adapter** if the rollback no
   longer uses its shortcode.
3. Leave Business Directory listings intact until the problem is understood.
4. Purge caches and repeat the previous implementation's smoke tests.
5. The pre-hybrid version is retained in
   `build/rollback-ottawa-primary-care-directory-1.0.0.zip`.

## Ongoing maintenance

- Content: WordPress administrators through Business Directory.
- Business Directory updates: production team's managed plugin process.
- Adapter compatibility: test after WordPress, PHP, Breakdance, TranslatePress,
  or Business Directory upgrades.
- Leaflet: review for supported releases/security advisories at least quarterly
  and before major production upgrades.
- Data: test bulk exports/imports on staging; never import the clean CSV over a
  populated directory.
