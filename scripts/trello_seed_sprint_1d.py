#!/usr/bin/env python3
"""Seed the Haul Trello board with Sprint 1.D cards.

Credentials are read from environment variables:
  TRELLO_KEY
  TRELLO_TOKEN

Usage:
  python3 scripts/trello_seed_sprint_1d.py --dry-run
  python3 scripts/trello_seed_sprint_1d.py
"""

import argparse
import json
import os
import sys
import urllib.parse
import urllib.request


BOARD_ID = "IDD33TqM"
API_BASE = "https://api.trello.com/1"


CARDS = [
    {
        "list": "Done",
        "title": "Manifest V3 Alpha Scaffold",
        "priority": "P0",
        "owner": "Patrick",
        "labels": "Chrome Extension, QA",
        "estimate": "M",
        "story": "As a tester, I need a Chrome extension that can be installed locally so I can try Haul.",
        "acceptance": "Extension loads via Chrome Developer Mode; manifest version is 0.1.0; icons exist.",
    },
    {
        "list": "Done",
        "title": "Product Save Flow",
        "priority": "P0",
        "owner": "Patrick",
        "labels": "Chrome Extension, Product Extraction",
        "estimate": "L",
        "story": "As a shopper, I want to save products while browsing so I do not lose options across tabs.",
        "acceptance": "Save to Haul button appears on product pages; clicking saves product data to Chrome storage.",
    },
    {
        "list": "Done",
        "title": "Side Panel Saves View",
        "priority": "P0",
        "owner": "Trevor",
        "labels": "UI, Chrome Extension",
        "estimate": "M",
        "story": "As a shopper, I want to see saved products in a side tray while I keep browsing.",
        "acceptance": "Side panel opens; saved products display with name, price, image, and remove button.",
    },
    {
        "list": "Done",
        "title": "Comparison Dashboard",
        "priority": "P0",
        "owner": "Kendall",
        "labels": "UI, Chrome Extension",
        "estimate": "L",
        "story": "As a shopper, I want to compare saved products side-by-side so I can choose confidently.",
        "acceptance": "Compare All opens dashboard; products appear as columns; Go to Site opens product link.",
    },
    {
        "list": "Done",
        "title": "GitHub Alpha Release",
        "priority": "P0",
        "owner": "Patrick",
        "labels": "Docs, Launch",
        "estimate": "S",
        "story": "As a grader, I need version-controlled source and release notes so I can review the alpha.",
        "acceptance": "GitHub repo pushed; tag v0.1.0 exists; release created; zip uploaded.",
    },
    {
        "list": "Sprint 1.D Planned",
        "title": "Manual Chrome QA Pass",
        "priority": "P0",
        "owner": "Unassigned",
        "labels": "QA",
        "estimate": "M",
        "story": "As a team, we need confidence the alpha zip works before sending it to users.",
        "acceptance": "Test Amazon, Nike, Target, Best Buy, and ASOS; document pass/fail and bugs.",
    },
    {
        "list": "Sprint 1.D Planned",
        "title": "Send Alpha Email to 10 Reference Customers",
        "priority": "P0",
        "owner": "Unassigned",
        "labels": "Research, Launch",
        "estimate": "M",
        "story": "As a team, we need real feedback from target users to validate Haul.",
        "acceptance": "10 users receive install instructions, release notes link, zip/release link, and Google Form link.",
    },
    {
        "list": "Sprint 1.D Planned",
        "title": "Create Google Feedback Form",
        "priority": "P0",
        "owner": "Unassigned",
        "labels": "Research",
        "estimate": "S",
        "story": "As a team, we need structured feedback so we can measure alpha quality.",
        "acceptance": "Google Form includes install outcome, site tested, extraction correctness, usefulness rating, and Pro willingness-to-pay question.",
    },
    {
        "list": "Sprint 1.D Planned",
        "title": "Improve Extraction for 10 Supported Sites",
        "priority": "P1",
        "owner": "Unassigned",
        "labels": "Product Extraction, QA",
        "estimate": "L",
        "story": "As a shopper, I want Haul to capture accurate product data on the sites I actually use.",
        "acceptance": "Amazon, Nike, ASOS, Target, Best Buy, Zara, H&M, Nordstrom, Wayfair, and eBay have test notes and selector fixes where needed.",
    },
    {
        "list": "Sprint 1.D Planned",
        "title": "Wireframe Parity Cleanup",
        "priority": "P1",
        "owner": "Unassigned",
        "labels": "UI",
        "estimate": "M",
        "story": "As a tester, I want the alpha UI to match the wireframes so the product feels polished.",
        "acceptance": "Save button, side panel, empty state, product cards, and dashboard match core wireframe styling.",
    },
    {
        "list": "Backlog",
        "title": "Price Drop Alerts Prototype",
        "priority": "P1",
        "owner": "Unassigned",
        "labels": "Chrome Extension, Product Extraction",
        "estimate": "L",
        "story": "As a shopper, I want to know when saved products drop in price so I can buy at the right time.",
        "acceptance": "Define polling approach and fake-door Pro CTA before implementation.",
    },
    {
        "list": "Backlog",
        "title": "Haul Pro Fake-Door Test",
        "priority": "P1",
        "owner": "Unassigned",
        "labels": "Launch, Research",
        "estimate": "M",
        "story": "As a team, we want to test willingness to pay before building subscriptions.",
        "acceptance": "Upgrade CTA records user interest through form or email waitlist.",
    },
    {
        "list": "Backlog",
        "title": "Affiliate Revenue Research",
        "priority": "P2",
        "owner": "Unassigned",
        "labels": "Research, Launch",
        "estimate": "M",
        "story": "As a team, we want to know if affiliate links can monetize Go to Site clicks.",
        "acceptance": "Research Amazon, Target, Best Buy, Nike, ASOS, eBay programs and document feasibility.",
    },
    {
        "list": "Testing / QA",
        "title": "Shared Link QA",
        "priority": "P1",
        "owner": "Unassigned",
        "labels": "QA, UI",
        "estimate": "S",
        "story": "As a shopper, I want shared comparisons to open correctly for someone else.",
        "acceptance": "Share button copies link; link opens dashboard with saved products; invalid shared data fails gracefully.",
    },
    {
        "list": "Testing / QA",
        "title": "Security and Privacy QA",
        "priority": "P0",
        "owner": "Unassigned",
        "labels": "QA, Docs",
        "estimate": "M",
        "story": "As a user, I need Haul to handle product data safely and not leak personal information.",
        "acceptance": "No unsafe product-data rendering; privacy policy matches extension behavior; permissions are documented.",
    },
    {
        "list": "Blocked",
        "title": "Trello CLI Automation",
        "priority": "P2",
        "owner": "Unassigned",
        "labels": "Launch",
        "estimate": "M",
        "story": "As a team, we want to automate Trello updates from CLI.",
        "acceptance": "Trello API key/token configured and board update command tested.",
    },
]

