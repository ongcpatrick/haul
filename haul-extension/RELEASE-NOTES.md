# Haul Release Notes

## v0.1.0 — Alpha Release (May 2026)

**First public alpha. Core product loop working end-to-end.**

### What's New

**Save button on product pages**
- Floating "Save to Haul" button appears on detected product pages
- One click captures product name, price, original price (if on sale), image, and source URL
- Visual toast confirmation after saving
- Badge on the extension icon updates in real time with your save count
- Works on: Amazon, Nike, ASOS, Target, Best Buy, Zara
- Generic fallback extraction for any other shopping site

**Side tray (Chrome Side Panel)**
- Opens alongside any page — keep browsing without losing your saves
- Shows all saved items with compact cards: image, name, price, price-drop badges
- Remove individual items with the X button
- Refresh button to reload from storage
- "Compare All" button to open the full dashboard
- "Clear All" to reset your session

**Comparison dashboard**
- Full popup view (960×680px)
- Products displayed as columns, specs displayed as rows
- Rows: product image, name, price (with original price struck through if on sale), site name, Go to Site link
- Price drop badge (green ↓) shows savings amount when current price < original price
- Category filter tabs (Shoes, Electronics, Clothing, Home, Other)
- Share comparison: copies a URL with encoded product data to clipboard — send to anyone
- Remove individual products from the comparison with the X button

**First-time experience**
- Popup shows save count and quick actions
- Empty state in side tray explains exactly what to do

### Known Issues

- Prices may not extract on heavily dynamic sites (React SPAs, some JavaScript-rendered prices)
- Product images may be blocked by CORS on some sites
- Share URL may be very long for large comparison sets — URL shortener recommended for sharing
- Side panel requires Chrome 114+; popup fallback is available for older versions

### What's Coming in v0.2.0

- Price drop alerts (Pro) — get notified when a saved product drops in price
- AI auto-categorization (Pro) — Haul sorts your saves automatically
- Improved extraction for Zara, H&M, Nordstrom, and eBay
- First-time interactive onboarding
- Haul Pro subscription ($4.99/month with 7-day free trial)

---

## Feedback

This is an alpha build. We expect bugs. Please report anything broken:

- **Google Form:** [link to feedback form]
- **GitHub Issues:** github.com/ongcpatrick/haul/issues
- **Email:** pong01@calpoly.edu

The most valuable thing you can do is tell us: **which site did you try, and what happened?**

Thank you for being one of our first 10 users.

— Patrick, Trevor, and Kendall
