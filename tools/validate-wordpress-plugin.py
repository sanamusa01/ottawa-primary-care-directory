#!/usr/bin/env python3
"""Validate the generated Ottawa Primary Care Directory plugin artifact."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
PLUGIN = ROOT / "ottawa-primary-care-directory"
SOURCE = ROOT / "Ottawa-Primary-Care-Directory-CLEANED_16.html"


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    required = [
        "ottawa-primary-care-directory.php",
        "includes/class-opcd-bdp-data-adapter.php",
        "assets/css/directory.css",
        "assets/js/directory.js",
        "assets/data/directory.json",
        "templates/directory.php",
        "vendor/leaflet/leaflet.css",
        "vendor/leaflet/leaflet.js",
        "vendor/leaflet/images/marker-icon.png",
        "vendor/leaflet/images/marker-icon-2x.png",
        "vendor/leaflet/images/marker-shadow.png",
        "manifest.json",
        "README.md",
        "CHANGELOG.md",
    ]
    for relative in required:
        if not (PLUGIN / relative).is_file():
            fail(f"Missing required plugin file: {relative}")

    data = json.loads((PLUGIN / "assets/data/directory.json").read_text(encoding="utf-8"))
    manifest = json.loads((PLUGIN / "manifest.json").read_text(encoding="utf-8"))
    javascript = (PLUGIN / "assets/js/directory.js").read_text(encoding="utf-8")
    css = (PLUGIN / "assets/css/directory.css").read_text(encoding="utf-8")
    template = (PLUGIN / "templates/directory.php").read_text(encoding="utf-8")
    php = (PLUGIN / "ottawa-primary-care-directory.php").read_text(encoding="utf-8")
    adapter = (PLUGIN / "includes/class-opcd-bdp-data-adapter.php").read_text(encoding="utf-8")

    source_sha = hashlib.sha256(SOURCE.read_bytes()).hexdigest()
    if manifest.get("sourceSha256") != source_sha:
        fail("Manifest source checksum does not match the authoritative HTML")

    specialist_rows = [row for group in data["specialists"] for row in group["rows"]]
    unique_specialists = {
        (row.get("_cpso", ""), row.get("name", "").casefold(), row.get("site", "").casefold())
        for row in specialist_rows
    }
    actual_counts = {
        "specialistGroups": len(data["specialists"]),
        "specialistOccurrences": len(specialist_rows),
        "uniqueSpecialists": len(unique_specialists),
        "services": len(data["svcRows"]),
        "serviceSections": len(data["services"]),
        "faxEntries": len(data["fax"]),
        "routingEntries": len(data["routing"]),
        "resourceSections": len(data["resources"]),
        "formAgencies": len(data["forms"]),
    }
    if manifest.get("counts") != actual_counts:
        fail("Manifest record counts do not match the generated JSON")

    forbidden = {
        "template": ["file:///", "ottrx-data"],
        "javascript": ["cdnjs.cloudflare.com", "document.getElementById('ottrx-data')"],
    }
    for value in forbidden["template"]:
        if value in template:
            fail(f"Forbidden value remains in template: {value}")
    for value in forbidden["javascript"]:
        if value in javascript:
            fail(f"Forbidden value remains in JavaScript: {value}")

    if "document.documentElement.setAttribute('lang'" in javascript:
        fail("Application still changes the global document language")
    if "window.fetch(DATA_URL" not in javascript:
        fail("Application does not fetch its versioned JSON file")
    if "ottrx--wordpress" not in css or "--bde-brand-primary-color" not in css:
        fail("Breakdance design-system adapter is missing")
    if php.count("add_shortcode( 'ottawa_primary_care_directory'") != 1:
        fail("Shortcode registration is missing or duplicated")
    if "Version: 2.2.0" not in php or "Requires Plugins: business-directory-plugin" not in php:
        fail("Hybrid plugin version or Business Directory dependency is missing")
    if "rest_url( OPCD_BDP_Data_Adapter::REST_NAMESPACE" not in php:
        fail("Shortcode is not connected to the Business Directory data adapter")
    if "WP_REST_Server::READABLE" not in adapter or "'permission_callback' => '__return_true'" not in adapter:
        fail("Read-only public REST route is not configured as expected")
    if "'post_type'              => 'wpbdp_listing'" not in adapter:
        fail("Adapter does not query Business Directory listings")
    if "'post_status'            => 'publish'" not in adapter:
        fail("Adapter is not restricted to published listings")
    if "save_post_wpbdp_listing" not in adapter or "delete_transient" not in adapter:
        fail("Adapter cache invalidation is incomplete")
    if "build_map_rows" not in adapter or "mapPlaced" not in adapter or "mapUnplaced" not in adapter:
        fail("Complete published-listing map coverage is missing")
    if "DATA.mapRows" not in javascript or "data-unplaced" not in javascript:
        fail("Map cannot expose located and unplaced records")
    if "scope: 'all'" not in javascript or "['all','ottawa','away']" not in javascript:
        fail("Clinics & Services must default to an explicit All locations option")
    if "if (!state.svc && seenRows[r.id]) return;" not in javascript:
        fail("All-section service rendering does not de-duplicate multi-category records")
    if '<span class="ottrx__suggestn"' in javascript or '<span class="ottrx__segn"' in javascript:
        fail("Map filter result counts are still exposed in the interface")
    if "t('map.blurb')" in javascript or "t('map.searchable')" in javascript:
        fail("Map coverage-count statement is still rendered in the interface")
    if any(f"count: DATA.meta.{key}" in javascript for key in ("specCount", "svcCount", "faxCount")):
        fail("Specialist, service, or fax totals are still shown in tab labels")
    if "DATA.meta.specCount + ' ' + t('spec.blurb')" in javascript:
        fail("Specialist aggregate count is still displayed in the panel header")
    if "if (q || state.svc || state.leaf || state.scope !== 'all')" not in javascript:
        fail("Unfiltered Clinics & Services aggregate count is still displayed")
    if '<span class="n">' in template:
        fail("Static template still shows tab totals before JavaScript loads")
    danielle = [row for row in specialist_rows if row.get("_cpso") == "75041"]
    if len(danielle) != 1 or danielle[0].get("name") != "Dr. Danielle Gervais":
        fail("Danielle Gervais must appear exactly once without a middle name")
    if re.search(r"register_rest_route[\s\S]{0,500}WP_REST_Server::(?:CREATABLE|EDITABLE|DELETABLE)", adapter):
        fail("Adapter exposes a mutating REST route")
    if ".ottrx--wordpress .ottrx__lang{display:none}" in css:
        fail("Original bilingual interface control is still hidden")
    if len(re.findall(r'id="ottrx-root"', template)) != 1:
        fail("Template must contain exactly one directory root")

    print("Plugin validation passed")
    print(json.dumps(actual_counts, indent=2))


if __name__ == "__main__":
    main()
