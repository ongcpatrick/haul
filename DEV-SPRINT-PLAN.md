# Haul Dev Sprint Plan
## IME 403 — 8 Week Build Schedule

**How to Use This Document**

Read the week you are in. Follow the definition of done before moving on. Check the daily checklist every morning. If something is blocking you, look at the pitfalls section first.

**Build Order (Do Not Skip Steps)**

1. Product page detection + save button working on any shopping site
2. Saves persisting to Chrome storage
3. Minimized badge showing save count
4. Saves visible in side tray panel
5. Full comparison dashboard working
6. Share comparison URL working
7. Pro paywall screens wired up
8. Chrome Web Store submission prep

---

## Week 1: Scaffold and Product Detection

**Goal:** Get a working Chrome extension installed locally that can detect a product page and show a Save button.

**What to Build:**
- Fork the MV3 extension scaffold and rename it to Haul
- Update `manifest.json`: name "Haul", description, version 0.1.0, icons, permissions
- Write `content-script.js` to detect product pages
  - URL pattern match: `*://*.nike.com/t/*`, `*://*.amazon.com/dp/*`, `*://*.asos.com/*/prd/*`, etc.
  - DOM signal detection: look for `[itemprop="price"]`, `[class*="price"]`, schema.org Product markup, "Add to cart" button
- Show a floating "Save" button near the product when detected
- Button disappears when navigating away from a product page
- Log to console: "Product page detected: [URL]"

**Definition of Done:**
- Extension loads in `chrome://extensions` without errors
- Visit nike.com on any product page and the Save button appears
- Visit amazon.com on any product page and the Save button appears
- Visit a non-product page (google.com) and no button appears
- No errors in service worker or content script console

**Pitfalls:**
- SPAs (React-based sites like Nike) change URLs without full page reload — use a `MutationObserver` on `document.title` or a `chrome.webNavigation.onHistoryStateUpdated` listener in the service worker to rerun detection
- Iframe content will not receive your content script — this is fine for V1

---

## Week 2: Product Data Extraction and Chrome Storage

**Goal:** Clicking Save captures real product data and persists it to Chrome storage.

**What to Build:**
- Write `lib/extractor.js` with functions for each supported site:
  - `extractAmazon()`, `extractNike()`, `extractASOS()`, `extractGeneric()`
  - Each returns: `{ name, price, originalPrice, imageUrl, sourceUrl, siteName, timestamp, id }`
- `extractGeneric()` tries common selectors as fallback for unsupported sites
- On Save button click: call the correct extractor, send message to service worker
- Write `lib/storage.js`: `saveProduct(product)`, `getProducts()`, `removeProduct(id)`, `clearAll()`
- Service worker receives message, calls `chrome.storage.local.set()`
- Show a small toast notification: "Saved! [product name]"
- Minimized badge updates to show current save count: `chrome.action.setBadgeText()`

**Definition of Done:**
- Save a sneaker on Nike — `chrome.storage.local.get(null, console.log)` in the service worker shows the correct name, price, image URL, and source URL
- Save a product on Amazon — correct data in storage
- Navigate away and back — saved items are still in storage
- Badge shows correct count after each save
- Toast appears on save and fades after 2 seconds

**Pitfalls:**
- Image URLs on lazy-loaded pages may be empty strings — grab `data-src` before `src` if `src` is blank
- Prices often have currency symbols, commas, and whitespace — clean them: `price.replace(/[^0-9.]/g, '')`
- Amazon prices are sometimes split across two spans (dollars and cents) — concatenate them

---

## Week 3: Side Tray (Chrome Side Panel)

**Goal:** Side tray shows all saved products while browsing.

