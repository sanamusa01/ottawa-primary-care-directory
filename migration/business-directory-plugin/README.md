# Business Directory Plugin migration

This folder contains the validated clean-install CSV, a seven-record pilot, generated manifest, administrator guide and REST API notes for the public WordPress Business Directory Plugin integration.

Run python3 tools/build-business-directory-import.py from the repository root to regenerate the CSV files. Use the full CSV only for an empty directory. For in-place changes, export the target WordPress directory with its plugin-generated IDs and edit that export.
