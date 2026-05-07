# Haul: Metrics and Growth Framework

**Product:** Haul Chrome Extension — Shopping Comparison Tool
**Course:** IME 403, Cal Poly
**Last Updated:** May 2026

---

## 1. The 5 Metrics That Actually Matter

We track a lot of things. But only five numbers tell us if Haul is alive, growing, or dying.

### 1.1 Weekly Active Comparers (WAC)

A user counts as active if they complete at least one full session: save a product, open the comparison dashboard, and click "Go to Site." Not just installs. Not just saves.

**Why it matters:** Installs are vanity. Saves are setup. The comparison dashboard is the value. If someone opens the dashboard this week, they used Haul for its actual purpose and it influenced a real purchase decision.

**Target:** 40% of total installs in any given week.

---

### 1.2 Save-to-Compare Rate

Percentage of sessions where a user who saves at least one product also opens the comparison dashboard.

Formula: `Sessions with dashboard open / Sessions with at least 1 save`

**Why it matters:** A lot of users will save items and then stop. Maybe the "Compare All" button is not obvious. Maybe they got what they needed from the side tray alone. A low save-to-compare rate means we are losing people before they see the main value. Saves are setup. The dashboard is the product.

**Target:** Above 55%. Below 35% means something is broken in the side tray to dashboard transition.

---

### 1.3 Go-to-Site Click Rate

Of users who open the comparison dashboard, what percentage click "Go to Site" on at least one product?

**Why it matters:** A "Go to Site" click is proof that the comparison influenced a purchase decision. This is the moment where Haul earns its place in the user's shopping workflow. Low click rate means either the comparison is not useful or the user found what they needed before opening the dashboard.

**Target:** Above 45% of dashboard opens.

---

### 1.4 Free-to-Pro Conversion Rate

Percentage of free users who upgrade to Haul Pro ($4.99/month) within 30 days of install.

**Why it matters:** This is the business. At a free-forever tier with no hard usage limits, conversion happens when the user wants a specific Pro feature badly enough. The most likely trigger: seeing the "Price Drop Alerts" feature locked behind Pro and remembering a time they missed a sale. If users do not convert, the Pro features are not compelling enough or the upgrade prompt has too much friction.

**Target:** 4-6% within 30 days. Below 2% means either the Pro features need rethinking or the upgrade moment is too buried.

---

### 1.5 Monthly Pro Churn Rate

Percentage of Pro subscribers who cancel in a given month.

**Why it matters:** At our scale, one churned Pro user erases the gain from one new acquisition. Shopping behavior is seasonal — users churn after they finish a big purchasing project (apartment furnishing, back-to-school, holiday gifts). We need to know if churn is seasonal (normal) or structural (broken product).

**Target:** Below 7% monthly. Above 12% is a red flag — run a user interview sprint immediately.

---

## 2. Tracking Cadence

### Weekly (Every Monday, 15 minutes)

| Metric | Tool | What to Look For |
|--------|------|-----------------|
| New installs this week | Chrome Web Store Dashboard | Trend up or flat |
| Active comparers this week | Local analytics event log | Baseline holding |
| Save-to-compare rate | Event log | Did anything drop below 35%? |
| Support messages or 1-star reviews | CWS Dashboard | Catch extraction bugs fast |

### Monthly (First Saturday, 1 hour)

| Metric | Action |
|--------|--------|
| WAC vs. prior month | Plot the trend, not just the number |
| Free-to-Pro conversion (30-day cohort) | Pull users from 30 days ago, check their tier now |
| MRR | New Pro subscribers minus cancellations × $4.99 |
| Churn by acquisition channel | Are Product Hunt users churning differently than Reddit users? |
| Go-to-Site click rate | Is the comparison table driving purchase decisions? |
| Groq API cost vs. revenue | Make sure AI categorization cost is under $0.10/Pro user/month |

### Quarterly (End of each quarter, 2 hours)