LISTS = ["Done", "In Progress", "Sprint 1.D Planned", "Testing / QA", "Backlog", "Blocked"]


def auth_params():
    key = os.environ.get("TRELLO_KEY")
    token = os.environ.get("TRELLO_TOKEN")
    if not key or not token:
        print("Missing TRELLO_KEY or TRELLO_TOKEN.", file=sys.stderr)
        print("See TRELLO-API-SETUP.md.", file=sys.stderr)
        sys.exit(1)
    return {"key": key, "token": token}


def request(method, path, params=None):
    params = {**(params or {}), **auth_params()}
    url = f"{API_BASE}{path}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, method=method, headers={"Accept": "application/json"})
    try:
      with urllib.request.urlopen(req) as res:
          body = res.read().decode("utf-8")
          return json.loads(body) if body else None
    except urllib.error.HTTPError as err:
        details = err.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Trello API error {err.code}: {details}") from err


def card_description(card):
    return "\n".join([
        f"**User story:** {card['story']}",
        "",
        f"**Acceptance criteria:** {card['acceptance']}",
        "",
        f"**Priority:** {card['priority']}",
        f"**Owner:** {card['owner']}",
        f"**Labels:** {card['labels']}",
        f"**Estimate:** {card['estimate']}",
    ])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Print planned changes without writing to Trello")
    args = parser.parse_args()

    if args.dry_run:
        for list_name in LISTS:
            print(f"\n## {list_name}")
            for card in [c for c in CARDS if c["list"] == list_name]:
                print(f"- {card['title']} [{card['priority']}, {card['estimate']}]")
        return

    existing_lists = request("GET", f"/boards/{BOARD_ID}/lists", {"filter": "open"})
    list_by_name = {lst["name"]: lst for lst in existing_lists}

    for list_name in LISTS:
        if list_name not in list_by_name:
            created = request("POST", "/lists", {"name": list_name, "idBoard": BOARD_ID, "pos": "bottom"})
            list_by_name[list_name] = created
            print(f"Created list: {list_name}")

    existing_cards = request("GET", f"/boards/{BOARD_ID}/cards", {"filter": "open", "fields": "name"})
    existing_names = {card["name"] for card in existing_cards}

    for card in CARDS:
        if card["title"] in existing_names:
            print(f"Skipped existing card: {card['title']}")
            continue

        request("POST", "/cards", {
            "idList": list_by_name[card["list"]]["id"],
            "name": card["title"],
            "desc": card_description(card),
            "pos": "bottom",
        })
        print(f"Created card: {card['title']} → {card['list']}")


if __name__ == "__main__":
    main()

