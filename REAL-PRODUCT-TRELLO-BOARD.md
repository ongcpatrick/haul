# Haul Real Product Trello Board

This is the Trello structure Haul should use as a real product, not only as a class checklist.

The board should answer four questions at a glance:

1. What have we already shipped?
2. What are we actively validating with users?
3. What engineering work is next?
4. What work gets us closer to revenue?

---

## Recommended Lists

### Done
Completed work that is already committed, pushed, or shipped.

### Sprint Ready
Work that is ready to be pulled into the current sprint. These cards should have clear acceptance criteria.

### In Progress
Cards someone is actively working on right now. Keep this list small.

### QA / Testing
Built work that needs manual testing, user testing, or bug verification.

### Product Backlog
Important product/engineering work that is not part of the current sprint.

### Revenue Experiments
Work that directly tests whether Haul can make money.

### Blocked
Work that cannot move until a dependency is resolved.

---

## Done Cards

### Alpha Extension Scaffold
- **Epic:** Alpha
- **Why it matters:** Gives the team a real Chrome extension artifact.
- **Acceptance criteria:** MV3 extension loads unpacked in Chrome, icons exist, version is 0.1.0.

### Product Save Flow
- **Epic:** Alpha
- **Why it matters:** This is the first half of the core loop.
- **Acceptance criteria:** Save button appears on product pages and saves product data to Chrome local storage.

### Side Panel Saves View
- **Epic:** Alpha
- **Why it matters:** Lets users keep browsing while saved items stay visible.
- **Acceptance criteria:** Side panel opens and shows saved products with name, price, image, and remove controls.

### Comparison Dashboard
- **Epic:** Alpha
- **Why it matters:** This is the main value moment.
- **Acceptance criteria:** Compare All opens a dashboard with products as columns and useful product fields as rows.

### Layered Product Extraction
- **Epic:** Extraction
- **Why it matters:** A real product must work across many retail sites.
- **Acceptance criteria:** Extraction uses schema.org JSON-LD, Open Graph, site-specific selectors, and generic DOM fallback.

### Security Hardening Pass
- **Epic:** Trust
- **Why it matters:** Product data from shopping sites is untrusted.
- **Acceptance criteria:** User-controlled product data is escaped/sanitized, inline handlers removed, background messages validated.

### GitHub Alpha Release
- **Epic:** Launch
- **Why it matters:** Gives graders/testers a version-controlled release.
- **Acceptance criteria:** Repo pushed, tag `v0.1.0` pushed, GitHub release published, zip uploaded.

### Project Docs Rewritten For Haul
- **Epic:** Docs
- **Why it matters:** Product narrative matches the actual shopping extension.
- **Acceptance criteria:** Proposal, product spec, launch plan, sprint plan, metrics, and research playbook all describe Haul.

---

## Sprint Ready Cards

### Manual Chrome QA Across Priority Sites
- **Epic:** QA
- **Why it matters:** The alpha is only real if it works on live shopping pages.
- **Acceptance criteria:** Test Amazon, Nike, Target, Best Buy, ASOS, and one unsupported site. Record pass/fail and bugs.
- **Checklist:** Install unpacked; save two products; open side panel; compare all; test share link; note extraction quality.

### Create Reference Customer Feedback Form
- **Epic:** User Research
- **Why it matters:** Project III requires quantitative feedback, and the product needs real user signals.
- **Acceptance criteria:** Google Form exists and asks about install success, site tested, extraction quality, usefulness, and willingness to pay.

### Send Alpha To 10 Reference Customers
- **Epic:** User Research
- **Why it matters:** Real users expose problems faster than internal testing.
- **Acceptance criteria:** 10 users receive alpha release email with repo/release link, install instructions, zip, and feedback form.

### Fix Top 3 Alpha Bugs
- **Epic:** QA
- **Why it matters:** Focuses the team on problems users actually hit.
- **Acceptance criteria:** Top 3 bugs from manual/reference testing are reproduced, fixed, committed, and noted in release notes.

### Update Canvas Submission Links
- **Epic:** Class Submission
- **Why it matters:** Prevents broken or placeholder links in the final submission.
- **Acceptance criteria:** GitHub repo, release, Trello board, Google Form, and zip attachment are all included.

---

## QA / Testing Cards

### Shared Comparison Link QA
- **Epic:** QA
- **Acceptance criteria:** Share button copies a link, valid shared data opens correctly, invalid shared data fails gracefully.

### Storage And Badge QA
- **Epic:** QA
- **Acceptance criteria:** Badge count updates after save/remove/clear, and products persist after Chrome restart.

### Side Panel And Dashboard QA
- **Epic:** QA
- **Acceptance criteria:** Side panel opens, remove works, clear all works, Compare All opens, Go to Site opens correct URL.

---

## Product Backlog Cards

### Add Site-Specific Extractors For H&M, Nordstrom, Wayfair, eBay, Adidas, Converse
- **Epic:** Extraction
- **Why it matters:** These sites are detected but still rely on schema/Open Graph/generic extraction.
- **Acceptance criteria:** Each site has a tested handler or documented reason schema fallback is enough.

### Wireframe Parity Cleanup
- **Epic:** UI
- **Why it matters:** The working alpha should visually match the polished wireframes.
- **Acceptance criteria:** Save button, toast, side panel, product cards, empty state, and dashboard align with the wireframes.

### First-Run Onboarding
- **Epic:** Activation
- **Why it matters:** The aha moment is saving two products and comparing them.
- **Acceptance criteria:** New users understand Save → Tray → Compare without help.

### Chrome Web Store Submission Prep
- **Epic:** Launch
- **Why it matters:** Turns the alpha into a public beta.
- **Acceptance criteria:** Store listing, screenshots, privacy disclosure, demo video, and permission justifications are ready.

---

## Revenue Experiments

### Haul Pro Fake-Door Test
- **Epic:** Revenue
- **Why it matters:** Validates willingness to pay before building Stripe.
- **Acceptance criteria:** Pro CTA exists for price drop alerts or AI categorization and captures upgrade interest.

### Price Drop Alerts Validation
- **Epic:** Revenue
- **Why it matters:** Price drops are the most obvious reason users might pay.
- **Acceptance criteria:** 10 users answer whether price alerts would make Haul worth $4.99/month.

### Affiliate Revenue Feasibility
- **Epic:** Revenue
- **Why it matters:** Go to Site clicks may monetize better than subscriptions.
- **Acceptance criteria:** Research Amazon, Target, Best Buy, Nike, ASOS, and eBay affiliate programs and summarize feasibility.

### Landing Page Waitlist Test
- **Epic:** Growth
- **Why it matters:** Tests demand outside class users.
- **Acceptance criteria:** Simple landing page or waitlist collects email interest from shopping communities.

---

## Blocked Cards

### Trello API Automation
- **Blocked by:** Trello API key and token.
- **Unblock criteria:** `TRELLO_KEY` and `TRELLO_TOKEN` exported locally and script runs successfully.

### Chrome Web Store Developer Account
- **Blocked by:** $5 Chrome Web Store developer signup.
- **Unblock criteria:** Developer account created and team has access.

### Reference User Contact List
- **Blocked by:** Final list of 10 names/emails.
- **Unblock criteria:** 10 users listed with user type, email, and outreach status.