- Competitive scan: what did Honey, Capital One Shopping, Google Shopping, and new entrants ship?
- User interview sprint: 3 to 5 interviews with active Pro users, 1 to 2 with churned users
- Pricing check: is $4.99 still right? Would $6.99 push Pro features further?
- Decide whether to build any V2 features based on user feedback and metrics

---

## 3. The Growth Funnel

```
Chrome Web Store Impressions
        |
        | 9% click-to-install rate (shopping tools have higher intent than avg)
        v
Chrome Installs
        |
        | 60% open extension within 48 hours (next shopping session)
        v
Activated Users (opened at least once)
        |
        | 70% complete first save (capture + side tray)
        v
Engaged Users (saved at least 1 product)
        |
        | 55% open comparison dashboard
        v
Active Comparers (completed at least 1 comparison)
        |
        | 65% return within 7 days (next shopping trip)
        v
Retained Users (used it 2+ times in first week)
        |
        | 5% convert to Pro within 30 days
        v
Paying Customers
```

### What This Means in Practice

If we get 1,000 installs: 600 open it, 420 save a product, 231 open the dashboard, 150 return within a week, ~7 convert to Pro in 30 days. To reach 30 paying users, we need roughly 4,000 installs. To reach 150 paying users, we need roughly 20,000 installs.

### Where to Focus Acquisition

**For 0 to 100 installs:** Direct outreach. Post in Cal Poly networks, tag shopping communities on Reddit (r/frugal, r/BuyItForLife) with a genuine "I built this to solve my own problem" post.

**For 100 to 1,000 installs:** A 60-second screen recording of the core loop — save product on Nike, save one on ASOS, click Compare, see the side-by-side dashboard. Post to r/productivity, r/frugal, r/chrome_extensions.

**For 1,000+ installs:** Chrome Web Store organic search. At 100+ reviews with 4+ stars, we appear for queries like "product comparison Chrome" and "shopping tab organizer."

---

## 4. Is the Product Working or Broken?

| Metric | Green | Yellow | Red | Action if Red |
|--------|-------|--------|-----|---------------|
| Save-to-compare rate | >55% | 35-55% | <35% | User test the side tray → dashboard transition immediately |
| WAC / total installs | >35% | 20-35% | <20% | Survey inactive users, look at onboarding drop-off |
| Free-to-Pro conversion | >4% | 2-4% | <2% | Make price drop alerts more visible or add a free trial trigger |
| Monthly Pro churn | <7% | 7-12% | >12% | Interview 3 churned users this week |
| Go-to-Site click rate | >45% | 25-45% | <25% | Is the comparison table showing useful spec differences? |
| Groq API cost per Pro user | <$0.10 | $0.10-0.25 | >$0.25 | Audit prompt length, add token cap, batch categorization calls |
| Product extraction success rate | >85% | 70-85% | <70% | Add site-specific selectors for failing domains |

If two metrics are in the red at the same time, stop adding features and fix what is broken.

---

## 5. V2 Business Case: Price Drop Alerts

### What Price Drop Alerts Do

The background service worker polls saved product URLs at configurable intervals (default: every 6 hours). When a price drops on a saved item, a Chrome notification fires with the old price, new price, and a direct "Buy Now" link. This is a Pro-only feature.

### Why This Converts Free to Pro

The conversion story is simple: "I had 3 sneakers saved. Haul Pro told me one dropped $40 overnight. I bought it before the sale ended. The subscription paid for itself 8 times over."

This story tells itself. Users who experience it become advocates. Users who miss a sale they could have caught become highly motivated to upgrade.

### Cost Model for Price Drop Alerts

- Each poll = 1 HTTP request to a product URL
- Average Pro user saves 15 products
- Polling every 6 hours = 4 polls/day/product × 15 products = 60 requests/day/user
- At 100 Pro users: 6,000 requests/day = 180,000/month
- Bandwidth cost at standard rates: effectively $0 (outbound HTTP from service worker, no server required)
- The polling runs in the user's Chrome instance — we have zero infrastructure cost for this feature

