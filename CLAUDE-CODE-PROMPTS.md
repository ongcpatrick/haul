# Claude Code Prompts for Haul

Use these prompts one at a time. They are written for the current project folder and current alpha state.

Best order for the Project III submission:

1. Project III Submission Package
2. Chrome Alpha Runtime Audit
3. Security and Privacy Hardening
4. GitHub Repo and Release Prep
5. Trello Sprint 1.D Plan
6. Reference Customer Feedback System
7. Final Pre-Submission Audit

After the assignment package is safe, run:

8. Product Extraction Upgrade
9. Wireframe Parity Pass
10. Open-Source Pattern Research

---

## Prompt 1: Project III Submission Package

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Prepare the complete Project III: Alpha Release submission package for Haul.

Current project state:
- The Chrome extension lives in haul-extension/
- The alpha zip exists as haul-v0.1.0.zip
- Existing docs include IME403-PROPOSAL.md, HAUL-PRODUCT-SPEC.md, DEV-SPRINT-PLAN.md, LAUNCH-PLAYBOOK.md, USER-RESEARCH-PLAYBOOK.md, METRICS-AND-GROWTH.md, and ALPHA-RELEASE-EMAIL.md
- Wireframes live in Mid-Fidelity Wireframes for Haul/

Project III requires:
1. Link to GitHub repository for the version-controlled Chrome extension
2. Release notes on GitHub with instructions for how to use the extension
3. Downloaded .zip of working Alpha Release version 0.1 installable locally in Chrome
4. Email template announcing preview Alpha release to 10 reference users
5. Instructions on how to install
6. Instructions on where to find release notes
7. Quantitative and qualitative feedback mechanisms
8. Link to Trello Agile Board updated with progress, backlog, and Sprint 1.D user stories

Create or update these files:
- PROJECT-III-SUBMISSION.md
- REFERENCE-CUSTOMER-FEEDBACK.md
- TRELLO-SPRINT-1D.md
- QA-TESTING-SCRIPT.md
- ALPHA-RELEASE-EMAIL.md
- haul-extension/README.md
- haul-extension/RELEASE-NOTES.md
- haul-extension/PRIVACY.md

Rules:
- Do not invent links that do not exist.
- Use placeholders like [GitHub repo link], [GitHub release link], [Trello board link], and [Google Form link] where I need to fill something manually.
- Keep the repo name as haul and owner as ongcpatrick.
- Keep the extension version as 0.1.0.
- Do not add dependencies.
- Do not delete wireframes or project docs.

Output:
- Make the file changes directly.
- Recreate haul-v0.1.0.zip if any haul-extension files change.
- In your final response, give me the exact Canvas text entry I can paste, with placeholders clearly marked.
- Also list every item that is Ready vs Needs Manual Action.
```

---

## Prompt 2: Chrome Alpha Runtime Audit

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Make haul-extension/ reliable enough to install locally in Chrome as Alpha v0.1.0.

Inspect:
- haul-extension/manifest.json
- haul-extension/background.js
- haul-extension/content-script.js
- haul-extension/lib/storage.js
- haul-extension/lib/extractor.js
- haul-extension/popup/popup.html
- haul-extension/popup/popup.js
- haul-extension/sidepanel/sidepanel.html
- haul-extension/sidepanel/sidepanel.js
- haul-extension/dashboard/dashboard.html
- haul-extension/dashboard/dashboard.js
- haul-extension/icons/

Check and fix:
- Manifest V3 validity
- Missing files referenced by manifest.json
- Whether the action popup and chrome.action.onClicked behavior conflict
- Whether sidePanel.open works from the popup path
- Whether Save to Haul can save without crashing
- Whether chrome.storage.local updates the badge count
- Whether side panel loads saved items
- Whether Compare All opens the dashboard
- Whether Clear All and Remove work
- Whether Share works or fails gracefully
- Whether the zip includes every required file

Constraints:
- Vanilla JS/CSS only
- No build step
- No external dependencies
- Keep version at 0.1.0
- Do not push to GitHub
- Do not change product strategy docs unless they contain incorrect install instructions

Verification:
- Validate manifest.json with python3 -m json.tool or equivalent
- List all manifest-referenced files and confirm they exist
- Recreate haul-v0.1.0.zip
- List the zip contents
- Give a manual Chrome testing checklist for anything you cannot verify from terminal
```

---

## Prompt 3: Security and Privacy Hardening

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Harden the Haul alpha before sending it to reference customers.

Inspect:
- haul-extension/manifest.json
- haul-extension/background.js
- haul-extension/content-script.js
- haul-extension/sidepanel/sidepanel.js
- haul-extension/dashboard/dashboard.js
- haul-extension/README.md
- haul-extension/PRIVACY.md

