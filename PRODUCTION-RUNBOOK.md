# Ottawa Primary Care Directory — Production Runbook

Use the exact tested artifact from staging:

- ZIP: `build/ottawa-primary-care-directory-1.0.0.zip`
- Expected SHA-256: `a667d5028c3ebf8666c673a46d87b7ff02912750604af8f4499046a6739bd3c6`
- Shortcode: `[ottawa_primary_care_directory]`

## 1. Pre-deployment checks

1. Take or confirm a current production database and files backup.
2. Confirm the production Business Directory page ID and exact public English/French URLs.
3. Record the page title, slug, publication status, template, parent, author, and current page content.
4. Confirm there are no Business Directory Plugin listings or other pages that still require that plugin. Do not deactivate it if another production page depends on it.
5. Confirm WordPress meets the plugin requirements: WordPress 6.3+ and PHP 7.4+.

## 2. Install without affecting the public page

1. Go to Plugins → Add Plugin → Upload Plugin.
2. Upload `ottawa-primary-care-directory-1.0.0.zip` and activate it.
3. Create a new draft page named **Ottawa Primary Care Directory — Integration Preview**.
4. Keep the default parent-site page template and add exactly:

   ```text
   <!-- wp:shortcode -->
   [ottawa_primary_care_directory]
   <!-- /wp:shortcode -->
   ```

5. Preview the draft in both site languages. Do not publish this QA page.

## 3. Acceptance checks before cutover

Verify all of the following on the draft:

- The site header, footer, navigation, Figtree headings, Roboto body text, colours, link styling, and responsive spacing match the parent WordPress site.
- English and French UI strings follow the current site locale; no separate in-directory language toggle is shown.
- All nine tabs open: Search everything, Referral routes, Map, Specialists, Clinics & services, Fax lookup, Forms, Resources, and Quick numbers.
- Search `cardiology` under Specialists and confirm results appear.
- Search `diabetes` under Clinics & services and confirm results appear.
- Search fax `613-737-8944` and confirm Eastern Ontario MRI Central Intake appears.
- Open Map and confirm markers, tiles, zoom controls, and OpenStreetMap attribution appear.
- Test at approximately 390 px and 1,280 px widths with no horizontal page overflow.
- Check the browser console and network panel for failed directory JSON, JavaScript, CSS, or Leaflet requests.

## 4. Reversible cutover

1. Clone the current production Business Directory page as a draft rollback copy.
2. Record the clone's page ID.
3. Edit the existing public page; do not create a replacement URL.
4. Preserve its title, slug, published status, page template, parent, and navigation relationships.
5. Replace only the page content with the new shortcode block.
6. Save/update the page.
7. Purge the site's page/Varnish/CDN cache if production caching is enabled.

## 5. Public verification

Test logged-in and anonymous sessions:

1. Open the existing English `/business-directory/` URL.
2. Open the translated `/fr/business-directory/` URL.
3. Repeat the acceptance searches and Map check.
4. Confirm the page source loads `ottawa-primary-care-directory/assets/css/directory.css` and `assets/js/directory.js`.
5. Confirm the old Business Directory Plugin interface and assets are absent from this page.
6. Check mobile and desktop widths again.

## 6. Legacy plugin cleanup

Only after public verification, and only if the pre-deployment dependency check found no other consumers:

1. Deactivate **Business Directory Plugin**.
2. Do not delete it during the initial production release window.
3. Recheck both public language URLs and one specialist/fax search.
4. Keep the plugin and rollback page until the organization approves permanent removal.

## 7. Add the public header entry point

1. Open Breakdance → Headers and edit the active header used everywhere.
2. In the Structure panel, expand the Menu Builder and duplicate the existing **Find a service** Menu Link.
3. Set the duplicate to **Referral & Resource Directory** → `/business-directory/` and place it immediately before **Find a service**.
4. Save the header.
5. Use TranslatePress's visual Translation Editor to translate that label to **Répertoire des orientations et des ressources**.
6. Confirm the French header link resolves to `/fr/business-directory/`.
7. Test both links on desktop and mobile. Do not also add the item to Appearance → Menus unless production's active header consumes that WordPress menu.

## Rollback

If the new directory fails:

1. Reactivate Business Directory Plugin if it was deactivated.
2. Restore the original page content from the rollback draft or recorded shortcode/content.
3. Purge production caches.
4. Verify the original directory at the unchanged public URL.

The custom plugin can remain installed and active during rollback; it does nothing unless its shortcode is present on a page.

## Future data refreshes

Treat the latest approved Monica HTML file as authoritative. Rebuild and validate locally:

```bash
python3 tools/build-wordpress-plugin.py
python3 tools/validate-wordpress-plugin.py
```

Increment the plugin version for a production update, generate a new ZIP, record both source and ZIP SHA-256 values, test on staging, and repeat the public acceptance checks before deployment.