---

## 6. V3 Business Case: Affiliate Revenue

### What Affiliate Revenue Is

When a user clicks "Go to Site" from the comparison dashboard, we route the click through an affiliate link where the retailer has a program. The user still goes to the same product. We earn a commission on qualifying purchases.

### Programs Available

| Retailer | Commission Rate | Program |
|----------|----------------|---------|
| Amazon | 1-10% (category dependent) | Amazon Associates |
| Nike | 11% | Impact/CJ |
| ASOS | 6% | AWIN |
| Best Buy | 0.5-1% | Impact |
| Target | 5-8% | Impact |
| Nordstrom | 5% | AWIN |

### Revenue Model

At 10,000 monthly active users:
- Assume 40% click "Go to Site" at least once per week = 4,000 weekly purchase-intent clicks
- Assume 15% actually complete a purchase = 600 purchases/month
- Assume $80 average order value, blended 5% commission = $4.00/purchase
- Affiliate revenue: 600 × $4.00 = $2,400/month

At 50,000 MAU: ~$12,000/month in affiliate revenue. This likely exceeds subscription revenue at scale and requires zero additional user interaction — every "Go to Site" click that already happens earns money.

### When to Build It

Enable affiliate links when: 2,000+ MAU, average 3+ "Go to Site" clicks per user per month, and at least one retailer (Amazon) is already approved. Estimated setup time: 1 week. Estimated ongoing maintenance: 2 hours/quarter to renew program approvals.

---

## 7. Competitive Moat Maintenance

### The Core Moat

Haul is the only tool that lets you save products from any shopping site and compare them side-by-side in the same browser where you are shopping, without leaving your current page. The side tray is the key UX differentiator — it stays open while you browse, unlike a separate tab or a bookmark list.

The affiliate revenue moat compounds: the more we improve the comparison experience, the more "Go to Site" clicks we drive, the more affiliate revenue we earn, the more we can invest in better extraction and AI features. Honey built the same flywheel with coupon codes.

### What to Watch Every Quarter

| Competitor | What to Track | Threshold for Concern |
|-----------|--------------|----------------------|
| Honey / Capital One Shopping | Do they add cross-site product saving or comparison? | Yes: move faster on affiliate revenue |
| Google Shopping | Does it add a "save while browsing" feature? | Yes: double down on side tray UX (Google hates small UI surfaces) |
| Amazon Wishlist | Do they open wishlist to cross-site products? | Yes: our moat is the comparison table — make it much better than their wishlist |
| New Chrome extensions | Any extension with 500+ reviews doing cross-site product comparison | Yes: feature-by-feature comparison + contact their top reviewers |
| Perplexity / AI shopping tools | Do they add a "save and compare" workflow? | Yes: our advantage is the in-browser tray, not the AI — lean into UX |

### How to Stay Ahead

1. **Extraction quality is the moat.** Better product data extraction = better comparison tables = more "Go to Site" clicks = more affiliate revenue. Iterate extraction selectors every 2 weeks.
2. **Side tray UX is the differentiator.** The fact that the tray stays open while you browse is unique. Protect this interaction model.
3. **Ship price drop alerts before someone else does.** This is the single most requested feature in the comparison shopping category. Build it in V2.
4. **Stay in shopping communities.** One post per week in r/frugal or r/BuyItForLife costs nothing and keeps us connected to what shoppers actually need next.

---

## Quick Reference

**The 5 numbers we check weekly:**
1. WAC (weekly active comparers)
2. Save-to-compare rate
3. Go-to-site click rate
4. Free-to-Pro conversion (30-day cohort)
5. Monthly Pro churn

**If two metrics go red, stop shipping features.**

**Year 1 goal:** 150 paying Pro users, $750 MRR by month 12.

**V2 trigger:** 30 paying users, save-to-compare rate above 55%, then build price drop alerts and AI categorization.

**V3 trigger:** 2,000 MAU, consistent Go-to-Site clicks, then enable affiliate links.
