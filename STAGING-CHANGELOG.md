# Ottawa Primary Care Directory — Staging Change Record

Date: 2026-08-14

Staging: https://wordpress-403092-6560255.cloudwaysapps.com/

Directory: https://wordpress-403092-6560255.cloudwaysapps.com/business-directory/

## Final state

- Active directory engine: **Business Directory Plugin 6.4.26** (WordPress.org)
- Public listings: **3,519**
- Public page ID: `1941`
- Public page shortcode: `[businessdirectory]`
- Breakdance listing template: **Single Directory Entry**, ID `12517`
- Superseded **Ottawa Primary Care Directory 1.0.0**: deactivated, not deleted
- Business Directory Plugin auto-updates: enabled on staging

## Changes made

1. Activated the already-installed public Business Directory Plugin.
2. Made the plugin's Email field optional to accept legitimate records without email addresses.
3. Added optional **Fax** as a Phone Number field (`fax`), visible in excerpts/listings and searchable.
4. Configured 25 listings per page, no comments, Published defaults and directory-specific labels.
5. Disabled frontend submissions, hid Submit/Manage buttons and disabled the listing-owner contact form. Admins remain able to add/edit records in the backend.
6. Generated a seven-row pilot and a validated 3,519-row import from the latest Monica data.
7. Test-imported the pilot: 7 accepted, 0 rejected; then verified a seven-record write/publish pilot.
8. Imported the complete data set once into a clean published set: 3,519 accepted, 0 rejected.
9. Changed page `1941` from `[ottawa_primary_care_directory]` to `[businessdirectory]`, preserving its URL, title and template.
10. Created Breakdance template `12517` applying only to directory listings. It uses Post Title plus `[businessdirectory-details]`, so detail pages inherit the existing parent header/footer/design and render plugin-owned fields.
11. Deactivated the custom Ottawa directory plugin and enabled auto-updates for Business Directory Plugin.
12. Left the existing global header entry **Referral & Resource Directory** → `/business-directory/` in place.

No production site was changed. No paid plugin, Google Maps module, API key, user, unrelated content, footer, or other plugin was modified.

## Import recovery record

During validation, the clean CSV was re-run with deterministic source `sequence_id` values. Business Directory Plugin did not treat those arbitrary values as update keys and created duplicates. All pilot/duplicate listings (7,045) were moved to normal WordPress Trash in exact ID batches; Trash was not emptied. The public set was then imported once from empty and verified at 3,519.

This remains recoverable, but it uses database space. After Fred accepts staging and confirms the 3,519-record set, the developer may empty only the trashed `wpbdp_listing` records after taking a database backup.

For future in-place bulk updates, first export from that WordPress site with the plugin-generated unique IDs and re-import the edited export. Do not re-run the clean-import CSV over a populated directory.

## Verified counts

| Type | Count |
|---|---:|
| Specialists | 785 |
| Clinics & services | 2,217 |
| Referral routes | 49 |
| Central intakes | 9 |
| Forms | 7 |
| Resources | 435 |
| Quick numbers | 17 |
| **Published total** | **3,519** |

Additional source fact: 1,685 imported listings contain a fax number. The source's 1,156-row fax lookup is represented as fields on related listings rather than extra duplicate listings.

## Verification results

- Public REST response: HTTP 200, `X-WP-Total: 3519`.
- Main directory loads inside the parent Breakdance header/footer.
- Public Add/Manage controls are absent.
- Anonymous HTML does not expose Edit/Delete actions.
- Search `Mitra Abaeian`: one result, correct specialist/category/address.
- Detail record: correct title, category, description, phone `613 830-1771`, fax `613 837-3781`.
- Listing contact form is absent.
- Admin edit screen exposes title, Description, Phone (`listingfields[6]`) and Fax (`listingfields[11]`) and can save changes.
- Custom plugin is inactive; Business Directory Plugin is active with automatic updates enabled.

## Known limitation

The free plugin does not reproduce the former Leaflet/OpenStreetMap map. The publisher's supported Maps module is paid and requires Google Maps API keys. No purchase or key was added. Search, categories, listings, fax data, admin editing and REST listing reads are available without that module.
