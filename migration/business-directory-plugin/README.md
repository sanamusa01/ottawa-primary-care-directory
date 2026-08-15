# Business Directory Plugin migration

Validated clean-install migration files for the hybrid Ottawa directory.
Business Directory Plugin owns the editable records; Ottawa Directory
Presentation Adapter reads those published records for the purpose-built public
interface.

Run `python3 tools/build-business-directory-import.py` from the repository root
to regenerate the CSVs. The generator merges cross-specialty membership into
one WordPress listing per unique physician.

Use the full CSV only for an empty directory. For in-place changes, export the
target WordPress directory with its plugin-generated IDs, preserve those IDs,
edit that export, and re-import it.

`allied-health-new-listings-2026-08-14.csv` is an append-only, one-time staging
artifact containing the 59 source rows that did not match an existing listing.
The 11 matches were recategorized in place in WordPress and were not imported
again. The deduplication record is retained in
`../allied-health-resource-list-2026-08-14.json`.
