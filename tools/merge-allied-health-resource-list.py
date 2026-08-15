#!/usr/bin/env python3
"""Merge the Allied Health Google Doc tabs into the canonical directory.

The source transcription is clinic-level. Existing Healthline records are
enriched with the requested profession category instead of duplicated. New
records retain their document provenance and are explicitly marked as not
being Healthline records.
"""

from __future__ import annotations

import hashlib
import json
import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "migration" / "allied-health-resource-list-2026-08-14.json"
TARGET = ROOT / "ottawa-primary-care-directory" / "assets" / "data" / "directory.json"


# Manually reviewed matches. These source rows describe an existing clinic,
# sometimes under a more recent trading name, address format, or phone number.
EXISTING_MATCH_IDS = {
    "Modern OT Occupational Therapy Services": "217069",
    "Vitality Rehabilitation Group": "211410",
    "Achieve Therapy Centre": "210460",
    "CBI Health – Community Rehabilitation Services (Ontario)": "211547",
    "PhysioVive Physiotherapy & Massage Clinic (Barrhaven)": "212044",
    "Pro Physio & Sport Medicine Centres Pro Plus": "208286",
    "Orleans Physiotherapy – Revive": "197698",
    "Anatomy Physiotherapy Clinic – Orleans": "200194",
    "Pro Physio and Sport Medicine Centres Kanata Town": "208287",
    "Ottawa Physiotherapy & Sport Clinics – Kanata Lakes": "212406",
    "CBI Health – Kanata Kakulu": "211102",
}


def digits(value: str) -> str:
    return re.sub(r"\D", "", value or "")[-10:]


def postal(value: str) -> str:
    match = re.search(r"\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTVWXYZ]\s?\d[ABCEGHJ-NPRSTVWXYZ]\d\b", value or "", re.I)
    return match.group(0).upper().replace(" ", "") if match else ""


def city(value: str) -> str:
    match = re.search(r",\s*([^,]+),\s*ON\s+[A-Z]\d[A-Z]", value or "", re.I)
    return match.group(1).strip() if match else "Ottawa"


def stable_id(name: str, address: str) -> str:
    payload = f"{name.casefold()}|{address.casefold()}".encode("utf-8")
    return "allied-" + hashlib.sha1(payload).hexdigest()[:14]


def merge_source_records(records: list[dict]) -> list[dict]:
    """Merge the one clinic that appears in both profession tabs."""
    merged: dict[tuple[str, str], dict] = {}
    for record in records:
        key = (digits(record.get("phone", "")), postal(record.get("address", "")))
        if key not in merged:
            copy = dict(record)
            copy["categories"] = [copy.pop("category")]
            merged[key] = copy
            continue
        current = merged[key]
        category = record["category"]
        if category not in current["categories"]:
            current["categories"].append(category)
        provider_values = [current.get("providers", ""), record.get("providers", "")]
        providers = []
        for value in provider_values:
            for provider in value.split(";"):
                provider = provider.strip()
                if provider and provider not in providers:
                    providers.append(provider)
        if providers:
            current["providers"] = "; ".join(providers)
    return list(merged.values())


def main() -> int:
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    data = json.loads(TARGET.read_text(encoding="utf-8"))
    category_indexes = {name: index for index, name in enumerate(data["catNames"])}
    existing_by_id = {str(item.get("id")): item for item in data["svcRows"]}
    records = merge_source_records(source["records"])

    added = 0
    enriched = 0
    for record in records:
        category_ids = [category_indexes[name] for name in record["categories"]]
        match_id = EXISTING_MATCH_IDS.get(record["name"])
        if match_id:
            item = existing_by_id[match_id]
            item["c"] = list(dict.fromkeys([*item.get("c", []), *category_ids]))
            aliases = [item.get("alias", ""), record["name"], record.get("providers", "")]
            item["alias"] = " ".join(value for value in aliases if value).strip()
            enriched += 1
            continue

        code = postal(record["address"])
        item = {
            "id": stable_id(record["name"], record["address"]),
            "name": record["name"],
            "addr": record["address"],
            "city": city(record["address"]),
            "postal": code[:3] + " " + code[3:] if len(code) == 6 else code,
            "fsa": code[:3],
            "phone": record.get("phone", ""),
            "web": record.get("website", ""),
            "contacts": record.get("providers", ""),
            "elig": record.get("eligibility", ""),
            "c": category_ids,
            "scope": "ottawa",
            "healthline": False,
            "_src": source["source"],
            "alias": " ".join(filter(None, [record.get("providers", ""), *record["categories"]])),
        }
        item = {key: value for key, value in item.items() if value not in ("", [], None)}
        data["svcRows"].append(item)
        existing_by_id[item["id"]] = item
        added += 1

    # Rebuild section indices so all new records appear in Clinics & Services.
    for section in data["services"]:
        leaf_ids = {category_indexes[name] for name in section.get("leafs", []) if name in category_indexes}
        section["idx"] = [
            index for index, item in enumerate(data["svcRows"])
            if leaf_ids.intersection(item.get("c", []))
        ]
        section["count"] = len(section["idx"])

    data["meta"]["compiled"] = "14 August 2026"
    data["meta"]["svcCount"] = len(data["svcRows"])
    data["meta"]["svcSource"] = len(data["svcRows"])
    data["meta"]["alliedHealthAdded"] = added
    data["meta"]["alliedHealthEnriched"] = enriched
    data["meta"]["alliedHealthSource"] = str(SOURCE.relative_to(ROOT))

    ids = [str(item.get("id")) for item in data["svcRows"]]
    duplicates = [key for key, count in Counter(ids).items() if count > 1]
    if duplicates:
        raise ValueError(f"duplicate service IDs: {duplicates[:5]}")
    if added != 59 or enriched != 11:
        raise ValueError(f"unexpected merge totals: {added=}, {enriched=}")

    TARGET.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print(json.dumps({"source_rows": len(source["records"]), "clinic_records": len(records), "added": added, "enriched": enriched, "service_total": len(data["svcRows"])}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
