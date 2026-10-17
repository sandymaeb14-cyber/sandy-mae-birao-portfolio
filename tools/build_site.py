#!/usr/bin/env python3
"""Assemble a public-only GitHub Pages artifact from this static portfolio."""
from __future__ import annotations

import argparse
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ("index.html", "about.html", "experience.html", "projects.html", "skills.html", "contact.html", "404.html")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("destination", type=Path)
    parser.add_argument("site_url", help="GitHub Pages base URL, including repository path")
    args = parser.parse_args()
    site_url = args.site_url.rstrip("/")
    if not site_url.startswith("https://"):
        raise SystemExit("Site URL must use HTTPS.")
    dest = args.destination.resolve()
    if dest == ROOT or dest in ROOT.parents:
        raise SystemExit("Destination cannot be the source workspace or one of its parents.")
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    for page in PAGES:
        shutil.copy2(ROOT / page, dest / page)
    for folder in ("css", "js", "assets"):
        shutil.copytree(ROOT / folder, dest / folder)
    for file in ("favicon.svg", "robots.txt", "sitemap.xml"):
        shutil.copy2(ROOT / file, dest / file)
    for file in dest.rglob("*"):
        if file.is_file() and file.suffix.lower() in {".html", ".xml", ".txt"}:
            content = file.read_text(encoding="utf-8")
            file.write_text(content.replace("{{SITE_URL}}", site_url), encoding="utf-8")
    text_suffixes = {".html", ".xml", ".txt"}
    leftovers = [
        str(p.relative_to(dest))
        for p in dest.rglob("*")
        if p.is_file() and p.suffix.lower() in text_suffixes and "{{SITE_URL}}" in p.read_text(encoding="utf-8")
    ]
    if leftovers:
        raise SystemExit(f"Unresolved site URL placeholders: {leftovers}")
    print(f"Prepared {sum(p.is_file() for p in dest.rglob('*'))} public files in {dest}")


if __name__ == "__main__":
    main()
