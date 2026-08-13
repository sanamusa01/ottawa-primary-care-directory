# Ottawa Primary Care Directory

Custom WordPress integration for the Ottawa OHT-ÉSO referral and resource directory.

The authoritative source is `Ottawa-Primary-Care-Directory-CLEANED_16.html`. The generated WordPress plugin lives in `ottawa-primary-care-directory/` and renders through:

```text
[ottawa_primary_care_directory]
```

## Documentation

- `DEVELOPER-HANDOFF.md` — repository structure and production integration
- `PRODUCTION-RUNBOOK.md` — deployment, acceptance testing, and rollback
- `STAGING-CHANGELOG.md` — exact staging changes and verification results
- `ottawa-primary-care-directory/README.md` — plugin-specific notes

## Validate

```bash
python3 tools/validate-wordpress-plugin.py
```

## Rebuild after an approved data update

```bash
python3 tools/build-wordpress-plugin.py
python3 tools/validate-wordpress-plugin.py
```

Do not hand-edit the generated JSON without correcting the authoritative source. Versioned WordPress ZIPs are published as GitHub release assets rather than committed to the repository.

