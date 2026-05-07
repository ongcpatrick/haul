# IME 403 Software Product Management
## Product Proposal: Haul — Shopping Comparison Chrome Extension

*By Patrick Ong, Trevor Yargeau, Kendall Corrine Eulo*

---

## Problem Domain and Big Problem

**Domain:** Online Shopping and Purchase Decision Making

When people shop across multiple sites — Nike, ASOS, Amazon, Best Buy, Zara — they open 20 to 40 tabs per session. They jump back and forth, forget what they already found, lose the tab they had three minutes ago, and eventually make a purchase decision based on exhaustion rather than comparison. The tab chaos is not just annoying. It costs real money. People buy the wrong thing, overpay, or give up and settle because they cannot hold all the options in their head at once.

The tools that exist today do not solve this. Honey and Capital One Shopping track coupon codes and cash back. Amazon Wishlists work only inside Amazon. Pinterest saves images but strips out pricing and specs. Browser bookmarks are just links — no product data, no comparison, no intelligence. Google Shopping is search-based and does not follow your actual browsing session.

None of these tools let you save products from any site as you browse and then compare them side-by-side in the same window where you are shopping.

The result is that people waste an hour per shopping session managing tabs instead of making decisions, and they still end up with less information than they needed to buy confidently.

---

## "How Might We..." Statement

> *How might we let shoppers save products from any site with one click and compare them side-by-side, so they make confident purchase decisions without the tab chaos?*

---

## Positive Outcomes and Benefits

If we solve this problem, here is what gets better:

**1. Decision confidence replaces decision fatigue.** Right now shoppers are comparing products in their head, holding specs and prices in short-term memory across 15 different tabs. With every option laid out in one place — price, rating, brand, specs — they can make an actual informed decision instead of a guess.

**2. Shoppers can close tabs without anxiety.** The reason people keep 30 tabs open is fear: they will lose something they found. Once every save is captured with the product image, price, and link, they can close tabs confidently. Their computer stops grinding. Their mental load drops.

**3. People stop overpaying.** When shoppers cannot compare easily, they default to the first site with free shipping or the brand they already know. Side-by-side comparison surfaces the $30 price drop at the competing retailer they almost missed. That is money directly back in the shopper's pocket.

**4. Group decisions get easier.** Buying a couch with your roommate. Picking a gift with your family. Finding a laptop for your kid. These decisions require sharing options between people, and right now that means forwarding 12 separate product links in a text thread. Haul lets you share a single comparison link with everything in one place.

**5. Price drop awareness becomes passive.** The Pro tier monitors prices on your saved items and notifies you when something drops. Instead of checking five bookmarks every week hoping for a sale, the deal comes to you. This keeps users engaged long after the first shopping session.

**6. The saved list compounds in value.** Every item a user saves is available later. Research a purchase today, come back to decide next week. No more re-opening the same sites and starting from scratch. The comparison history is already there.

---

## Competency Table

| Competency | Current | Target | Notes |
|---|---|---|---|
| Chrome Extension MV3 Development | 4/5 | 5/5 | Working extension scaffold from previous project. Gap is product data extraction across diverse shopping sites. |
| DOM Parsing and Product Data Extraction | 2/5 | 4/5 | Can read DOM already. Gap is reliably extracting price, name, image, and specs from varied site structures. |
| Chrome Storage API and State Management | 3/5 | 5/5 | Used Chrome storage before. Gap is cross-tab session state with category grouping. |
| Chrome Side Panel API | 1/5 | 4/5 | Have not built a side panel yet. Chrome Side Panel API (Chrome 114+) is the primary UI surface. |
| AI Integration for Auto-Categorization | 2/5 | 4/5 | Groq integration exists from prior work. Gap is prompt engineering for product categorization. |
| Product Comparison UI Design | 2/5 | 4/5 | Have mid-fidelity Figma wireframes already. Gap is implementing the comparison table in a performant popup. |
| Export and Share Features | 1/5 | 3/5 | Not built yet. Clipboard and shareable URL export are V1 targets. |
| Subscription and Monetization (Stripe) | 1/5 | 3/5 | No prior experience. Stripe integration is a V2 priority after free tier validates. |

