# Ottawa Primary Care Directory — Production Runbook

This runbook migrates production to the same public-plugin implementation tested in staging.

## 1. Preflight and backup

1. Take a production database and files backup and confirm restoration access.
2. Record the current `/business-directory/` page ID, content, slug, template, status, translations and menu/header relationships.
3. Export any existing Business Directory Plugin listings if production already contains data.
4. Confirm Business Directory Plugin and Breakdance versions are compatible with the production WordPress/PHP versions.
5. Perform the work in a maintenance window and keep production caches/CDN controls available.

## 2. Configure Business Directory Plugin

1. Install/activate the public `business-directory-plugin` package.
2. Apply every setting and field listed in `DEVELOPER-HANDOFF.md`.
3. Run the seven-row pilot file in **Test Import** mode. Require 7 accepted / 0 rejected.
4. If the production directory is empty, import the full 3,519-row CSV exactly once.
5. Verify the published listing total is 3,519 before changing the public page.

## 3. Theme integration

1. Create a Breakdance template named **Single Directory Entry**.
2. Apply it only to the **Referral & Resource Directory** post type.
3. Add one section containing:
   - Post Title;
   - a Shortcode element with `[businessdirectory-details]`.
4. Use the site's global Breakdance section/typography settings; do not add a separate frontend theme framework.
5. Test a listing detail page before publishing the directory page.

## 4. Reversible page cutover

1. Clone or otherwise preserve the current directory page as an unpublished rollback copy.
2. Edit the existing public page; do not create a replacement URL.
3. Preserve its title, slug, status, template, parent and translations.
4. Replace only the page content with:

   ```html
   <!-- wp:shortcode -->
   [businessdirectory]
   <!-- /wp:shortcode -->
   ```

5. Confirm the active Breakdance header contains **Referral & Resource Directory** → `/business-directory/` and the French route works.
6. Purge WordPress, Varnish and CDN caches.

## 5. Acceptance tests

- `GET /wp-json/wp/v2/wpbdp_listing?per_page=1` returns HTTP 200 and `X-WP-Total: 3519`.
- `/business-directory/` loads inside the parent header/footer.
- Search `Mitra Abaeian` returns exactly one result.
- The result displays phone `613 830-1771` and fax `613 837-3781`.
- Its detail page displays the correct title, category, description, phone, fax and parent-site footer.
- Public Add/Manage buttons and the contact form are absent.
- An anonymous request does not expose Edit/Delete actions.
- `/fr/business-directory/` loads and preserves the French header/navigation.
- Mobile and desktop layouts have no horizontal overflow.
- WordPress Admin → Directory → Directory Content → Listings exposes searchable/editable records.

## 6. Retire the old custom plugin

After all tests pass, deactivate **Ottawa Primary Care Directory**. Do not delete it until the organization accepts production and the rollback window ends. Enable/confirm the production team's update policy for Business Directory Plugin.

## Rollback

1. Restore the saved page content or rollback clone at the unchanged public URL.
2. Reactivate the prior custom plugin only if the rollback content uses `[ottawa_primary_care_directory]`.
3. Purge caches and repeat the prior implementation's smoke tests.
4. Do not delete imported Business Directory listings during rollback; hide/deactivate the public integration until the cause is understood.

## Later data changes

- Single record: edit in WordPress Admin; see `migration/business-directory-plugin/ADMIN-GUIDE.md`.
- Bulk update: export from the target site with Business Directory's unique IDs, edit the export, test it on staging, then re-import.
- Complete rebuild: regenerate the clean-import CSV, import it only into an empty directory/database copy, and test before cutover.