Look specifically for:
- Overbroad permissions or host permissions
- Claims in README/PRIVACY that are not true
- Product names, site names, image URLs, or source URLs inserted with unsafe innerHTML
- Inline onclick handlers that include untrusted product URLs
- Missing message validation in background.js
- Any way a malicious shopping page could inject HTML/JS into sidepanel or dashboard
- Share URL risks from encoded product data

Fix directly:
- Add small escaping/sanitization helpers where product data is rendered.
- Avoid inline onclick with untrusted URLs; attach event listeners instead.
- Validate message.type and required fields in background.js.
- Keep local-only storage behavior.
- Reduce permissions only if doing so does not break the alpha.
- Update README/PRIVACY if the privacy language needs to be more accurate.

Constraints:
- No dependencies.
- Keep the extension installable with Load unpacked.
- Keep version 0.1.0.
- Recreate haul-v0.1.0.zip after changes.

Output:
- Findings grouped by High / Medium / Low.
- Files changed.
- Remaining risks that are acceptable for alpha.
```

---

## Prompt 4: GitHub Repo and Release Prep

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Prepare this project to be pushed to GitHub under:
https://github.com/ongcpatrick/haul

Do not push unless I explicitly ask.

Create or update:
- .gitignore
- LICENSE using MIT
- README.md at project root that explains the full class project and points to haul-extension/
- haul-extension/README.md
- haul-extension/RELEASE-NOTES.md
- PROJECT-III-SUBMISSION.md

Repo organization:
- Keep haul-extension/ as the alpha extension.
- Keep haul-v0.1.0.zip at project root.
- Keep wireframes folder.
- Keep proposal/product docs.
- Do not include node_modules, .DS_Store, build caches, or temporary files.

Make release notes ready for GitHub Release v0.1.0:
- Title: Haul v0.1.0 Alpha Release
- Include install steps for Load unpacked
- Include known issues
- Include feedback links as placeholders

Output:
- Exact git commands to initialize repo if needed.
- Exact commands to add remote, commit, push, and tag v0.1.0.
- Suggested commit message.
- Suggested GitHub release body.
- List links I still need to create manually.
```

---

## Prompt 5: Trello Sprint 1.D Plan

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Create a Trello-ready Agile board plan for Haul Sprint 1.D: Dev, Feb 19 - Mar 03.

Output file:
TRELLO-SPRINT-1D.md

Use these Trello lists:
- Done
- In Progress
- Sprint 1.D Planned
- Testing / QA
- Backlog
- Blocked

For each card include:
- Card title
- User story
- Acceptance criteria
- Priority: P0, P1, or P2
- Suggested owner: Patrick, Trevor, Kendall, or Unassigned
- Labels: Chrome Extension, Product Extraction, UI, Docs, QA, Research, Launch
- Estimate: S, M, L

Reflect current progress:
- Alpha scaffold exists
- Product save flow exists
- Side panel exists
- Comparison dashboard exists
- Alpha zip exists
- Release notes exist
- Email template exists

Must include planned cards for:
- Manual Chrome install testing
- Fix extraction bugs from reference users
- Security/privacy cleanup
- GitHub repo push
- GitHub release v0.1.0
- Feedback form creation
- 10 reference user outreach
- Trello board update
- Better extraction for Amazon/Nike/Target/Best Buy/ASOS/Zara/H&M/Nordstrom/Wayfair/eBay
- Wireframe parity cleanup
- Sprint review demo

Also include:
- Sprint goal
- Definition of done
- Demo script for sprint review
- Items moved to next sprint
```

---

## Prompt 6: Reference Customer Feedback System

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Build the complete alpha feedback system for Haul's 10 reference customers.

Create folder:
Project-III-Feedback/

Inside it create:
- REFERENCE-CUSTOMER-LIST-TEMPLATE.md
- GOOGLE-FORM-QUESTIONS.md
- QUALITATIVE-INTERVIEW-SCRIPT.md
- ALPHA-EMAIL.md
- FOLLOW-UP-EMAIL.md
- FEEDBACK-TRACKER.csv
- SYNTHESIS-TEMPLATE.md

Feedback mechanisms required:
- Quantitative: 5-question Google Form
- Qualitative: 15-minute interview script

Include Haul-specific questions:
- Did the Save to Haul button appear?
- Which shopping site did you test?
- Did it capture the correct product name?
- Did it capture the correct price?
- Was the side-by-side comparison useful?
- Did you click Go to Site?
- Would you use Haul again?
- What would make Haul Pro worth $4.99/month?

Include:
- Install instructions for local Chrome alpha
- What screenshots users should send if something breaks
- 3-day follow-up email
- How to summarize feedback for class

Output:
- Files created.
- Short instructions for what I need to do before sending emails.
```

---

## Prompt 7: Final Pre-Submission Audit

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Do the final Project III pre-submission audit.

