# Haul — Product Spec
## Shopping Comparison Chrome Extension

---

## Product Vision

Online shopping is broken in a specific, fixable way. When someone wants to buy sneakers, a laptop, or a couch, they open 20 to 40 browser tabs across different sites, try to hold prices and specs in their head, and make a purchase decision based on exhaustion instead of information. The tab chaos is not a personality flaw — it is the result of tools that were never designed to work together.

Haul fixes this. You browse any shopping site and save products with one click. Everything you save appears in a 320px side tray while you keep shopping. When you are ready to decide, one button opens a full comparison dashboard — products as columns, specs as rows — so you can see everything at once, filter by category, spot price drops, and go directly to the product page to buy.

The free tier does all of this with no paywall. Haul Pro ($4.99/month) adds AI auto-categorization, price drop alerts, and smart recommendations.

The thesis: Honey solved the "get the best price at checkout" problem. Nobody solved the "compare the right options before deciding" problem. That is what we are building.

---

## Who We Are Building For

**Primary user: online shoppers who research before buying.**

They shop across multiple sites in a single session. They are price-conscious, quality-aware, or both. They have experienced the pain of losing a tab or forgetting a product they found an hour ago. They would compare more carefully if it were not so much work.

Their current shopping session looks like this:
1. Search for the product on Google
2. Open 10+ tabs from different retailers and brand sites
3. Read through product pages, trying to remember what they saw on the last one
4. Lose track of which site had the best price
5. Make a decision based on incomplete information or give up and settle

Steps 2 through 5 are what Haul replaces.

**Secondary user (V2 and beyond): group buyers and gift shoppers.**

Couples buying furniture together. Friends splitting a group gift. Parents and kids picking a laptop for school. These users need to share a set of options with someone else for a joint decision. The shareable comparison link is the feature that unlocks this market.

---

## Core User Loop

1. User lands on a product page while shopping
2. A floating "Save" button appears near the product
3. User clicks Save — product is captured with name, price, image, specs, and source URL
4. A minimized badge in the corner shows the saved item count while the user continues browsing
5. User opens the side tray to see all saved items while still on the current page
6. User clicks "Compare All" to open the full comparison dashboard
7. User filters by category, spots price differences, and clicks "Go to Site" to buy the winner

That is the whole loop. Every feature we build either supports this loop or waits.

---

## Feature Set

### V1 — MVP (Build This Quarter)

**Save button on product pages**
- Content script detects product pages based on URL patterns and DOM signals (price element, add-to-cart button, product title structure)
- Floating "Save" button appears near the product when detected
- One click captures: product name, price, original price (if on sale), product image URL, source URL, site name, timestamp
- Visual toast confirmation that the item was saved
- Works on major shopping sites: Nike, ASOS, Amazon, Target, Zara, H&M, Best Buy, Newegg, Wayfair, IKEA, Nordstrom, eBay

**Minimized badge**
- Small badge in the corner of the browser showing the total number of saved items
- Visible while browsing so users always know their save count without opening the panel
- Click to open the side tray

**Side tray (Chrome Side Panel, 320px)**
- Slides in from the right while keeping the main page visible
- Shows all saved items with compact cards: thumbnail, product name, price, price drop badge if applicable
- Remove individual items with an X button
- Filter button to sort by price, category, or date added
- "Compare All" button opens the full dashboard
- "Clear All" button at the bottom

**Comparison dashboard (full popup, 800px)**
- Products displayed as columns; specs displayed as rows
- Spec rows: Product name, Brand, Price (with original price struck through if on sale), Rating, Available sizes, Source link
- Category filter tabs at the top (auto-detected from product type or manually assigned)
- Price drop badges (emerald), sale badges (amber), low stock badges (rose)
- Remove individual items with X on hover
- "Go to Site" button on each product column opens the product page in a new tab
- Share comparison: generates a URL with encoded product state that can be sent to others
- Export: download comparison as an image or copy as formatted text

**Partial extraction fallback**
- When a site has unusual DOM structure and full extraction fails, show what was successfully captured with a note about what is missing
- Never show a broken state — always show something useful

**First-time onboarding**
- Shown to new users on first install
- Explains the three-step loop: Save → Tray → Compare
- Interactive — user saves a demo product during onboarding to experience the core loop

**Empty state**
- Shown when no items are saved
- Shows the exact thing to do next: visit a shopping site and click Save on a product

**What V1 does not include**
- User accounts or cloud sync (everything stays in Chrome local storage)
- Price drop alerts (V2 — requires polling logic in service worker)
- AI auto-categorization (V2 — categories are manual or detected from URL in V1)
- Smart recommendations (V2)
- Stripe subscription payments (V2 — Pro features gated behind a test mode flag during V1)
- Mobile or Safari support

---

### V2 — Growth Features (Next Quarter)

**Haul Pro tier ($4.99/month, 7-day free trial)**
- Stripe integration for subscription management
- Pro badge and tier gating in the extension UI
- Upgrade prompt shown when free user tries a Pro feature

