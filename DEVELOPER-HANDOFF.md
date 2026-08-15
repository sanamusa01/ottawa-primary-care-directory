# Ottawa Primary Care Directory — Developer Handoff

## Final architectural decision

Staging uses **Business Directory Plugin 6.4.26** as the maintained content and
administration engine, plus **Ottawa Directory Presentation Adapter 2.2.0** as
a read-only public presentation layer.

This hybrid approach preserves the backend Fred requested while restoring the
complete designed experience. Business Directory owns all editable listings;
the adapter does not accept submissions or write to the database.

```text
WordPress administrator
        │ edits
        ▼
Business Directory Plugin (`wpbdp_listing` posts and fields)
        │ public read-only transformation
        ▼
Ottawa presentation adapter (`/wp-json/opcd/v1/directory`)
        │
        ▼
Original tabs, search, filters, map, forms, resources and bilingual UI
```

## Files to review

```text
Monica/
├── Ottawa-Primary-Care-Directory-CLEANED_16.html
├── ottawa-primary-care-directory/
│   ├── ottawa-primary-care-directory.php
│   ├── includes/class-opcd-bdp-data-adapter.php
│   ├── templates/directory.php
│   ├── assets/css/directory.css
│   ├── assets/js/directory.js
│   ├── assets/data/directory.json
│   └── vendor/leaflet/
├── migration/business-directory-plugin/
├── tools/
├── PRODUCTION-RUNBOOK.md
└── STAGING-CHANGELOG.md
```

## WordPress configuration

1. Install and activate `business-directory-plugin` from WordPress.org.
2. In **Directory → Directory Content → Form Fields**:
   - make Email optional;
   - add optional **Fax**, type **Phone Number**, shortname `fax`;
   - show and search the Fax field.
3. Configure 25 listings per page, comments disabled, Published defaults,
   directory-specific labels, frontend submissions disabled, Submit/Manage
   buttons hidden, and the listing contact form disabled.
4. Import `migration/business-directory-plugin/ottawa-primary-care-directory-bdp.csv`
   once into an empty directory: comma columns, semicolon categories,
   auto-create categories, notifications off, batch size 40.
5. Install and activate `build/ottawa-directory-presentation-adapter-2.2.0.zip`.
   WordPress will treat Business Directory Plugin as a required dependency.
6. Use `[ottawa_primary_care_directory]` on the existing
   `/business-directory/` page. Preserve the page ID, slug, status, template,
   translations, and menu relationships.
7. Keep the existing site-wide header item **Referral & Resource Directory** →
   `/business-directory/`.

The existing Breakdance single-listing template can remain for direct Business
Directory detail URLs. The purpose-built main directory is rendered by the
adapter inside the parent page template.

## How the adapter works

- Queries only published `wpbdp_listing` posts.
- Reads Business Directory form values through its public field API.
- Uses the bundled JSON only for presentation taxonomy, map geography,
  cross-specialty relationships, and verified source metadata.
- Overlays current WordPress titles, descriptions, phone/fax/email/website,
  addresses, categories, tags, additions, deletions, and publication status.
- Exposes one public GET route: `/wp-json/opcd/v1/directory`.
- Caches the transformed result for five minutes and invalidates the cache when
  a listing is saved, deleted, recategorized, or retagged.
- Registers no public write route and creates no database tables.

### Map coverage model

The endpoint includes one compact `mapRows` entry for every published Business
Directory listing, not only specialists and clinics. The current staging
payload contains 3,520 searchable rows: 2,583 have a supported public postal
location and contribute to district markers, while 937 are available through
the clearly labelled **records without a public map location** result group.
Resources with an explicit confidential, unpublished, virtual, or no-walk-in
location are never assigned a guessed marker.

For regression testing, typing `abortion` must offer **All matching listings
for “abortion”** before narrower category matches, without a count displayed at
the right of the suggestion. The curated **Pregnancy
options & abortion — what each service states** category contains 14 records:
11 mapped and 3 without a public map location.

## Data storage

Live content remains in the WordPress database:

- `wp_posts`: `post_type = wpbdp_listing`;
- `wp_postmeta`: Business Directory field values;
- `wp_terms`, `wp_term_taxonomy`, `wp_term_relationships`: categories/tags;
- Business Directory tables/options: plan and plugin configuration;
- `wp_options`: the adapter's short-lived WordPress transient when no external
  object cache is configured.

The database prefix may differ from `wp_`. The CSV and bundled JSON are
migration/presentation artifacts, not a second administrator-maintained live
database.

## Administrator maintenance

- Existing record: **Directory → Directory Content → Listings → Edit → Update**.
- New record: **Directory → Directory Content → Listings → Add New Listing**.
- Bulk update: export with Business Directory's generated unique IDs, preserve
  those IDs, edit, test on staging, and re-import.

The adapter prioritizes structured Phone, Fax, Email, Website, Address and ZIP
fields. Labelled Description lines such as `Languages:`, `Eligibility:` and
`How to access / refer:` populate specialized card fields.

Do not re-run the clean-import CSV over populated data. Business Directory
6.4.26 casts `sequence_id` as an integer; the original deterministic text IDs
were therefore not safe update keys. Use only IDs exported by the target site.

## Security and maintenance review

Business Directory Plugin remains the supported content engine and should
follow the production team's managed-update policy. The adapter is custom but
has a deliberately narrow security surface:

- read-only public data;
- published posts only;
- no authentication, account, payment, upload, submission, or mutation code;
- WordPress escaping and REST APIs;
- no custom SQL or custom database tables.

The adapter bundles Leaflet 1.9.4 and loads OpenStreetMap tiles only after a
visitor opens the Map tab. WP Expert should review the adapter before
production and identify the owner/cadence for Leaflet and WordPress compatibility
updates. WordPress.org publication of the data plugin is not a substitute for
this site-specific code review.

## Staging cleanup note

During import validation, 7,045 pilot/duplicate `wpbdp_listing` posts were moved
to normal WordPress Trash; none are published. After backup and acceptance, the
developer may permanently remove only those trashed directory posts. The live
published set is 3,520.