**What to Build:**
- Create `sidepanel/` directory with `index.html`, `sidepanel.js`, `sidepanel.css`
- Register in `manifest.json`: `"side_panel": { "default_path": "sidepanel/index.html" }`
- Open side panel via clicking the extension icon or badge: `chrome.sidePanel.open()`
- Side tray UI:
  - Header: "Your Saves" + item count badge
  - Scrollable list of saved products (compact cards: thumbnail, name, price, price-drop badge if originalPrice > price)
  - X button on each card to remove
  - Filter button (by price low to high for V1)
  - "Compare All" primary button at the bottom
  - "Clear All" secondary link
- When a product is removed in the tray, badge updates

**Definition of Done:**
- Click the extension icon while on any page — side tray slides open
- All saved products appear with correct name and price
- Remove button removes the product from tray and storage, badge updates
- "Compare All" button exists (clicking it will do nothing until Week 5)
- Tray shows correct empty state when no items are saved

**Pitfalls:**
- Chrome Side Panel requires Chrome 114+ — add a `minimum_chrome_version` check and graceful fallback
- The side panel cannot directly access the active tab's DOM — communicate via `chrome.runtime.sendMessage`
- Side panel does not reload when the user navigates between tabs — use `chrome.storage.onChanged` to reactively update the list

---

## Week 4: Session Management and Category Grouping

**Goal:** Saves are organized by category and persist correctly across browsing sessions.

**What to Build:**
- Each saved product gets a `category` field assigned by URL-based heuristics:
  - nike.com → "Shoes"; amazon.com/computers → "Electronics"; asos.com → "Clothing"; wayfair.com → "Home"; default → "Other"
- Update side tray to show category dividers when multiple categories exist
- Saves persist across tab close, browser restart, and Chrome update
- Add `sessionId` to each save (current date string: `YYYY-MM-DD`) to group saves from the same day
- "New Session" button in tray header clears current session and starts fresh (does not delete — archives)

**Definition of Done:**
- Save a sneaker on Nike and a monitor on Newegg — tray shows two category groups
- Close Chrome completely, reopen — all saves still appear
- New Session button creates a clean tray while keeping old session accessible
- No console errors in the background service worker

---

## Week 5: Comparison Dashboard

**Goal:** "Compare All" opens a full comparison popup with products as columns and specs as rows.

**What to Build:**
- Create `dashboard/` directory with `index.html`, `dashboard.js`, `dashboard.css`
- Open as `chrome.windows.create()` with type "popup", width 900, height 650
- Comparison table:
  - Each saved product = one column
  - Rows: Product image, Name, Brand, Price (strikethrough original if on sale), Rating (if extracted), Sizes (if extracted), Site name, Source link
  - Price drop badge (emerald) on products where current price < original price
  - Sale badge (amber) on products with explicit sale data
- Category filter tabs above the table
- X button on each product column to remove from comparison
- "Go to Site" button on each column opens the product URL in a new tab
- Share button copies a URL to clipboard (encode product state as base64 JSON in URL param)

**Definition of Done:**
- Save 4 products from different sites — click "Compare All" — all 4 appear as columns
- Price drop badge appears on items with a lower current price than original
- Category filter tabs show and hide the correct columns
- "Go to Site" opens the correct product URL in a new tab

**Pitfalls:**
- Chrome popup windows can be blocked if opened from content script — open via `chrome.windows.create()` from the service worker only
- Very long product names will break column layout — truncate at 40 characters with ellipsis

---

## Week 6: Share, Export, and Extraction Polish

**Goal:** Share comparison works, export works, extraction improved to 10+ sites.

**What to Build:**
- Share comparison: `window.btoa(JSON.stringify(products))` appended as `?data=...` to a GitHub Pages static page. Recipient opens link and sees comparison read-only.
- Export: "Export" button downloads a PNG screenshot using `html2canvas`
- Partial extraction fallback: when extraction fails to get price or name, show what was captured with a "⚠ partial data" indicator
- Add extraction support for: Best Buy, Target, Zara, H&M, Nordstrom, eBay
- Test on 15+ product pages; fix failing selectors

