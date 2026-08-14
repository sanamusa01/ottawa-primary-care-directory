# Ottawa Primary Care Directory — Developer Handoff

## Decision

The staging directory was migrated away from the bespoke Ottawa/Leaflet plugin and onto **Business Directory Plugin 6.4.26**, the public plugin Fred had already installed from WordPress.org.

This removes the custom PHP/JavaScript/Leaflet application from the active runtime. The public plugin owns listing storage, search, categories, CSV import/export, and backend editing. Breakdance owns presentation through a no-code single-listing template.

The old custom plugin is deactivated but retained temporarily for rollback. It should not be deployed as the production solution.

## Files to review

```text
Monica/
├── Ottawa-Primary-Care-Directory-CLEANED_16.html
├── migration/business-directory-plugin/
│   ├── ottawa-primary-care-directory-bdp.csv
│   ├── ottawa-primary-care-directory-bdp-pilot.csv
│   ├── manifest.json
│   ├── ADMIN-GUIDE.md
│   └── API.md
├── tools/build-business-directory-import.py
├── PRODUCTION-RUNBOOK.md
├── STAGING-CHANGELOG.md
└── ottawa-primary-care-directory/       # legacy rollback only
```

## WordPress configuration required

1. Install/activate `business-directory-plugin` from WordPress.org.
2. In Directory → Directory Content → Form Fields:
   - make Email optional;
   - add optional **Fax**, type **Phone Number**, shortname `fax`;
   - show Fax in excerpts and single listings and include it in search.
3. Configure:
   - listings per page: 25;
   - comments: disabled;
   - new/imported listing status: Published;
   - edited listing status: Published;
   - labels: Directory entry / Directory entries / Referral & Resource Directory;
   - frontend submissions: disabled;
   - Submit and Manage buttons: hidden;
   - listing contact form: disabled.
4. Import `ottawa-primary-care-directory-bdp.csv` once into an empty directory with:
   - comma column separator;
   - semicolon category separator;
   - auto-create missing categories;
   - email notifications disabled;
   - batch size 40 (reduce if the host times out).
5. Use `[businessdirectory]` on the existing `/business-directory/` page. Preserve the page ID, title, slug, template, publication status, translations, and menu relationships.
6. In Breakdance, create a template applying only to the **Referral & Resource Directory** post type. Its content section contains:
   - Post Title;
   - Shortcode: `[businessdirectory-details]`.
7. Keep the existing site-wide header item **Referral & Resource Directory** → `/business-directory/` and verify TranslatePress resolves the French route.
8. Enable automatic updates for Business Directory Plugin, subject to the production team's managed-update policy.

## Data storage

Runtime data is in the WordPress database, not in this GitHub repository:

- `wp_posts`: one row per listing with `post_type = wpbdp_listing`;
- `wp_postmeta`: Business Directory field values such as phone, fax, email and address;
- `wp_terms`, `wp_term_taxonomy`, `wp_term_relationships`: directory categories and tags;
- Business Directory's own tables: plans/payments and plugin configuration where applicable;
- `wp_options`: plugin settings.

`wp_` is the default prefix; the deployed database may use another prefix. The CSV in GitHub is a migration/source-control artifact, not a live database.

## Maintenance model

- Routine changes: WordPress Admin → Directory → Directory Content → Listings → search → Edit → Save.
- New record: Directory → Directory Content → Listings → Add New Listing → complete the fields/category → Publish.
- Bulk update: Directory → Import & Export → **Export**, include the plugin-generated unique IDs, edit the exported CSV without changing those IDs, then re-import.

Do not use the clean-import CSV for an in-place refresh. Its deterministic source IDs are useful for provenance, but Business Directory Plugin 6.4.26 did not treat them as update keys when the same clean file was re-imported in staging. Only a plugin export supplies the canonical update identifiers for that site.

## Security and WordPress standards

The active solution is the maintained WordPress.org package rather than our custom plugin. Its listing model uses WordPress custom post types, taxonomies, capabilities and standard admin/REST surfaces. WordPress.org publication is not a substitute for Fred's normal production code/security review, but there is no longer any bespoke Leaflet runtime to maintain.

The staging site enables auto-updates for Business Directory Plugin. Production should follow the developer's established managed-update, backup and staging-validation policy.

## Map limitation

Business Directory Plugin Lite does not provide the former Leaflet/OpenStreetMap map. The publisher's Maps module is a paid add-on and uses Google Maps/API keys. No license, paid module, or API key was purchased or added. If a map remains a requirement, Fred should choose either the supported paid module or an independently approved directory plugin after testing TranslatePress and location requirements.
