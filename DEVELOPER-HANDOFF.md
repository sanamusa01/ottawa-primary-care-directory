# Ottawa Primary Care Directory — Developer Handoff

## What to provide to the developer

Provide either or both of these artifacts:

1. **Deployable WordPress plugin**: `build/ottawa-primary-care-directory-1.0.0.zip`
2. **Full source handoff**: `build/ottawa-primary-care-directory-source-1.0.0.zip`

Verify the hashes before deployment:

```bash
shasum -a 256 build/ottawa-primary-care-directory-1.0.0.zip
shasum -a 256 build/ottawa-primary-care-directory-source-1.0.0.zip
```

The deployable plugin hash is recorded in `STAGING-CHANGELOG.md`. Both final archive hashes are recorded in `build/SHA256SUMS.txt`. The full source archive contains the authoritative HTML, generator/validator, generated plugin, deployment runbook, and staging record.

## Repository structure

```text
Monica/
├── Ottawa-Primary-Care-Directory-CLEANED_16.html  # authoritative source
├── ottawa-primary-care-directory/                 # deployable plugin source
│   ├── ottawa-primary-care-directory.php          # shortcode and asset loading
│   ├── templates/directory.php                     # accessible application shell
│   ├── assets/css/directory.css                    # scoped theme integration
│   ├── assets/js/directory.js                      # search, tabs, map, bilingual UI
│   ├── assets/data/directory.json                  # generated directory dataset
│   └── vendor/leaflet/                             # locally bundled map library
├── tools/
│   ├── build-wordpress-plugin.py
│   ├── build-plugin-preview.py
│   └── validate-wordpress-plugin.py
├── STAGING-CHANGELOG.md
├── PRODUCTION-RUNBOOK.md
└── DEVELOPER-HANDOFF.md
```

The custom integration does not import listings into Business Directory Plugin and does not require listing-owner email addresses. It renders the authoritative dataset through `[ottawa_primary_care_directory]`.

## Add it to an existing WordPress codebase

If the production WordPress codebase tracks `wp-content/plugins` in Git:

1. Copy the complete `ottawa-primary-care-directory/` directory to:

   ```text
   wp-content/plugins/ottawa-primary-care-directory/
   ```

2. Commit the directory without changing its generated assets:

   ```bash
   git add wp-content/plugins/ottawa-primary-care-directory
   git commit -m "Add Ottawa Primary Care Directory"
   ```

3. Deploy through the website's normal pipeline.
4. Activate after deployment:

   ```bash
   wp plugin activate ottawa-primary-care-directory
   ```

If WordPress plugins are not stored in the code repository, use the tested ZIP instead:

```bash
wp plugin install /path/to/ottawa-primary-care-directory-1.0.0.zip --activate
```

The equivalent UI path is WordPress Admin → Plugins → Add Plugin → Upload Plugin.

## Integrate it into the production page

1. Follow the pre-deployment and backup checks in `PRODUCTION-RUNBOOK.md`.
2. Create a draft QA page using the production site's normal page template.
3. Add this exact page content:

   ```html
   <!-- wp:shortcode -->
   [ottawa_primary_care_directory]
   <!-- /wp:shortcode -->
   ```

4. Test English, French, known-result searches, Map, mobile, and desktop on the draft.
5. Clone/back up the existing production Business Directory page.
6. Replace only the existing page's content with the shortcode block. Preserve its title, slug, template, status, parent, and menu relationships.
7. Purge page/Varnish/CDN caches and repeat public tests in an anonymous browser.
8. Deactivate the legacy Business Directory Plugin only after confirming that no other production content uses it. Keep it installed during the rollback window.

## Add public navigation

Staging implements the public entry point in the active Breakdance **Site Header with Mega Menu** (staging header ID `252`), not in WordPress Appearance → Menus. Replicate this in the production header that is active everywhere:

1. Open Breakdance → Headers and edit the active mega-menu header.
2. In the Structure panel, expand **Menu Builder**.
3. Duplicate the existing **Find a service** Menu Link so the new item inherits the established styling and mobile behavior.
4. Set the duplicate's text to **Referral & Resource Directory** and its link to `/business-directory/`.
5. Place it immediately before **Find a service** and save the header.
6. In TranslatePress's visual Translation Editor, translate the new string to **Répertoire des orientations et des ressources**. TranslatePress should localize its destination to `/fr/business-directory/`.
7. Verify the header on the English and French homepages, click both links, and check desktop and mobile navigation.

Do not add a second copy to Appearance → Menus unless the production header actually uses a WordPress Menu element. A button on the **Primary care** page can be added later as a secondary entry point.

## Updating the dataset later

Replace the authoritative HTML file with the newly approved Monica version, then run:

```bash
python3 tools/build-wordpress-plugin.py
python3 tools/validate-wordpress-plugin.py
```

Review count changes, increment the plugin version, build a new versioned ZIP, test on staging, and deploy through the same process. Do not hand-edit generated JSON unless the source file is corrected as well.
