# Haul Trello Board Plan
## Sprint 1.D: Dev, Feb 19 - Mar 03

**Sprint Goal:** Ship and validate Haul Alpha v0.1.0 with 10 reference customers, then use feedback to improve extraction reliability and comparison UX.

**Definition of Done:**
- Card has clear acceptance criteria.
- Code changes are committed to GitHub.
- Alpha zip is rebuilt if extension files changed.
- Feature is manually tested in Chrome.
- Known bugs are documented.

---

## Done

### Card: Manifest V3 Alpha Scaffold
- **User story:** As a tester, I need a Chrome extension that can be installed locally so I can try Haul.
- **Acceptance criteria:** Extension loads via Chrome Developer Mode; manifest version is 0.1.0; icons exist.
- **Priority:** P0
- **Owner:** Patrick
- **Labels:** Chrome Extension, QA
- **Estimate:** M

### Card: Product Save Flow
- **User story:** As a shopper, I want to save products while browsing so I do not lose options across tabs.
- **Acceptance criteria:** Save to Haul button appears on product pages; clicking saves product data to Chrome storage.
- **Priority:** P0
- **Owner:** Patrick
- **Labels:** Chrome Extension, Product Extraction
- **Estimate:** L

### Card: Side Panel Saves View
- **User story:** As a shopper, I want to see saved products in a side tray while I keep browsing.
- **Acceptance criteria:** Side panel opens; saved products display with name, price, image, and remove button.
- **Priority:** P0
- **Owner:** Trevor
- **Labels:** UI, Chrome Extension
- **Estimate:** M

### Card: Comparison Dashboard
- **User story:** As a shopper, I want to compare saved products side-by-side so I can choose confidently.
- **Acceptance criteria:** Compare All opens dashboard; products appear as columns; Go to Site opens product link.
- **Priority:** P0
- **Owner:** Kendall
- **Labels:** UI, Chrome Extension
- **Estimate:** L

### Card: GitHub Alpha Release
- **User story:** As a grader, I need version-controlled source and release notes so I can review the alpha.
- **Acceptance criteria:** GitHub repo pushed; tag v0.1.0 exists; release created; zip uploaded.
- **Priority:** P0
- **Owner:** Patrick
- **Labels:** Docs, Launch
- **Estimate:** S

### Card: Rewrite Project Docs from Harvest to Haul
- **User story:** As a team, we need all project materials to reflect the Haul shopping comparison product.
- **Acceptance criteria:** Proposal, product spec, launch plan, metrics plan, sprint plan, and research playbook all use Haul positioning.
- **Priority:** P0
- **Owner:** Patrick
- **Labels:** Docs
- **Estimate:** M

### Card: Package Alpha Zip v0.1.0
- **User story:** As a grader or tester, I need a downloadable zip that can be installed locally in Chrome.
- **Acceptance criteria:** `haul-v0.1.0.zip` exists and contains the full `haul-extension` folder.
- **Priority:** P0
- **Owner:** Patrick
- **Labels:** Launch, QA
- **Estimate:** S

### Card: Write README, Release Notes, and Privacy Policy
- **User story:** As a tester, I need clear install instructions, release notes, and privacy information.
- **Acceptance criteria:** `README.md`, `RELEASE-NOTES.md`, and `PRIVACY.md` exist in `haul-extension` and are linked from GitHub.
- **Priority:** P0
- **Owner:** Patrick
- **Labels:** Docs, Launch
- **Estimate:** M

### Card: Security Hardening Pass
- **User story:** As a user, I need Haul to safely render product data from external shopping sites.
- **Acceptance criteria:** Unsafe product-data rendering and inline event handlers are removed; background messages are validated.
- **Priority:** P0
- **Owner:** Patrick
- **Labels:** QA, Chrome Extension
- **Estimate:** M

### Card: Alpha Release Email Template
- **User story:** As a team, we need a reusable email to send the alpha to 10 reference customers.
- **Acceptance criteria:** `ALPHA-RELEASE-EMAIL.md` includes install steps, test instructions, and feedback link placeholders.
- **Priority:** P0
- **Owner:** Patrick
- **Labels:** Research, Launch
- **Estimate:** S

### Card: Project III Submission Materials
- **User story:** As a team, we need a clear checklist and Canvas text for the Alpha Release submission.
- **Acceptance criteria:** `PROJECT-III-SUBMISSION.md` exists with repo, release, Trello, install, and feedback details.
- **Priority:** P0
- **Owner:** Patrick
- **Labels:** Docs, Launch
- **Estimate:** S

