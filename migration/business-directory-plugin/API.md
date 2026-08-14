# WordPress API Inventory

The staging WordPress REST API root is:

```text
https://wordpress-403092-6560255.cloudwaysapps.com/wp-json/
```

## Public read endpoints observed

- Directory listings: `/wp-json/wp/v2/wpbdp_listing`
- One directory listing: `/wp-json/wp/v2/wpbdp_listing/{id}`
- Directory categories: `/wp-json/wp/v2/wpbdp_category`
- Directory tags: `/wp-json/wp/v2/wpbdp_tag`
- Pages: `/wp-json/wp/v2/pages`
- Partners: `/wp-json/wp/v2/partner`
- Partner service types: `/wp-json/wp/v2/partner_service_type`
- Partner specialties: `/wp-json/wp/v2/partner_specialty`
- Resources: `/wp-json/wp/v2/resource`
- Resource categories: `/wp-json/wp/v2/resource_category`

The REST root also advertises Breakdance, post-filter and standard WordPress namespaces. Availability of a route does not mean anonymous write access; create/update/delete operations require authentication and sufficient WordPress capabilities.

## Directory API limitation

The public `wpbdp_listing` response exposes standard WordPress fields such as ID, title, rendered content/excerpt and taxonomies. Business Directory's custom form values (for example the canonical Phone/Fax meta fields) were not exposed in the REST `meta` object by default on this staging configuration.

If a downstream system needs structured Phone/Fax fields through REST, Fred should add an approved server-side extension or use an official Business Directory integration. Do not expose private metadata broadly without a privacy/security review.

## Authentication

The REST index advertises WordPress Application Password authorization. An administrator can create a purpose-specific Application Password for an approved integration; do not reuse a personal login password, commit credentials to GitHub, or enable unauthenticated writes.