---

## Asset List

**What we already have:**

- Working Manifest V3 Chrome extension scaffold with service worker, content scripts, and popup
- Groq API integration at ~150ms for AI categorization (when needed for Pro tier)
- Chrome storage API experience for saving persistent data
- Complete mid-fidelity wireframes in Figma covering all 11 screens: Empty State, Product Save, Minimized Badge, Side Tray, Comparison Dashboard, Partial Extraction, Share Comparison, First-Time Onboarding, Settings, Paywall Modal, Subscription
- Design system defined: Indigo primary, Emerald for savings, Amber for sales, Rose for urgency, Inter typography, 4px base grid
- Cal Poly campus with 21,000 students who shop online and make purchasing decisions on student budgets

**What we still need:**

- Content script that detects product pages and extracts name, price, image, and specs
- Floating "Save" button that appears on detected product pages
- Minimized badge showing saved item count while browsing
- Chrome Side Panel UI (320px side tray) with saved items list
- Full comparison dashboard popup (800px) with product columns and spec rows
- Category filter tabs and price drop badge logic
- Share comparison via encoded URL
- Privacy policy page (Chrome Web Store requirement)
- Chrome Web Store developer account ($5 one-time)
- 10 committed reference customers from our target market
- 30-second demo video showing the core loop

---

## Competition Chart

```
Direct                                                                  Indirect
   |                                                                        |
Honey /        Amazon         Google          Wirecutter     Pinterest   Browser
Capital One    Wishlist       Shopping                                   Bookmarks
Shopping
   |              |              |                |              |           |
Price tracking  Amazon-only    Search-based,    Editorial      Visual-     Pure
and coupons.    saves only.    no session       picks only,    only,       links,
No product      No cross-site  saving. Shows    not your       no price    no data
comparison.     comparison.    generic results, own saves.     or specs.   extracted.
                               not your tabs.
```

**Why none of these win:**

- **Honey / Capital One Shopping** (20M+ installs combined) auto-apply coupons at checkout. They are passive tools that activate at the end of a purchase flow. They do not help you compare before deciding. Users install both Honey AND Haul for different jobs.

- **Amazon Wishlist** locks saves inside Amazon. The moment a shopper finds a better price on a brand's own site or a competing retailer, the wishlist is useless. Haul works everywhere.

- **Google Shopping** surfaces results based on a search query. It has no concept of "save this while I browse" — it is a directory, not a companion. You have to leave your current browsing session to use it.

- **Wirecutter and The Strategist** tell you what to buy based on editorial review. They do not let you save and compare the specific options you personally found while shopping. They solve a different problem — discovery, not comparison.

- **Pinterest** has 450 million users saving product images. It strips pricing and availability, has no comparison table, and is not built for purchase decisions. It is a mood board, not a shopping tool.

- **Browser Bookmarks** are just URLs. No price. No product image. No specs. No comparison. Haul is everything bookmarks should have been.

---

## Market Size Estimate

**Total Addressable Market (TAM)**

There are 230 million online shoppers in the United States according to eMarketer's "US Ecommerce Forecast 2024." Of these, approximately 20% are deliberate comparison shoppers — people who research multiple options before buying, driven by price consciousness, product quality concerns, or high purchase stakes. That is 46 million people. At a $5/month paid tier for a tool that serves every shopping session, the TAM is approximately $2.8 billion per year in the US alone. Global online shopping volume doubles this number.

**Serviceable Addressable Market (SAM)**

Chrome holds 65% of global browser market share (StatCounter, Q4 2024). Among deliberate comparison shoppers, Chrome users who shop across multiple retailers and are likely to install a productivity-focused extension number roughly 12 million in the US. At 3% conversion to a $4.99/month paid tier, that is 360,000 paying users and $21.6 million ARR at SAM scale. This is conservative — Honey reached 17 million installs by solving a narrower problem (coupons only). Haul solves a broader one.

**Serviceable Obtainable Market (SOM) — Year 1 Beachhead**