### Card: Trello Sprint 1.D Plan Draft
- **User story:** As a team, we need Sprint 1.D user stories and backlog ready to copy or seed into Trello.
- **Acceptance criteria:** `TRELLO-SPRINT-1D.md` and the Trello seed script contain Done, Planned, QA, Backlog, and Blocked cards.
- **Priority:** P0
- **Owner:** Patrick
- **Labels:** Docs, Launch
- **Estimate:** S

---

## Sprint 1.D Planned

### Card: Manual Chrome QA Pass
- **User story:** As a team, we need confidence the alpha zip works before sending it to users.
- **Acceptance criteria:** Test Amazon, Nike, Target, Best Buy, and ASOS; document pass/fail and bugs.
- **Priority:** P0
- **Owner:** Unassigned
- **Labels:** QA
- **Estimate:** M

### Card: Send Alpha Email to 10 Reference Customers
- **User story:** As a team, we need real feedback from target users to validate Haul.
- **Acceptance criteria:** 10 users receive install instructions, release notes link, zip/release link, and Google Form link.
- **Priority:** P0
- **Owner:** Unassigned
- **Labels:** Research, Launch
- **Estimate:** M

### Card: Create Google Feedback Form
- **User story:** As a team, we need structured feedback so we can measure alpha quality.
- **Acceptance criteria:** Google Form includes install outcome, site tested, extraction correctness, usefulness rating, and Pro willingness-to-pay question.
- **Priority:** P0
- **Owner:** Unassigned
- **Labels:** Research
- **Estimate:** S

### Card: Improve Extraction for 10 Supported Sites
- **User story:** As a shopper, I want Haul to capture accurate product data on the sites I actually use.
- **Acceptance criteria:** Amazon, Nike, ASOS, Target, Best Buy, Zara, H&M, Nordstrom, Wayfair, and eBay have test notes and selector fixes where needed.
- **Priority:** P1
- **Owner:** Unassigned
- **Labels:** Product Extraction, QA
- **Estimate:** L

### Card: Wireframe Parity Cleanup
- **User story:** As a tester, I want the alpha UI to match the wireframes so the product feels polished.
- **Acceptance criteria:** Save button, side panel, empty state, product cards, and dashboard match core wireframe styling.
- **Priority:** P1
- **Owner:** Unassigned
- **Labels:** UI
- **Estimate:** M

---

## Backlog

### Card: Price Drop Alerts Prototype
- **User story:** As a shopper, I want to know when saved products drop in price so I can buy at the right time.
- **Acceptance criteria:** Define polling approach and fake-door Pro CTA before implementation.
- **Priority:** P1
- **Owner:** Unassigned
- **Labels:** Chrome Extension, Product Extraction
- **Estimate:** L

### Card: Haul Pro Fake-Door Test
- **User story:** As a team, we want to test willingness to pay before building subscriptions.
- **Acceptance criteria:** Upgrade CTA records user interest through form or email waitlist.
- **Priority:** P1
- **Owner:** Unassigned
- **Labels:** Launch, Research
- **Estimate:** M

### Card: Affiliate Revenue Research
- **User story:** As a team, we want to know if affiliate links can monetize Go to Site clicks.
- **Acceptance criteria:** Research Amazon, Target, Best Buy, Nike, ASOS, eBay programs and document feasibility.
- **Priority:** P2
- **Owner:** Unassigned
- **Labels:** Research, Launch
- **Estimate:** M

---

## Testing / QA

### Card: Shared Link QA
- **User story:** As a shopper, I want shared comparisons to open correctly for someone else.
- **Acceptance criteria:** Share button copies link; link opens dashboard with saved products; invalid shared data fails gracefully.
- **Priority:** P1
- **Owner:** Unassigned
- **Labels:** QA, UI
- **Estimate:** S

### Card: Security and Privacy QA
- **User story:** As a user, I need Haul to handle product data safely and not leak personal information.
- **Acceptance criteria:** No unsafe product-data `innerHTML`; privacy policy matches extension behavior; permissions are documented.
- **Priority:** P0
- **Owner:** Unassigned
- **Labels:** QA, Docs
- **Estimate:** M

---

## Blocked

### Card: Trello CLI Automation
- **User story:** As a team, we want to automate Trello updates from CLI.
- **Acceptance criteria:** .NET installed, Trello API key/token configured, board update command tested.
- **Priority:** P2
- **Owner:** Unassigned
- **Labels:** Launch
- **Estimate:** M
