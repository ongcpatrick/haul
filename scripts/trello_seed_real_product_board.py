#!/usr/bin/env python3
"""Seed the Haul Trello board like a real product board.

Credentials are read from environment variables:
  TRELLO_KEY
  TRELLO_TOKEN

Usage:
  python3 scripts/trello_seed_real_product_board.py --dry-run
  python3 scripts/trello_seed_real_product_board.py
"""

import argparse
import json
import os
import sys
import urllib.parse
import urllib.request


BOARD_ID = "IDD33TqM"
API_BASE = "https://api.trello.com/1"

LISTS = [
    "Done",
    "Sprint Ready",
    "In Progress",
    "QA / Testing",
    "Product Backlog",
    "Revenue Experiments",
    "Blocked",
]

CARDS = [
    {
        "list": "Done",
        "title": "Alpha Extension Scaffold",
        "epic": "Alpha",
        "priority": "P0",
        "owner": "Patrick",
        "why": "Gives the team a real Chrome extension artifact.",
        "acceptance": "MV3 extension loads unpacked in Chrome, icons exist, version is 0.1.0.",
        "checklist": ["Manifest V3 exists", "Icons exist", "Extension version is 0.1.0", "Local install instructions exist"],
    },
    {
        "list": "Done",
        "title": "Product Save Flow",
        "epic": "Alpha",
        "priority": "P0",
        "owner": "Patrick",
        "why": "This is the first half of the core loop.",
        "acceptance": "Save button appears on product pages and saves product data to Chrome local storage.",
        "checklist": ["Save button appears", "Product data extracts", "Product is saved", "Badge count updates"],
    },
    {
        "list": "Done",
        "title": "Side Panel Saves View",
        "epic": "Alpha",
        "priority": "P0",
        "owner": "Trevor",
        "why": "Lets users keep browsing while saved items stay visible.",
        "acceptance": "Side panel opens and shows saved products with name, price, image, and remove controls.",
        "checklist": ["Panel opens", "Saved products render", "Remove works", "Clear all works"],
    },
    {
        "list": "Done",
        "title": "Comparison Dashboard",
        "epic": "Alpha",
        "priority": "P0",
        "owner": "Kendall",
        "why": "This is the main value moment.",
        "acceptance": "Compare All opens a dashboard with products as columns and useful product fields as rows.",
        "checklist": ["Dashboard opens", "Products display as columns", "Go to Site works", "Share link exists"],
    },
    {
        "list": "Done",
        "title": "Layered Product Extraction",
        "epic": "Extraction",
        "priority": "P0",
        "owner": "Patrick",
        "why": "A real product must work across many retail sites.",
        "acceptance": "Extraction uses schema.org JSON-LD, Open Graph, site-specific selectors, and generic DOM fallback.",
        "checklist": ["JSON-LD strategy", "Open Graph strategy", "Site-specific strategy", "Generic fallback", "Extraction quality fields"],
    },
    {
        "list": "Done",
        "title": "Security Hardening Pass",
        "epic": "Trust",
        "priority": "P0",
        "owner": "Patrick",
        "why": "Product data from shopping sites is untrusted.",
        "acceptance": "User-controlled product data is escaped/sanitized, inline handlers removed, background messages validated.",
        "checklist": ["No raw product innerHTML", "No inline onclick", "No inline onerror", "Message validation added"],
    },
    {
        "list": "Done",
        "title": "GitHub Alpha Release",
        "epic": "Launch",
        "priority": "P0",
        "owner": "Patrick",
        "why": "Gives graders/testers a version-controlled release.",
        "acceptance": "Repo pushed, tag v0.1.0 pushed, GitHub release published, zip uploaded.",
        "checklist": ["Repo pushed", "Tag pushed", "Release published", "Zip uploaded"],
    },
    {
        "list": "Done",
        "title": "Project Docs Rewritten For Haul",
        "epic": "Docs",
        "priority": "P0",
        "owner": "Patrick",
        "why": "Product narrative matches the actual shopping extension.",
        "acceptance": "Proposal, product spec, launch plan, sprint plan, metrics, and research playbook all describe Haul.",
        "checklist": ["Proposal updated", "Product spec updated", "Metrics updated", "Launch plan updated", "Research plan updated"],
    },
    {
        "list": "Sprint Ready",
        "title": "Manual Chrome QA Across Priority Sites",
        "epic": "QA",
        "priority": "P0",
        "owner": "Unassigned",
        "why": "The alpha is only real if it works on live shopping pages.",
        "acceptance": "Test Amazon, Nike, Target, Best Buy, ASOS, and one unsupported site. Record pass/fail and bugs.",
        "checklist": ["Install unpacked", "Save two products", "Open side panel", "Compare all", "Test share link", "Record extraction quality"],
    },
    {
        "list": "Sprint Ready",
        "title": "Create Reference Customer Feedback Form",
        "epic": "User Research",
        "priority": "P0",
        "owner": "Unassigned",
        "why": "Project III requires quantitative feedback, and the product needs real user signals.",
        "acceptance": "Google Form exists and asks about install success, site tested, extraction quality, usefulness, and willingness to pay.",
        "checklist": ["Create Google Form", "Add 5 questions", "Copy share link", "Add link to email template"],
    },
    {
        "list": "Sprint Ready",
        "title": "Send Alpha To 10 Reference Customers",
        "epic": "User Research",
        "priority": "P0",
        "owner": "Unassigned",
        "why": "Real users expose problems faster than internal testing.",
        "acceptance": "10 users receive alpha release email with repo/release link, install instructions, zip, and feedback form.",
        "checklist": ["Finalize 10 users", "Personalize email", "Send release link", "Track responses"],
    },
    {
        "list": "Sprint Ready",
        "title": "Fix Top 3 Alpha Bugs",
        "epic": "QA",
        "priority": "P0",
        "owner": "Unassigned",
        "why": "Focuses the team on problems users actually hit.",
        "acceptance": "Top 3 bugs from manual/reference testing are reproduced, fixed, committed, and noted in release notes.",
        "checklist": ["Collect bugs", "Rank by impact", "Fix top 3", "Rebuild zip", "Update release notes"],
    },
    {
        "list": "Sprint Ready",
        "title": "Update Canvas Submission Links",
        "epic": "Class Submission",
        "priority": "P0",
        "owner": "Patrick",
        "why": "Prevents broken or placeholder links in the final submission.",
        "acceptance": "GitHub repo, release, Trello board, Google Form, and zip attachment are all included.",
        "checklist": ["Add repo link", "Add release link", "Add Trello link", "Add Google Form link", "Attach zip"],
    },
    {
        "list": "QA / Testing",
        "title": "Shared Comparison Link QA",
        "epic": "QA",
        "priority": "P1",
        "owner": "Unassigned",
        "why": "Shared comparisons are part of the user value proposition.",
        "acceptance": "Share button copies a link, valid shared data opens correctly, invalid shared data fails gracefully.",
        "checklist": ["Save 2 products", "Copy share link", "Open shared link", "Test invalid link"],
    },
    {
        "list": "QA / Testing",
        "title": "Storage And Badge QA",
        "epic": "QA",
        "priority": "P1",
        "owner": "Unassigned",
        "why": "Saves must persist and the badge must reflect reality.",
        "acceptance": "Badge count updates after save/remove/clear, and products persist after Chrome restart.",
        "checklist": ["Save product", "Remove product", "Clear all", "Restart Chrome", "Check persisted saves"],
    },
    {
        "list": "QA / Testing",
        "title": "Side Panel And Dashboard QA",
        "epic": "QA",
        "priority": "P1",
        "owner": "Unassigned",
        "why": "The core workflow depends on both surfaces.",
        "acceptance": "Side panel opens, remove works, clear all works, Compare All opens, Go to Site opens correct URL.",
        "checklist": ["Open side panel", "Remove item", "Clear all", "Open dashboard", "Click Go to Site"],
    },
    {
        "list": "Product Backlog",
        "title": "Add Site-Specific Extractors For H&M, Nordstrom, Wayfair, eBay, Adidas, Converse",
        "epic": "Extraction",
        "priority": "P1",
        "owner": "Unassigned",
        "why": "These sites are detected but still rely on schema/Open Graph/generic extraction.",
        "acceptance": "Each site has a tested handler or documented reason schema fallback is enough.",
        "checklist": ["H&M", "Nordstrom", "Wayfair", "eBay", "Adidas", "Converse"],
    },
    {
        "list": "Product Backlog",
        "title": "Wireframe Parity Cleanup",
        "epic": "UI",
        "priority": "P1",
        "owner": "Unassigned",
        "why": "The working alpha should visually match the polished wireframes.",
        "acceptance": "Save button, toast, side panel, product cards, empty state, and dashboard align with the wireframes.",
        "checklist": ["Save button", "Toast", "Side panel", "Product cards", "Empty state", "Dashboard"],
    },
    {
        "list": "Product Backlog",
        "title": "First-Run Onboarding",
        "epic": "Activation",
        "priority": "P1",
        "owner": "Unassigned",
        "why": "The aha moment is saving two products and comparing them.",
        "acceptance": "New users understand Save → Tray → Compare without help.",
        "checklist": ["First-run flag", "Onboarding copy", "First save nudge", "Second save nudge", "Compare CTA"],
    },
    {
        "list": "Product Backlog",
        "title": "Chrome Web Store Submission Prep",
        "epic": "Launch",
        "priority": "P1",
        "owner": "Unassigned",
        "why": "Turns the alpha into a public beta.",
        "acceptance": "Store listing, screenshots, privacy disclosure, demo video, and permission justifications are ready.",
        "checklist": ["Listing copy", "Screenshots", "Demo video", "Privacy disclosure", "Permission justifications"],
    },
    {
        "list": "Revenue Experiments",
        "title": "Haul Pro Fake-Door Test",
        "epic": "Revenue",
        "priority": "P1",
        "owner": "Unassigned",
        "why": "Validates willingness to pay before building Stripe.",
        "acceptance": "Pro CTA exists for price drop alerts or AI categorization and captures upgrade interest.",
        "checklist": ["Choose Pro trigger", "Write CTA copy", "Capture interest", "Track conversion"],
    },
    {
        "list": "Revenue Experiments",
        "title": "Price Drop Alerts Validation",
        "epic": "Revenue",
        "priority": "P1",
        "owner": "Unassigned",
        "why": "Price drops are the most obvious reason users might pay.",
        "acceptance": "10 users answer whether price alerts would make Haul worth $4.99/month.",
        "checklist": ["Ask 10 users", "Record yes/no", "Collect price sensitivity", "Decide build/no-build"],
    },
    {
        "list": "Revenue Experiments",
        "title": "Affiliate Revenue Feasibility",
        "epic": "Revenue",
        "priority": "P2",
        "owner": "Unassigned",
        "why": "Go to Site clicks may monetize better than subscriptions.",
        "acceptance": "Research Amazon, Target, Best Buy, Nike, ASOS, and eBay affiliate programs and summarize feasibility.",
        "checklist": ["Amazon", "Target", "Best Buy", "Nike", "ASOS", "eBay"],
    },
    {
        "list": "Revenue Experiments",
        "title": "Landing Page Waitlist Test",
        "epic": "Growth",
        "priority": "P2",
        "owner": "Unassigned",
        "why": "Tests demand outside class users.",
        "acceptance": "Simple landing page or waitlist collects email interest from shopping communities.",
        "checklist": ["Write value prop", "Create waitlist", "Post in one channel", "Track signups"],
    },
    {
        "list": "Blocked",
        "title": "Trello API Automation",
        "epic": "Ops",
        "priority": "P2",
        "owner": "Patrick",
        "why": "Automation needs credentials.",
        "acceptance": "TRELLO_KEY and TRELLO_TOKEN exported locally and script runs successfully.",
        "checklist": ["Get API key", "Generate token", "Run dry-run", "Run seed script"],
    },
    {
        "list": "Blocked",
        "title": "Chrome Web Store Developer Account",
        "epic": "Launch",
        "priority": "P1",
        "owner": "Unassigned",
        "why": "Required for public Chrome Web Store beta.",
        "acceptance": "Developer account created and team has access.",
        "checklist": ["Create account", "Pay fee", "Add team access", "Confirm dashboard access"],
    },
    {
        "list": "Blocked",
        "title": "Reference User Contact List",
        "epic": "User Research",
        "priority": "P0",
        "owner": "Unassigned",
        "why": "Cannot send alpha without real names/emails.",
        "acceptance": "10 users listed with user type, email, and outreach status.",
        "checklist": ["Collect names", "Collect emails", "Tag user type", "Assign outreach owner"],
    },
]


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
        f"**Epic:** {card['epic']}",
        f"**Priority:** {card['priority']}",
        f"**Owner:** {card['owner']}",
        "",
        f"**Why it matters:** {card['why']}",
        "",
        f"**Acceptance criteria:** {card['acceptance']}",
    ])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Print planned changes without writing to Trello")
    args = parser.parse_args()

    if args.dry_run:
        for list_name in LISTS:
            print(f"\n## {list_name}")
            for card in [c for c in CARDS if c["list"] == list_name]:
                print(f"- {card['title']} [{card['priority']}, {card['epic']}]")
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

        created_card = request("POST", "/cards", {
            "idList": list_by_name[card["list"]]["id"],
            "name": card["title"],
            "desc": card_description(card),
            "pos": "bottom",
        })
        print(f"Created card: {card['title']} → {card['list']}")

        if card.get("checklist"):
            checklist = request("POST", "/checklists", {
                "idCard": created_card["id"],
                "name": "Acceptance checklist",
            })
            for item in card["checklist"]:
                request("POST", f"/checklists/{checklist['id']}/checkItems", {"name": item, "pos": "bottom"})


if __name__ == "__main__":
    main()

