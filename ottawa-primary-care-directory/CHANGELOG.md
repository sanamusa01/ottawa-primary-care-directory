# Changelog

## 2.0.4 — 2026-08-14

- Prevented HTML entity text from being double-escaped in map filter labels.

## 2.0.3 — 2026-08-14

- Decode WordPress HTML entities in listing titles, categories, tags, and form
  field values before presenting them in the escaped public interface.

## 2.0.2 — 2026-08-14

- Restored the fax lookup's original model: one searchable entry per service
  plus the five separately verified intake/form destinations.

## 2.0.1 — 2026-08-14

- Restored cross-specialty roster membership while retaining one editable
  WordPress post per unique physician.
- Restored separate fax-index entries when one service publishes multiple fax
  numbers.

## 2.0.0 — 2026-08-14

- Converted the former standalone directory into a read-only presentation
  adapter for Business Directory Plugin.
- Added the public `/wp-json/opcd/v1/directory` endpoint.
- Made published WordPress listings the source of truth for titles, contact
  fields, descriptions, categories, tags, additions, deletions, and status.
- Restored the complete original tabbed interface, filters, fax lookup, forms,
  resources, quick numbers, feedback links, and bilingual controls.
- Restored the locally bundled Leaflet/OpenStreetMap postal-district map.
- Added five-minute response caching with automatic invalidation on directory
  listing and taxonomy changes.
- Declared Business Directory Plugin as a WordPress plugin dependency.
- Kept the adapter strictly read-only: it contains no public write routes,
  submissions, account handling, or custom database tables.

## 1.0.0 — 2026-08-13

- Initial WordPress integration generated from the latest Monica HTML source.
- Separated the large JSON dataset from WordPress page content.
- Added a shortcode-based integration for the existing Breakdance page.
- Mapped directory styling to the Ottawa OHT-ÉSO Breakdance design system.
- Integrated language selection with the WordPress/TranslatePress locale.
- Removed hard-coded local file links.
- Bundled Leaflet locally and retained OpenStreetMap attribution and fallback.
