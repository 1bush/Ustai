"""Valido render.yaml kundrejt skemes zyrtare te Render-it.

Perdorim:  python scripts/validate-render-blueprint.py
Kthen exit code 0 (valid) ose 1 (gabime).
"""
import json
import pathlib
import sys
import urllib.request

import yaml
from jsonschema import Draft202012Validator

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCHEMA_URL = "https://render.com/schema/render.yaml.json"
SCHEMA_CACHE = ROOT / ".render-schema.json"
BLUEPRINT = ROOT / "render.yaml"


def load_schema() -> dict:
    if SCHEMA_CACHE.exists():
        return json.loads(SCHEMA_CACHE.read_text(encoding="utf-8"))
    with urllib.request.urlopen(SCHEMA_URL, timeout=30) as resp:
        schema = json.loads(resp.read().decode("utf-8"))
    SCHEMA_CACHE.write_text(json.dumps(schema, indent=2), encoding="utf-8")
    return schema


def main() -> int:
    schema = load_schema()
    data = yaml.safe_load(BLUEPRINT.read_text(encoding="utf-8"))

    errors = sorted(
        Draft202012Validator(schema).iter_errors(data),
        key=lambda e: list(e.absolute_path),
    )

    if not errors:
        print("OK: render.yaml eshte i vlefshem sipas skemes se Render-it.")
        return 0

    print(f"GABIME: {len(errors)}")
    for err in errors:
        path = "/".join(str(p) for p in err.absolute_path) or "<root>"
        print(f"  - {path}: {err.message}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
