# Ottawa Directory Presentation Adapter

Read-only public presentation for the Ottawa OHT-ÉSO Referral & Resource
Directory. Version 2 keeps **Business Directory Plugin** as the editable
WordPress database while restoring the purpose-built Ottawa directory user
experience.

## Responsibilities

- **Business Directory Plugin** owns published listings, categories, form
  fields, CSV import/export, permissions, and administrator editing.
- **This adapter** reads published `wpbdp_listing` records and presents them in
  the original tabbed, searchable interface.
- **Breakdance / the parent site** owns the site-wide header, footer, fonts, and
  design tokens.

The adapter does not create, update, or delete directory listings. Its REST
route is public and read-only, and contains only information that is already
published in the directory.

## Restored public features

- Search Everything
- Referral Routes and central intake
- Complete directory search from the Map tab, with postal-district markers for
  every record that has a supported public location
- A separate results view for online, confidential-location, or addressless
  records that cannot be placed honestly on a physical map
- Specialist roster with specialty and language filters
- Clinics and services with section, category, location, and OHT filters
- Fax lookup
- Forms
- Resources category explorer with compact group disclosures and return navigation
- Quick numbers
- English/French interface controls
- Feedback/correction links
- Phone-format and accent-insensitive search
- Original structured cards, tables, badges, verification notices, and mobile
  behavior

## Requirements

- WordPress 6.3 or newer
- PHP 7.4 or newer
- Business Directory Plugin 6.4.26 or a compatible later release
- A page containing `[ottawa_primary_care_directory]` exactly once

## Data flow

The static JSON bundled with the adapter supplies presentation taxonomy, map
geography, and verified source metadata. On each cache rebuild, the adapter
queries published Business Directory listings and overlays their current
titles, fields, descriptions, categories, and tags. Deleted or unpublished
WordPress listings disappear from the public presentation; new listings are
added to the appropriate section based on their Business Directory category.

The map receives one compact row for every published listing. Specialists,
clinics, and resources with a supported postal district receive approximate
district markers. Referral routes, online services, confidential locations,
and records without a public postal code remain searchable in the same Map tab
under a clearly labelled non-map-location results group.

The public endpoint is:

`/wp-json/opcd/v1/directory`

Its five-minute server cache is invalidated whenever a directory listing is
saved, deleted, recategorized, or retagged.

## Administrator updates

Use **WordPress Admin → Directory → Directory Content → Listings**. Changes to
the title, phone, fax, address, website, email, description, categories, and
tags flow into the public interface automatically after saving.

Descriptions use labelled lines such as `Languages:`, `Eligibility:`, and
`How to access / refer:`. Keeping those labels when editing allows the adapter
to place details in the intended part of each card.

The 14 August Allied Health addition is transcribed in
`migration/allied-health-resource-list-2026-08-14.json`. It adds 59 new clinic
listings, enriches 11 existing records, and keeps a single shared clinic record
when the same location appears in more than one profession tab.

## Map dependency

Leaflet 1.9.4 remains bundled locally for the original postal-district map.
OpenStreetMap tiles load only after a visitor opens the Map tab. The production
owner must include Leaflet review/update responsibility in the site's normal
dependency-maintenance process. A future switch to the paid Business Directory
Maps module would be a different map experience and should be separately
scoped.

## Build and validation

The authoritative source remains `Ottawa-Primary-Care-Directory-CLEANED_16.html`.
Run:

```bash
python3 tools/validate-wordpress-plugin.py
python3 tools/build-plugin-preview.py
```
