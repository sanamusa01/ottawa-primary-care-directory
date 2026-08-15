# Ottawa Primary Care Directory — Staging Change Record

Date: 2026-08-14

Staging directory: https://wordpress-403092-6560255.cloudwaysapps.com/business-directory/

## Final state

- Content engine: **Business Directory Plugin 6.4.26**, active
- Presentation: **Ottawa Directory Presentation Adapter 2.3.2**, active
- Published listings: **3,579**
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
4. Generated and imported the latest 3,519-record Monica dataset, then added
   the verified Danielle Gervais record for an initial total of 3,520 before
   the Allied Health addition.
5. Created a Breakdance single-listing template for direct Business Directory
   detail URLs.
6. Initially tested the plugin's standard `[businessdirectory]` output; it
   preserved the data but did not preserve the designed interface or map.
7. Converted the former standalone plugin into **Ottawa Directory Presentation
   Adapter**, a read-only layer powered by published Business Directory
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
13. Expanded the Map tab index from the two original listing types to every
    published Business Directory listing, including Resources, Referral Routes,
    Forms, Central Intakes, and Quick Numbers.
14. Added a Resources & other map segment and a separate result group for
    online, confidential-location, and addressless records.
15. Added conservative location matching, the verified adjacent J8Z district,
    and an explicit all-matches autocomplete choice so narrow legacy category
    labels do not hide broader search results.
16. Made **All locations** the Clinics & Services default so all 2,217 unique
    records then present appear unless an administrator deliberately narrows
    the scope. The later Allied Health addition brought this to 2,276.
17. Removed public tab totals, unfiltered specialist/service aggregate totals,
    map segment totals, autocomplete totals, and the map coverage-count
    paragraph while retaining the underlying records.
18. Added `Dr. Danielle Gervais` to Family Medicine using the public CPSO
    register fields requested for the existing physician-card format.
19. Replaced the long Resources page with a category explorer, group
    disclosures, and one-click return navigation; removed its public counts.
20. Hid the Search Everything “What lives where” table, specialist dropdown
    counts, and the Clinics & Services “Full details” disclosure.
21. Added 59 net-new Allied Health clinics from the supplied Chiropractic,
    Occupational Therapy, and Physiotherapy tabs, enriched 11 existing
    records, and merged the one shared clinic instead of duplicating it.
22. Reworked Clinics & Services column proportions and source-link spacing,
    renamed the source action to **View on Champlainhealthline**, and kept every
    eligibility/hour value available in a compact labelled disclosure so long
    source records no longer create oversized empty cells.
23. Removed every remaining public aggregate count from the Map interface,
    including the top status, area and postal-district controls, hidden-result
    notices, unavailable-map fallback, and marker tooltips. Record counts remain
    in the read-only payload for QA and maintenance.
24. Replaced dash separators in Referral Route and Resource titles with clearer
    colon punctuation at presentation time without editing stored records,
    source fields, or URLs.

No paid module, Google Maps key, user account, unrelated page, footer, or
production site was changed.

## Verified counts

| Item | Count |
|---|---:|
| Unique specialists | 786 |
| Specialist specialty appearances | 820 |
| Clinics & services | 2,276 |
| Referral routes | 49 |
| Central intakes | 9 |
| Forms | 7 |
| Resources | 435 |
| Quick numbers | 17 |
| Fax lookup | 1,156 |
| Published WordPress listings | 3,579 |

## Verification results

- Business Directory REST total: 3,579.
- Adapter REST: HTTP 200, expected counts, read-only GET, published records only.
- Parent header/footer and design tokens render correctly.
- Search `Mitra Abaeian`: one result with correct specialty, location, and phone.
- Map: all 3,579 published listings are searchable; 2,642 listings with
  supported public postal locations contribute to postal-district markers and
  937 appear in the separate no-public-location result group.
- Map search `abortion`: first suggestion is **All matching listings for
  “abortion”** with no count at the right; selecting it retains the full result
  set (16 mapped and 4 without a public map location).
- Curated category **Pregnancy options & abortion: what each service states**:
  14 results, with 11 mapped and 3 transparently listed without a public map
  location.
- Specialists: 786 unique physicians, 820 specialty appearances, 39 populated
  groups, specialty and language filters.
- Clinics & Services: **All locations** is the default and returns all 2,276
  unique records; Ottawa-only and outside-Ottawa filters remain available.
- Allied Health CSV: test mode and live append each accepted 59 rows with zero
  rejections; every new public postal location is searchable on the Map.
- Existing Allied Health matches: all 11 were recategorized in place and
  verified through the WordPress REST API; no duplicate post was created.
- Search Everything no longer shows the “What lives where” table; specialist
  options and Resources categories no longer show parenthesized totals.
- Resources now opens as a category explorer with compact grouped disclosures
  and return controls at both the top and bottom of a category view.
- Clinics & Services retains all searchable source fields while omitting the
  long public “Full details” disclosure. The named Algonquin College Dental
  Clinic, Billings Lodge, and Britannia Woods records keep their complete fees,
  eligibility, and hours while rendering without oversized empty first cells.
- Map controls, side-panel summaries, area/district buttons, overflow notices,
  fallback tables, and marker tooltips show no public record totals.
- Referral Route and Resource titles use readable colon separators; the source
  records and URLs are unchanged.
- `Dr. Danielle Gervais`: one published Family Medicine record, with no middle
  name displayed.
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