**Definition of Done:**
- Share button copies a URL. Opening that URL shows the comparison in read-only mode.
- Export downloads a clean PNG of the comparison table
- All 10 priority sites extract at least name and price successfully
- Partial extraction shows graceful fallback, not a broken card

---

## Week 7: Onboarding, Paywall, and Settings

**Goal:** First-time users understand the product immediately. Pro paywall screens ready for V2 Stripe integration.

**What to Build:**
- First-time onboarding: 3-step modal on first install — "Save → Tray → Compare" — interactive demo save
- Empty state: when tray has 0 saves, show "Visit any shopping site and click Save on a product"
- Paywall modal: triggered when free user clicks Pro-gated feature — shows Pro features list + $4.99/mo CTA. In V1: "Coming soon — get notified" email capture form. `VITE_TEST_MODE=true` bypasses paywall.
- Settings page: supported sites list, clear all saves, export as JSON, tier display
- Error state: if storage fails, show readable error with "Reload" button

**Definition of Done:**
- Fresh Chrome profile shows onboarding on first icon click, never again after dismiss
- Empty state appears when 0 saves exist
- Pro-gated features show paywall modal
- Settings page loads and Clear All works

---

## Week 8: Chrome Web Store Submission and Beta Launch

**Goal:** Extension passes CWS review and 10 reference customers have installed it.

**What to Build:**
- Remove all `console.log` statements from production build
- Set `"version": "0.1.0"` in `manifest.json`
- Declare only necessary permissions: `storage`, `activeTab`, `sidePanel`, `tabs`, `notifications`
- Privacy policy on GitHub Pages: no user data leaves the browser, no PII collected, all data in Chrome local storage only
- CWS listing assets: icons (16/48/128px), 5 screenshots at 1280×800, promotional tile 440×280
- Short description (132 chars max): "Save products from any shopping site. Compare side-by-side. Stop the tab chaos."
- Record 30-second demo video (Save → Tray → Compare loop)
- Create `haul-v0.1.0.zip` for local install testing
- Brief all 10 reference customers with install instructions

**Definition of Done:**
- Extension installs from .zip on a clean Chrome profile with no errors
- All 5 CWS screenshots are accurate and high quality
- Privacy policy is live at a public URL
- At least 5 reference customers have installed and completed one save + compare session

---

## Daily Dev Checklist

Every morning:
- [ ] Open `chrome://extensions` — confirm extension loaded without errors
- [ ] Check service worker console for errors
- [ ] Review yesterday's definition of done — is it fully met?

Every evening:
- [ ] Commit and push current work to GitHub
- [ ] Note any blockers in team Discord
- [ ] Log any new extraction failures on specific sites

---

## Site-Specific Extraction Notes

| Site | Primary Selector | Known Issues |
|------|-----------------|-------------|
| Amazon | `#priceblock_ourprice`, `.a-price-whole + .a-price-fraction` | Dynamic price loading, variant-dependent price |
| Nike | `.product-price__wrapper`, `[data-test="product-title"]` | SPA navigation, price updates on size selection |
| ASOS | `[data-test="current-price"]`, `[data-test="product-title"]` | Split price for sale items |
| Target | `[data-test="product-price"]`, `[data-test="product-title"]` | Membership-dependent pricing |
| Best Buy | `.priceView-customer-price span`, `.sku-title h1` | Location-dependent price |
| Zara | `.price__amount`, `h1.product-detail-info__header-name` | Lazy-loaded images |
| H&M | `.ProductPrice-module--price`, web component product name | Web components shadow DOM |
| Nordstrom | `[data-element-id*="Price"]`, `h1[itemprop="name"]` | Variant-dependent pricing |
| Wayfair | `[data-hb-id*="Price"]`, product section h2 | Price changes with shipping |
| eBay | `[itemprop="price"]`, `.x-item-title__mainTitle` | Auction vs. buy-it-now prices |
