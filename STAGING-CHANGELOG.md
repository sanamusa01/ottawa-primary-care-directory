# Ottawa Primary Care Directory — Staging Change Record

Date: 2026-08-14

Staging directory: https://wordpress-403092-6560255.cloudwaysapps.com/business-directory/

## Final state

- Content engine: **Business Directory Plugin 6.4.26**, active
- Presentation: **Ottawa Directory Presentation Adapter 2.0.4**, active
- Published listings: **3,519**
- Public page ID: `1941`
- Public shortcode: `[ottawa_primary_care_directory]`
- Adapter endpoint: `/wp-json/opcd/v1/directory`
- Business Directory auto-updates: enabled on staging
- Production site: unchanged

## Changes made

1. Activated the already-installed Business Directory Plugin.
2. Made Email optional and added searchable optional Fax (`fax`).
3. Configured published defaults, 25 listings/page, comments off, directory
   labels, administrator-only content changes, no public Submit/Manage buttons,
   and no listing-owner contact form.
4. Generated and imported the latest 3,519-record Monica dataset.
5. Created a Breakdance single-listing template for direct Business Directory
   detail URLs.
6. Initially tested the plugin's standard `[businessdirectory]` output; it
   preserved the data but did not preserve the designed interface or map.
7. Converted the former standalone plugin into **Ottawa Directory Presentation
   Adapter 2.0.4**, a read-only layer powered by published Business Directory
   listings.
8. Replaced the page shortcode with `[ottawa_primary_care_directory]` while
   preserving its URL, title, page ID, template, status, and header link.
9. Restored Search Everything, Referral Routes, the Leaflet/OpenStreetMap map,
   Specialists, Clinics & Services, Fax Lookup, Forms, Resources, Quick
   Numbers, English/French controls, feedback links, filters, cards, tables,
   badges, verification notices, and responsive behavior.
10. Added the read-only `/wp-json/opcd/v1/directory` transformation endpoint,
    five-minute caching, and save/delete/taxonomy cache invalidation.
11. Restored cross-specialty physician appearances and the original 1,156-entry
    fax lookup.
12. Left the existing global header link `/business-directory/` in place.

No paid module, Google Maps key, user account, unrelated page, footer, or
production site was changed.

## Verified counts

| Item | Count |
|---|---:|
| Unique specialists | 785 |
| Specialist specialty appearances | 819 |
| Clinics & services | 2,217 |
| Referral routes | 49 |
| Central intakes | 9 |
| Forms | 7 |
| Resources | 435 |
| Quick numbers | 17 |
| Fax lookup | 1,156 |
| Published WordPress listings | 3,519 |

## Verification results

- Business Directory REST total: 3,519.
- Adapter REST: HTTP 200, expected counts, read-only GET, published records only.
- Parent header/footer and design tokens render correctly.
- Search `Mitra Abaeian`: one result with correct specialty, location, and phone.
- Map: Leaflet and OpenStreetMap load with 2,527 mapped specialty/service
  appearances, postal-district circles, filters, and area counts.
- Specialists: 785 unique physicians, 819 specialty appearances, 39 populated
  groups, specialty and language filters.
- Fax `613-737-8944`: Eastern Ontario MRI Central Intake.
- Forms, Resources, Quick Numbers, feedback links, and English/French controls work.
- Browser console: no errors or warnings during final interaction tests.
- HTML entities in imported WordPress titles are decoded before safe rendering.

## Import recovery record

During earlier validation, 7,045 pilot/duplicate directory posts were moved to
normal WordPress Trash. They are not published and Trash was not emptied. After
backup and acceptance, the developer may permanently remove only those trashed
`wpbdp_listing` posts.

For future bulk updates, export from the target site with plugin-generated
unique IDs and re-import the edited export. Do not re-run the clean CSV over a
populated directory.

## Maintenance responsibility

Business Directory Plugin remains the supported data engine. The active Ottawa
adapter is custom, read-only presentation code and bundles Leaflet 1.9.4. The
production developer must review the adapter and own compatibility/security
updates for the adapter and Leaflet. This is the explicit tradeoff required to
retain the complete designed experience.
