# Build tools

- `build-business-directory-import.py` generates the validated Business
  Directory migration CSVs, including merged cross-specialty categories.
- `validate-wordpress-plugin.py` validates the read-only presentation adapter,
  dependency declaration, endpoint wiring, published-only query, cache
  invalidation, required assets, and source checksums.
- `build-plugin-preview.py` generates a local visual preview using the bundled
  baseline JSON.
- `build-wordpress-plugin.py` mechanically regenerates the presentation assets
  from the authoritative HTML; review adapter-specific changes before replacing
  generated files.