**AI auto-categorization**
- When user saves a product, Groq API (llama-3.1-8b-instant) auto-assigns a category
- Categories: Shoes, Electronics, Clothing, Home, Beauty, Sports, Books, Food, Other
- User can override the AI category from the side tray
- Cost: ~$0.001 per categorization call at Groq pricing

**Price drop alerts**
- Background service worker polls saved product URLs at configurable intervals
- When a price drops on a saved item, Chrome notification fires
- Alert shows product name, old price, new price, and a "Go to Site" button
- Pro tier only — free users see the alert icon but cannot enable polling

**Smart recommendations**
- After a user saves 3+ items in the same category, suggest similar items they might have missed
- Powered by a simple Groq API call: "User saved these 3 laptops. Suggest 2 alternatives based on the patterns."
- Shown as a "You might also want to compare..." row at the bottom of the dashboard

**Enhanced AI extraction**
- For sites where basic DOM parsing fails, use AI to extract product data from the page HTML
- More accurate price, size, and spec extraction on complex single-page apps

---

### V3 — Professional Features (Six Months Out)

**Shared comparison lists**
- Multiple users can save to the same comparison session
- Share a link that lets collaborators add their own saves
- Great for couples shopping for furniture, families picking electronics, group gift buys

**Affiliate revenue layer**
- When user clicks "Go to Site," route through affiliate links where programs exist (Amazon Associates, etc.)
- Transparent to the user — the link still goes to the correct product
- Estimate: 3-8% commission on purchases. At 1,000 active users with 2 purchases/month at $80 avg order = $4,800/month at 3% commission. This may eventually exceed subscription revenue.

**Safari extension**
- Same core product for Safari on macOS and iOS
- Enables saves to sync across devices via iCloud if user has an account

**Cross-device sync**
- Optional account creation to sync saves across devices
- Required for Safari + Chrome sync scenario

---

## Technical Architecture

### Platform
Chrome Extension, Manifest V3.

### Core components

