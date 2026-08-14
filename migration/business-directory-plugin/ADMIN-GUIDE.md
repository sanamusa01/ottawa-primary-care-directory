# Directory Admin Guide

## Change an existing record

1. Sign in to WordPress.
2. Go to **Directory → Directory Content → Listings**.
3. Search for the specialist, clinic or resource by name.
4. Open **Edit**.
5. Change the relevant structured field, such as **Phone**, **Fax**, **Email**, **Website** or **Address**.
6. If the migrated **Description** repeats the same value, update that line too so the narrative and structured field agree.
7. Click **Save/Update**.
8. Open **View Listing**, then repeat the public search to verify the result.

For Dr. Mitra Abaeian, for example, Phone is `listingfields[6]` and Fax is `listingfields[11]`; both are visible as normal labelled fields in the editor.

## Add a new record

1. Go to **Directory → Directory Content → Listings → Add New Listing**.
2. Enter a clear listing title.
3. Choose at least one category.
4. Complete Description and any applicable Phone, Fax, Email, Website, Address and ZIP fields.
5. Do not duplicate phone/fax values inside Description for new records; use the structured fields so later changes are made once.
6. Choose relevant tags and publish.
7. Verify it through the public directory search.

Email is optional. Never invent a listing-owner email just to satisfy import validation.

## Bulk changes

1. Go to **Directory → Import & Export → Export**.
2. Export all listings and select **Include unique IDs for each listing**.
3. Save an untouched backup copy.
4. Edit a working copy without changing the plugin-generated `sequence_id` values.
5. Test the update on staging and confirm accepted/rejected counts.
6. Re-import, spot-check known records and confirm the published total remains unchanged.

Do not re-import `ottawa-primary-care-directory-bdp.csv` over a populated directory. It is a clean-install artifact and duplicate creation was observed when it was rerun in staging.

## Who maintains it

The website administrator maintains content through WordPress. The production developer maintains plugin updates, backups and staging validation. Staging currently has automatic updates enabled for Business Directory Plugin; production should follow the team's managed-update policy.