We start with three beachhead channels: Cal Poly students, Reddit communities focused on frugal shopping and consumer decision-making (r/frugal, r/BuyItForLife, r/femalefashionadvice, r/buildapc), and Product Hunt. Target for Year 1: 2,000 installs and 3% conversion to Haul Pro at $4.99/month.

- 2,000 installs × 25% retained users = 500 active users
- 500 × 6% conversion = 30 paying users at launch
- 30 paying users × $4.99/month = $150 MRR to start
- Year 1 goal: 5,000 installs, 150 paying users, $750 MRR

For scale: Honey grew entirely through word-of-mouth before PayPal acquired it for $4 billion. The comparison shopping pain is universal. A tool that works on every site — not just Amazon — has never existed as a clean browser extension.

**Sources:**

- eMarketer, "US Ecommerce Forecast 2024" (2024)
- StatCounter Global Stats, Browser Market Share Worldwide (Q4 2024)
- Honey company history and PayPal acquisition reports (2019)
- NielsenIQ, "Savvy Shopping 2023: How Consumers Are Stretching Dollars" (2023)
- Chrome Web Store public install data (2024)

---

## 10 Reference Customers

These are the ten people who have committed to work with our team this quarter to give feedback and test the product. All are representative of our target market. Real names will be filled in before submission.

**Bio template:**
[Name], [description]. Currently shops by [behavior]. Biggest pain: [one sentence]. Committed to: testing beta and giving weekly feedback. Would pay: [amount/month].

---

**Reference Customer 1 — College Student: Apartment Furnishing**

[Name], [Year, Major] at Cal Poly. Moving into their first apartment and shopping for furniture, bedding, and kitchen supplies across IKEA, Wayfair, Target, and Amazon simultaneously. Currently has 25+ tabs open and has already lost a couch they liked when the tab crashed. Biggest pain: no way to see all options at once without going back to every site. Would pay: $5/month while shopping intensely, $0 otherwise — needs a free tier for casual use.

---

**Reference Customer 2 — Fashion-Conscious Student**

[Name], [Year, Major] at Cal Poly. Shops across ASOS, Zara, H&M, and brand sites regularly, looking for the best price on specific styles. Currently screenshots items on their phone and loses track of which screenshot came from which site. Biggest pain: cannot compare two nearly identical items side-by-side when they are on different sites. Would pay: $5/month.

---

**Reference Customer 3 — Tech Buyer**

[Name], [Year, Major] at Cal Poly or recent grad. In the market for a laptop, monitor, or GPU. Compares specs across Amazon, Best Buy, Newegg, and manufacturer sites. Currently uses a spreadsheet they have to manually update every time a price changes. Biggest pain: maintaining the spreadsheet is almost as much work as the research itself. Would pay: $5/month — a spreadsheet substitute they do not have to maintain is worth real money.

---

**Reference Customer 4 — Frugal Shopper**

[Name], 25-35 years old, budget-conscious, shops primarily for value. Regularly checks multiple sites before any purchase over $30. Currently uses a combination of CamelCamelCamel (Amazon price history only) and manual checking of other sites. Biggest pain: no cross-site price history or alerts means they are always checking manually. Would pay: $5/month — price drop alerts alone would pay for themselves on one purchase.

---

**Reference Customer 5 — Parent Buying Back-to-School**

[Name], parent of school-age children, buying supplies and electronics across Staples, Walmart, Target, and Amazon each August. Currently makes a list in Notes and cross-references manually across multiple browser windows. Biggest pain: the comparison research takes longer than the actual shopping trip would have. Would pay: $5/month during back-to-school season; the free tier is fine otherwise.

---

**Reference Customer 6 — Gift Buyer**

[Name], shopping for a birthday or holiday gift and trying to get options approved by other family members. Currently texts five separate product links and explains each one in the message. Biggest pain: family members do not click individual links — they need to see options presented together to make a fast decision. Would pay: $0 personally but considers it essential for the shared comparison use case — the Pro share feature is the unlock.

---

**Reference Customer 7 — Sneakerhead**