**Content script**
- Injected into all product pages based on URL match patterns (amazon.com/*, nike.com/*, etc.) plus a broader fallback for unrecognized shopping sites
- Detects product page signals: price element (`[class*="price"]`, schema.org Product markup), product title, add-to-cart button
- Shows floating Save button on detection
- On click: extracts product data and sends message to service worker
- Passive event listeners only — does not interfere with page interactions

**Background service worker**
- Handles all `chrome.storage.local` operations
- Routes AI API calls (Groq) for categorization and recommendations (V2)
- Manages price drop polling logic (V2)
- Handles share link generation (encode product state as base64 URL param)

**Side panel (Chrome Side Panel API)**
- Built with React and Tailwind (same stack as wireframes)
- 320px wide, lives alongside the current page
- Communicates with service worker via `chrome.runtime.sendMessage`
- Shows saves, handles filter, triggers dashboard open

**Comparison dashboard (popup)**
- Opens as a 800px × 600px popup window
- Full comparison table view
- Same React/Tailwind stack

**Chrome storage**
- `chrome.storage.local` for all product saves and session data (larger quota)
- `chrome.storage.sync` for user settings (Pro status, polling interval, preferences)

### AI integration
- Provider: Groq API
- Model: llama-3.1-8b-instant (~150ms TTFT)
- Use cases: auto-categorization (V2), smart recommendations (V2), enhanced extraction fallback (V2)
- All calls made from background service worker — API key stored in `chrome.storage.sync`, never hardcoded

### V1 has no backend
Everything runs locally or through direct API calls from the extension. No server is built until we need user accounts for Pro tier in V2.

---

## Business Model

### Pricing

| Tier | Price | Features |
|------|-------|---------|
| Free Forever | $0 | Unlimited saves, side-by-side comparison, manual categories, export & share |
| Haul Pro | $4.99/month | Everything free + AI auto-categorization, price drop alerts, smart recommendations, advanced AI extraction |
| Haul Pro Annual | $39.99/year ($3.33/month) | Same as Pro monthly, 33% savings |

### Why this pricing works
- $4.99/month is below the psychological $5 threshold. Students will pay this.
- Free tier is genuinely useful — unlimited saves and full comparison — so users adopt it before seeing the paywall.
- Price drop alerts alone will pay for the subscription on one purchase. That is the pitch for conversion.
- Annual plan at $39.99 aligns with back-to-school and holiday shopping seasons when savings are highest.

### Unit economics

| Item | Value |
|------|-------|
| Groq API cost per categorization | ~$0.001 |
| Estimated categorizations per Pro user/month | 50 |
| AI cost per Pro user/month | ~$0.05 |
| Gross margin at $4.99/month | ~99% |

### Revenue at milestones

| Total Installs | Active Users (25%) | Paying Users (6%) | MRR at $4.99 ARPU |
|---------------|-------------------|------------------|-------------------|
| 1,000 | 250 | 15 | $75 |
| 2,000 | 500 | 30 | $150 |
| 5,000 | 1,250 | 75 | $374 |
| 10,000 | 2,500 | 150 | $749 |
| 20,000 | 5,000 | 300 | $1,497 |
| 50,000 | 12,500 | 750 | $3,743 |

Year 1 goal: 10,000 installs, 150 paying users, $750 MRR. Year 2 goal: 50,000 installs, 750 paying users, $3,750 MRR.

### Long-term path: affiliate revenue

When the extension reaches 10,000+ monthly active users, affiliate links become meaningful:
- Route "Go to Site" clicks through affiliate programs where available
- 3-8% commission on qualifying purchases
- At 10,000 MAU × 2 purchases/month × $75 avg order × 5% commission = $7,500/month
- Affiliate revenue at scale likely exceeds subscription revenue and does not require a paywall

---

## Build Order

### Week 1-2: Content script and save button
- Fork MV3 scaffold
- Write content script with product page detection
- Save button appears on detected pages
- Click saves product data to `chrome.storage.local`
- Console log confirms capture of name, price, image, URL
- Minimized badge shows save count

### Week 3-4: Side tray and session view
- Chrome Side Panel API implementation
- Side tray UI: compact product cards, remove button, filter, "Compare All"
- All saves appear in tray with correct data
- Filter sorts by price

### Week 5-6: Comparison dashboard
- Full comparison popup (800px)
- Products as columns, specs as rows
- Category filter tabs
- Price drop / sale / stock badges from saved data
- "Go to Site" button
- Share comparison (encoded URL state)

### Week 7: Polish, onboarding, paywall screens
- First-time onboarding flow (from wireframes)
- Empty state (from wireframes)
- Partial extraction fallback (from wireframes)
- PaywallModal and SubscriptionSettings wired up with `VITE_TEST_MODE` flag
- Error handling for extraction failures

### Week 8: Chrome Web Store prep and beta launch
- Extension works on 10+ major shopping sites without errors
- Privacy policy page live
- CWS listing assets: icon, screenshots (1280×800), promotional tile (440×280), 30-second demo video
- Chrome Web Store developer account ($5 one-time)
- Beta test with 10 reference customers

---

## Demo Script

The demo should take under 60 seconds and show the full loop.

1. Open a product page on Nike.com (sneakers work well visually). Show the floating Save button appear. Click it. Show the toast and badge update.
2. Navigate to ASOS. Find a similar sneaker. Click Save. Badge now shows 2.
3. Navigate to Adidas. Save one more. Badge shows 3.
4. Open the side tray. Show all three items with price badges.
5. Click "Compare All." Show the full comparison dashboard with products as columns.
6. Point out one item has a "↓ $30" price drop badge.
7. Click "Go to Site" on the winner.

Total demo time: 45 to 60 seconds. This is the pitch.

---

## Success Metrics

### V1 success (end of build sprint)
- Core save → compare loop works end-to-end on Nike, ASOS, Amazon, and Best Buy without errors
- Comparison table renders correctly for 2 to 6 saved items
- At least 5 of 10 reference customers have used it for a real shopping session
- At least 1 person outside our team has installed and used it

### Product metrics to track after launch
- Saves per session (are people actually saving things or just installing and forgetting?)
- Dashboard open rate after first save (do they discover the comparison feature?)
- "Go to Site" click rate from dashboard (does the comparison drive a purchase decision?)
- Time from install to first save (how fast do people understand the product?)
- Share comparison usage (who is the social user?)

### The one number that matters
**Weekly active comparers.** If someone opened the comparison dashboard at least once this week, they used the product for its core purpose. Target: 50 weekly active comparers by week 8 of the beta.

---

## Risks

**Risk: Product data extraction is unreliable across sites.**
The DOM structure of Nike.com is completely different from ASOS.com or Amazon.com. Extracting name, price, and image reliably is hard. Mitigation: start with a curated list of 10 supported sites with hand-tuned selectors, then expand. Show a partial extraction state rather than failing silently.

**Risk: Chrome Side Panel API has compatibility issues.**
Chrome Side Panel API requires Chrome 114+. Most users are on current Chrome versions, but enterprise users may not be. Mitigation: add a fallback popup mode for users on Chrome < 114. Side panel is preferred but not required.

**Risk: Users save items and never open the dashboard.**
If the comparison dashboard is hard to find, users will treat Haul like a wishlist tool — saving but not comparing. Mitigation: make the "Compare All" button the most prominent action in the side tray. Send a Chrome notification after 3 saves: "You have 3 items saved. Ready to compare?"

**Risk: Free tier is too good to convert.**
If unlimited saves and comparison are free, why pay for Pro? Mitigation: price drop alerts are genuinely not available anywhere else at this quality. The conversion argument is "Haul Pro notified me before the sale ended and I saved $40." That story converts.

**Risk: A big player clones this.**
Google, Amazon, or Honey could build this. Mitigation: move fast, build the affiliate revenue moat, and establish brand awareness before they notice. Google Shopping is a $10B+ product line — they are not going to pivot to build a browser side tray for 10,000 users.

---

*This spec covers V1 through V3. V1 is what we build this sprint. V2 and V3 are directional. We will revise them based on what we learn from the first 100 users.*
