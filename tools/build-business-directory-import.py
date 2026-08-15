#!/usr/bin/env python3
"""Build clean Business Directory Plugin CSV imports from authoritative data.

The generated ``sequence_id`` values are deterministic source identifiers for
traceability. They are not a safe in-place update key for an already populated
directory. For updates, export the target site with Business Directory Plugin's
own generated IDs, preserve those IDs, edit that export, and re-import it.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "ottawa-primary-care-directory" / "assets" / "data" / "directory.json"
DEFAULT_OUTPUT = ROOT / "migration" / "business-directory-plugin"

HEADERS = [
    "listing_title",
    "listing_category",
    "short_description",
    "description",
    "website",
    "phone",
    "fax",
    "email",
    "listing_tags",
    "address",
    "zip_code",
    "username",
    "sequence_id",
]

PHONE_RE = re.compile(r"(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?:\s*(?:x|ext\.?|extension)\s*\d+)?", re.I)
EMAIL_RE = re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I)
URL_RE = re.compile(r"https?://[^\s|]+", re.I)


def clean(value: Any) -> str:
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def stable_id(kind: str, *parts: Any) -> str:
    payload = "|".join(clean(part).casefold() for part in parts)
    digest = hashlib.sha1(payload.encode("utf-8")).hexdigest()[:16]
    return f"opc-{kind}-{digest}"


def first_match(pattern: re.Pattern[str], values: Iterable[Any]) -> str:
    for value in values:
        match = pattern.search(clean(value))
        if match:
            return match.group(0).rstrip(".,;)")
    return ""


def detail_lines(pairs: Iterable[tuple[str, Any]]) -> str:
    lines = []
    for label, value in pairs:
        text = clean(value)
        if text:
            lines.append(f"{label}: {text}")
    return "\n".join(lines)


def record(
    *,
    title: Any,
    categories: Iterable[Any],
    description: Any,
    short: Any = "",
    website: Any = "",
    phone: Any = "",
    fax: Any = "",
    email: Any = "",
    tags: Iterable[Any] = (),
    address: Any = "",
    postal: Any = "",
    sequence_id: str,
) -> dict[str, str]:
    category_values = list(dict.fromkeys(clean(c) for c in categories if clean(c)))
    tag_values = list(dict.fromkeys(clean(t) for t in tags if clean(t)))
    return {
        "listing_title": clean(title),
        "listing_category": ";".join(category_values),
        "short_description": clean(short)[:500],
        "description": str(description).strip(),
        "website": clean(website),
        "phone": clean(phone),
        "fax": clean(fax),
        "email": clean(email),
        "listing_tags": ";".join(tag_values),
        "address": clean(address),
        "zip_code": clean(postal),
        "username": "Sana",
        "sequence_id": sequence_id,
    }


def d_items_to_pairs(items: Iterable[dict[str, Any]]) -> list[tuple[str, str]]:
    pairs: list[tuple[str, str]] = []
    for item in items:
        label = clean(item.get("l")) or "Details"
        value = clean(item.get("x") or item.get("t") or item.get("u"))
        if value:
            pairs.append((label, value))
    return pairs


def build_records(data: dict[str, Any]) -> tuple[list[dict[str, str]], Counter[str]]:
    rows: list[dict[str, str]] = []
    counts: Counter[str] = Counter()

    specialist_records: dict[tuple[str, str, str, str], dict[str, str]] = {}
    for group in data.get("specialists", []):
        group_name = clean(group.get("group"))
        for item in group.get("rows", []):
            key = tuple(clean(item.get(k)).casefold() for k in ("name", "site", "phone", "fax"))
            if key in specialist_records:
                existing = specialist_records[key]
                categories = existing["listing_category"].split(";")
                if group_name and group_name not in categories:
                    categories.append(group_name)
                    existing["listing_category"] = ";".join(categories)
                tags = existing["listing_tags"].split(";") if existing["listing_tags"] else []
                for value in (group_name, clean(item.get("sub")), clean(item.get("langs"))):
                    if value and value not in tags:
                        tags.append(value)
                existing["listing_tags"] = ";".join(tags)
                continue
            details = detail_lines(
                [
                    ("Specialty", group_name),
                    ("Subspecialty / notes", item.get("sub")),
                    ("Location", item.get("site")),
                    ("Phone", item.get("phone")),
                    ("Fax", item.get("fax")),
                    ("Languages", item.get("langs")),
                ]
            )
            specialist_records[key] = record(
                    title=item.get("name"),
                    categories=("Specialists", group_name),
                    short=" · ".join(filter(None, [group_name, clean(item.get("sub")), clean(item.get("site"))])),
                    description=details,
                    phone=item.get("phone"),
                    fax=item.get("fax"),
                    tags=(group_name, item.get("sub"), item.get("langs")),
                    address=item.get("site"),
                    postal=item.get("fsa"),
                    sequence_id=stable_id("specialist", *key),
                )
            counts["specialists"] += 1

    rows.extend(specialist_records.values())

    category_names = data.get("catNames", [])
    for item in data.get("svcRows", []):
        service_categories = [
            category_names[index]
            for index in item.get("c", [])
            if isinstance(index, int) and 0 <= index < len(category_names)
        ]
        details = detail_lines(
            [
                ("Description", item.get("desc")),
                ("Address", item.get("addr") or item.get("street")),
                ("Intersection", item.get("cross")),
                ("Phone", item.get("phone")),
                ("Toll-free", item.get("tollfree")),
                ("TTY", item.get("tty")),
                ("Fax", item.get("fax")),
                ("Email", item.get("email")),
                ("Website", item.get("web")),
                ("Contacts", item.get("contacts")),
                ("Leadership", item.get("execs")),
                ("Hours", item.get("hours")),
                ("After hours", item.get("afterhours")),
                ("Eligibility", item.get("elig")),
                ("How to access / refer", item.get("apply")),
                ("Fees", item.get("fees")),
                ("Languages", item.get("lang")),
                ("Language notes", item.get("langnotes")),
                ("Accessibility", item.get("access")),
                ("Accessibility notes", item.get("accessnotes")),
                ("Service area", item.get("area")),
                ("Last verified", item.get("updated")),
            ]
        )
        rows.append(
            record(
                title=item.get("name"),
                categories=("Clinics & Services", *service_categories),
                short=item.get("desc") or " · ".join(service_categories[:3]),
                description=details,
                website=item.get("web"),
                phone=item.get("phone"),
                fax=item.get("fax"),
                email=item.get("email"),
                tags=(*service_categories, item.get("alias"), item.get("lang"), item.get("city")),
                address=item.get("addr") or item.get("street"),
                postal=item.get("postal") or item.get("fsa"),
                sequence_id=f"opc-service-{clean(item.get('id'))}" if item.get("id") else stable_id("service", item.get("name"), item.get("addr")),
            )
        )
        counts["clinics_services"] += 1

    for item in data.get("routing", []):
        details = detail_lines([("Route", item.get("r")), ("Referral details", item.get("d"))])
        rows.append(
            record(
                title=item.get("s"),
                categories=("Referral Routes",),
                short=item.get("r"),
                description=details,
                phone=first_match(PHONE_RE, [item.get("d")]),
                email=first_match(EMAIL_RE, [item.get("d")]),
                website=first_match(URL_RE, [item.get("d")]),
                tags=(item.get("r"), "referral"),
                sequence_id=stable_id("route", item.get("s")),
            )
        )
        counts["referral_routes"] += 1

    for item in data.get("intakes", []):
        details = detail_lines(
            [
                ("Scope", item.get("scope")),
                ("Phone", item.get("phone")),
                ("Fax", item.get("fax")),
                ("Email", item.get("email")),
                ("Website", item.get("url")),
            ]
        )
        rows.append(
            record(
                title=item.get("name"),
                categories=("Referral Routes", "Central Intake"),
                short=item.get("scope"),
                description=details,
                website=item.get("url"),
                phone=item.get("phone"),
                fax=item.get("fax"),
                email=item.get("email"),
                tags=("central intake", item.get("scope")),
                sequence_id=stable_id("intake", item.get("name"), item.get("scope")),
            )
        )
        counts["central_intakes"] += 1

    for agency in data.get("forms", []):
        agency_name = clean(agency.get("agency"))
        for item in agency.get("items", []):
            pairs = [("Description", clean(item.get("desc"))), *d_items_to_pairs(item.get("d", []))]
            values = [value for _, value in pairs]
            rows.append(
                record(
                    title=item.get("name"),
                    categories=("Forms", agency_name),
                    short=item.get("desc"),
                    description=detail_lines(pairs),
                    website=first_match(URL_RE, values),
                    phone=first_match(PHONE_RE, values),
                    email=first_match(EMAIL_RE, values),
                    tags=(agency_name, "form"),
                    sequence_id=stable_id("form", agency_name, item.get("name")),
                )
            )
            counts["forms"] += 1

    for section in data.get("resources", []):
        section_title = clean(section.get("title"))
        for group in section.get("groups", []):
            group_title = re.sub(r"\s*\(\d+\)\s*$", "", clean(group.get("title")))
            for item in group.get("items", []):
                pairs = [("Description", clean(item.get("desc"))), *d_items_to_pairs(item.get("d", []))]
                values = [value for _, value in pairs]
                rows.append(
                    record(
                        title=item.get("name"),
                        categories=("Resources", f"Resources — {section_title}", group_title),
                        short=item.get("desc"),
                        description=detail_lines([*pairs, ("Last verified", item.get("lastVerified"))]),
                        website=first_match(URL_RE, values),
                        phone=first_match(PHONE_RE, values),
                        email=first_match(EMAIL_RE, values),
                        tags=(*item.get("tags", []), item.get("alias"), section_title, group_title),
                        sequence_id=stable_id("resource", section.get("id"), group_title, item.get("name")),
                    )
                )
                counts["resources"] += 1

    for item in data.get("quick", []):
        rows.append(
            record(
                title=item.get("n"),
                categories=("Quick Numbers",),
                short=item.get("note"),
                description=detail_lines([("Phone", item.get("p")), ("Note", item.get("note"))]),
                phone=item.get("p"),
                tags=("quick number", "urgent" if item.get("crit") else ""),
                sequence_id=stable_id("quick", item.get("n"), item.get("p")),
            )
        )
        counts["quick_numbers"] += 1

    return rows, counts


def validate(rows: list[dict[str, str]]) -> None:
    sequence_ids = [row["sequence_id"] for row in rows]
    duplicates = [key for key, count in Counter(sequence_ids).items() if count > 1]
    if duplicates:
        raise ValueError(f"Duplicate sequence IDs: {duplicates[:5]}")
    for index, row in enumerate(rows, start=1):
        missing = [name for name in ("listing_title", "listing_category", "description", "sequence_id") if not row[name]]
        if missing:
            raise ValueError(f"Row {index} missing required fields: {', '.join(missing)}")


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=HEADERS, extrasaction="ignore", lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    data = json.loads(args.source.read_text(encoding="utf-8"))
    rows, counts = build_records(data)
    validate(rows)

    args.output_dir.mkdir(parents=True, exist_ok=True)
    full_path = args.output_dir / "ottawa-primary-care-directory-bdp.csv"
    pilot_path = args.output_dir / "ottawa-primary-care-directory-bdp-pilot.csv"
    allied_health_path = args.output_dir / "allied-health-new-listings-2026-08-14.csv"
    manifest_path = args.output_dir / "manifest.json"

    write_csv(full_path, rows)
    pilot_types = ["opc-specialist-", "opc-service-", "opc-route-", "opc-intake-", "opc-form-", "opc-resource-", "opc-quick-"]
    pilot = [next(row for row in rows if row["sequence_id"].startswith(prefix)) for prefix in pilot_types]
    write_csv(pilot_path, pilot)
    allied_health = [row for row in rows if row["sequence_id"].startswith("opc-service-allied-")]
    write_csv(allied_health_path, allied_health)

    manifest = {
        "source": str(args.source.relative_to(ROOT)),
        "source_compiled": data.get("meta", {}).get("compiled"),
        "plugin": "Business Directory Plugin",
        "plugin_slug": "business-directory-plugin",
        "csv_headers": HEADERS,
        "total_listings": len(rows),
        "counts": dict(sorted(counts.items())),
        "pilot_listings": len(pilot),
        "allied_health_new_listings": len(allied_health),
        "notes": [
            "Cross-specialty physician occurrences are merged into one listing with multiple specialty categories.",
            "Fax is a custom optional Phone Number field with shortname 'fax'.",
            "Email is optional; do not fabricate listing-owner email addresses.",
            "Fax lookup is represented by the fax field on provider/service listings, not duplicate fax-only listings.",
            "sequence_id is a deterministic source identifier for traceability only.",
            "Do not re-import this clean file over a populated directory. Export the target site with plugin-generated unique IDs and edit that export for in-place updates.",
            "allied-health-new-listings-2026-08-14.csv contains only the 59 net-new Allied Health clinics and is safe for a one-time append import after duplicate review.",
        ],
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