[Name], [Year, Major] at Cal Poly, actively tracking limited-release sneakers across Nike SNKRS, StockX, GOAT, and Foot Locker. Currently monitors multiple sites manually and misses drops. Biggest pain: prices change fast and there is no way to watch multiple items across multiple sites at once without an elaborate manual system. Would pay: $5-10/month — real-time price drop alerts on specific saved items is a Pro feature they would pay for immediately.

---

**Reference Customer 8 — Home Cook and Kitchen Gear Buyer**

[Name], 28-40 years old, researching a KitchenAid mixer, Instant Pot, or quality knife set. Reads reviews on Wirecutter, then finds the actual product across Amazon, Williams-Sonoma, and Target to compare prices. Biggest pain: Wirecutter tells them what to buy but not where to buy it cheapest — bridging editorial recommendations with live prices is manual work. Would pay: $5/month.

---

**Reference Customer 9 — Small Business Owner**

[Name], runs a small business or side hustle and buys supplies, packaging, or equipment from multiple vendors. Currently tracks vendor options in a shared Google Sheet. Biggest pain: the sheet is always out of date and nobody maintains it. Would pay: $10/month — they can expense it and the time saved on vendor research is worth far more than $10.

---

**Reference Customer 10 — Recent Cal Poly Grad in a Research-Heavy Role**

[Name], graduated from Cal Poly, now works as a buyer, analyst, or operations specialist at a company that procures goods regularly. Does competitive price research as part of their job. Would pay: $10/month and expense it. Sees Haul as a professional research tool, not a consumer one. This is the reference customer who validates the Pro tier.

---

## Distribution Channels

**Channel 1: Chrome Web Store (Primary Organic Channel)**

The Chrome Web Store is the direct distribution channel. We optimize our listing for queries like "product comparison Chrome extension," "shopping comparison tool," and "save products while browsing." The first 30 days after launch are the most important: review velocity is the primary ranking signal for new extensions. We will ask our 10 reference customers and early testers to leave honest reviews in the first two weeks. A well-optimized listing with early reviews can generate hundreds of organic installs per month with no paid acquisition.

**Channel 2: Reddit Shopping and Frugal Communities (Beachhead Channel)**

The communities where our users already talk about this exact pain:
- r/frugal (2.8M members) — deliberate shoppers who compare before every purchase
- r/BuyItForLife (1.1M members) — research-heavy buyers who agonize over product selection
- r/femalefashionadvice (2.2M members) — cross-site fashion shopping is core behavior
- r/buildapc (5.4M members) — GPU and component comparison across Newegg, Amazon, Microcenter is a known pain
- r/college (1.2M members) — moving into first apartment, buying supplies on a student budget

We post a genuine "built this to solve my own problem" story with a demo GIF showing the core loop: save a product on Nike, save one on ASOS, click Compare. That is the pitch in three seconds.

**Channel 3: Product Hunt Launch (Growth Channel)**

A well-prepared Product Hunt launch consistently produces 500 to 2,000 Chrome extension installs in 24 hours. We will:
- Record a 30-second screen recording of the core loop (save → tray → compare → share)
- Line up 10 to 15 supporters from our network to upvote at 12:01am PST on launch day
- Write a founder story that frames the specific frustration: "I lost a $200 chair because my tab crashed and I couldn't find it again"

A Product Hunt badge in the Chrome Web Store listing adds social proof that converts skeptical first-time visitors.

**Channel 4: Cal Poly Campus and Student Networks (Local Beachhead)**

We are in our own target market. Specific actions:
- Post in the Cal Poly Discord and major class group chats
- Demo during IME 403 class presentation — every person in the room is a potential user
- Set up at a library or student union table during a big shopping period (back-to-school, Black Friday week) and let people try it in person
- Ask professors to mention it in courses with purchasing-related projects (supply chain, business, engineering management)

**Channel 5: Twitter / X and TikTok Earned Media**

A 30-second TikTok showing someone with 30 tabs open collapsing them into a Haul comparison is native to how shopping content spreads on social. The "tab anxiety" moment is visually relatable. We will post once with good creative, not spam. One share from a mid-tier personal finance or shopping creator can produce thousands of installs overnight with no paid spend.