Run/check:
- rg -n "Harvest|harvest" .
- python3 -m json.tool haul-extension/manifest.json
- Check every file referenced in manifest.json exists
- unzip -l haul-v0.1.0.zip
- Confirm version is 0.1.0 in manifest and release notes
- Confirm README install instructions exist
- Confirm release notes exist
- Confirm privacy policy exists
- Confirm alpha email exists
- Confirm feedback mechanism docs exist
- Confirm Trello Sprint 1.D doc exists
- Confirm Project III submission doc exists
- Confirm no placeholders are accidentally hidden except required manual links

Fix anything broken.

Output:
- Final Ready / Not Ready verdict
- Exact files to submit
- Exact links I still need manually
- Exact next actions before Monday 11:59pm
- Exact Canvas text entry to paste
```

---

## Prompt 8: Product Extraction Upgrade

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Make Haul's product extraction much more reliable without adding a backend or dependencies.

Main file:
haul-extension/content-script.js

Also inspect:
- haul-extension/lib/extractor.js
- haul-extension/sidepanel/sidepanel.js
- haul-extension/dashboard/dashboard.js

Implement a layered extraction strategy:
1. Site-specific selectors
2. schema.org JSON-LD Product parsing
3. Open Graph/meta tag fallback
4. Generic DOM fallback

Supported sites:
- Amazon
- Nike
- ASOS
- Target
- Best Buy
- Zara
- H&M
- Nordstrom
- Wayfair
- eBay

Fields:
- id
- name
- price
- originalPrice
- imageUrl
- sourceUrl
- siteName
- savedAt
- extractionQuality: "full", "partial", or "fallback"
- missingFields: array

Behavior:
- Never crash when selectors fail.
- Still allow saving partial products.
- Make relative image URLs absolute.
- Clean prices into numbers.
- Prefer visible product data over duplicate hidden data.
- Show a subtle partial extraction label in side panel/dashboard when extractionQuality is partial or fallback.

Constraints:
- Vanilla JS only.
- No AI calls.
- No external dependencies.
- Keep the current UI flow intact.

Verification:
- Create QA-EXTRACTION-URLS.md with one test URL per supported site.
- Recreate haul-v0.1.0.zip.
- Report which sites still need real-browser manual verification.
```

---

## Prompt 9: Wireframe Parity Pass

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Make the vanilla alpha extension visually align with the existing Haul wireframes.

Use as reference:
- Mid-Fidelity Wireframes for Haul/src/app/App.tsx
- Mid-Fidelity Wireframes for Haul/src/app/components/ProductPageView.tsx
- Mid-Fidelity Wireframes for Haul/src/app/components/SideTrayView.tsx
- Mid-Fidelity Wireframes for Haul/src/app/components/ComparisonDashboard.tsx
- Mid-Fidelity Wireframes for Haul/src/app/components/EmptyState.tsx
- Mid-Fidelity Wireframes for Haul/src/app/components/ShareComparison.tsx
- Mid-Fidelity Wireframes for Haul/src/app/components/FirstTimeOnboarding.tsx

Update in haul-extension/:
- Floating Save button
- Toast confirmation
- Popup
- Side panel
- Empty state
- Product cards
- Price drop / sale badges
- Comparison dashboard
- Share flow

Design constraints:
- Primary: #4f46e5
- Savings: #10b981
- Sale/attention: #f59e0b
- Error/urgent: #f43f5e
- Font: system Inter-style stack
- Side tray should feel like the 320px wireframe
- Keep cards compact and professional

Technical constraints:
- No React build in haul-extension
- No Tailwind in haul-extension
- No external dependencies
- Must still load unpacked in Chrome

Verification:
- List which wireframe screens were matched.
- List which wireframe details were not implemented and why.
- Recreate haul-v0.1.0.zip.
```

---

## Prompt 10: Open-Source Pattern Research

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Research open-source Chrome extension patterns we can safely learn from for Haul.

Look for:
- Shopping comparison Chrome extensions
- Price tracker Chrome extensions
- Wishlist or product-save Chrome extensions
- Product page scraping extensions
- Manifest V3 side panel templates
- Chrome storage/message passing examples

For each useful repo:
- Clone into /tmp
- Check license
- Inspect key files
- Summarize useful ideas
- Do not copy incompatible licensed code
- Only adapt safe patterns or small original implementations inspired by the research

Focus areas:
- Product extraction strategy
- schema.org JSON-LD parsing
- DOM selector robustness
- Side panel architecture
- chrome.storage structure
- Message passing
- Product card and comparison UI patterns

Create:
- OPEN-SOURCE-RESEARCH.md

If you adapt code:
- Explain exactly what changed
- Add attribution if license requires it
- Recreate haul-v0.1.0.zip
```

