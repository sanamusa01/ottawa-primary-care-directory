# Ottawa Primary Care Directory

Migration package for the Ottawa OHT-ÉSO **Referral & Resource Directory**.

The production target is the public [Business Directory Plugin](https://wordpress.org/plugins/business-directory-plugin/) for WordPress. The bespoke Leaflet plugin in `ottawa-primary-care-directory/` is retained only as a documented legacy rollback artifact and must not be activated for the new integration.

## Current integration

- WordPress plugin: Business Directory Plugin 6.4.26 (WordPress.org)
- Public page shortcode: `[businessdirectory]`
- Public URL: `/business-directory/`
- Listings: 3,519
- Source of truth: `ottawa-primary-care-directory/assets/data/directory.json`, generated from `Ottawa-Primary-Care-Directory-CLEANED_16.html`
- Import file: `migration/business-directory-plugin/ottawa-primary-care-directory-bdp.csv`

## Repository map

- `DEVELOPER-HANDOFF.md` — production handoff and architectural decisions
- `PRODUCTION-RUNBOOK.md` — safe production migration and rollback
- `STAGING-CHANGELOG.md` — exact changes made in staging
- `migration/business-directory-plugin/ADMIN-GUIDE.md` — routine admin editing and new-record workflow
- `migration/business-directory-plugin/API.md` — WordPress REST API inventory and limitations
- `tools/build-business-directory-import.py` — deterministic CSV generator and validation
- `ottawa-primary-care-directory/` — deprecated custom-plugin rollback source; not the production target

## Rebuild the clean-import CSV

```bash
python3 tools/build-business-directory-import.py
```

The generator validates unique source identifiers, required fields, and record counts. The clean-import CSV is for an empty directory. Do **not** re-import it over an already populated site: for safe bulk updates, first export that site's listings with Business Directory Plugin's generated `sequence_id` values, edit the export, and re-import it.

## Record totals

| Type | Listings |
|---|---:|
| Specialists | 785 |
| Clinics & services | 2,217 |
| Referral routes | 49 |
| Central intakes | 9 |
| Forms | 7 |
| Resources | 435 |
| Quick numbers | 17 |
| **Total** | **3,519** |

Fax data is stored on its related listing rather than as duplicate fax-only listings. Email is optional because 1,813 valid source records do not contain an email address.
