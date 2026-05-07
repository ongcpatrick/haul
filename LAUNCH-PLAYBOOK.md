# Haul Launch Playbook
## IME 403, Cal Poly

**Purpose:** Get from "works on my machine" to 1,000 installs and 30 paying Pro users.

---

## 1. Pre-Launch Checklist

Do not touch the Chrome Web Store submit button until every box below is checked.

### Product
- [ ] Save button appears on at least 10 different shopping sites without errors
- [ ] Product data (name, price, image) captured correctly on Nike, ASOS, Amazon, Target, Best Buy
- [ ] Saved items persist across tab switching, page navigation, and browser restart
- [ ] Comparison dashboard renders correctly for 2 to 6 saved products
- [ ] Price drop badges appear correctly when original price > current price
- [ ] "Go to Site" opens the correct product URL in a new tab
- [ ] Share comparison generates a valid URL that renders in any browser
- [ ] Side panel loads in under 1 second on a cold open
- [ ] Extension works on a fresh Chrome profile with no other extensions installed
- [ ] Partial extraction shows a graceful fallback, not a white screen or broken card

### Onboarding
- [ ] Empty state explains what to do in one sentence with a clear visual
- [ ] First-time user can complete the core loop (save → tray → compare) in under 90 seconds without help
- [ ] First-time onboarding triggers on first install and never shows again after dismiss
- [ ] "Compare All" button is prominent in the side tray — visible without scrolling

### Chrome Web Store Assets
- [ ] Extension name: "Haul: Shopping Comparison Tool"
- [ ] Short description written (132 characters max — see Section 2)
- [ ] Full description written (see Section 2)
- [ ] 5 screenshots at 1280×800 (see Section 2 for shot list)
- [ ] Promotional tile at 440×280
- [ ] Icons at 16px, 48px, 128px (transparent background)
- [ ] 30-second demo video recorded (see Section 2 for script)

### Legal and Trust
- [ ] Privacy policy live on GitHub Pages
- [ ] Privacy policy states: no personal data collected, all saves stay in Chrome local storage, no account required
- [ ] `manifest.json` only declares permissions we actually use
- [ ] All `console.log` debug statements removed from production build
- [ ] Extension does not inject UI or scripts on banking, healthcare, or login pages

### Team Readiness
- [ ] Chrome Web Store developer account created ($5 one-time fee paid)
- [ ] 10 reference customers briefed and ready to install on launch day
- [ ] 15 supporters lined up to upvote on Product Hunt at launch
- [ ] GitHub repository is public with README and release notes
- [ ] `haul-v0.1.0.zip` created and tested on a clean Chrome profile

---

## 2. Chrome Web Store Listing

### Extension Name
`Haul: Shopping Comparison Tool`

### Short Description (132 characters)
`Save products from any shopping site. Compare side-by-side. Stop the tab chaos and shop with confidence.`

### Full Description

**Stop shopping in 30 tabs. Start comparing in one.**

Haul is a Chrome extension that lets you save products from any shopping site with one click, then compare everything side-by-side in a clean dashboard — so you make a confident purchase decision instead of guessing.

**How it works:**
1. Visit any product page on Nike, ASOS, Amazon, Target, Best Buy, Zara, and more
2. Click the floating Save button that appears on the product
3. Keep browsing — your saves appear in a 320px side tray alongside any page
4. Click "Compare All" to open a full comparison dashboard with every product as a column
5. See prices, ratings, brands, and specs side-by-side. Click "Go to Site" to buy the winner.

**Free forever, no account required:**
- Unlimited product saves
- Side-by-side comparison dashboard
- Manual category organization
- Share your comparison as a link
- Export comparison as an image

**Haul Pro ($4.99/month, 7-day free trial):**
- AI auto-categorization — Haul sorts your saves for you
- Price drop alerts — get notified when something you saved gets cheaper
- Smart recommendations — AI suggests items you might want to compare
- Advanced extraction for complex sites

**Works on:** Nike, ASOS, Amazon, Target, Best Buy, Zara, H&M, Nordstrom, Wayfair, eBay, and most shopping sites.

Built by students at Cal Poly for anyone who has ever lost a tab they needed.

### 5 Screenshots (1280×800, shot list)

**Screenshot 1 — Empty State + Save Button**
Caption: "A Save button appears on every product page."
Show: A Nike sneaker product page with the floating Haul Save button visible in the corner.

**Screenshot 2 — Side Tray with 4 Saves**
Caption: "Your saves appear in a side tray while you keep browsing."
Show: Side tray open alongside an ASOS product page, showing 4 saved items with price badges.

**Screenshot 3 — Comparison Dashboard**
Caption: "Compare everything side-by-side in one view."
Show: Full comparison dashboard with 4 sneakers as columns: Nike $150, ASOS $89, Adidas $120, Converse $65. Price drop badge on one.

**Screenshot 4 — Price Drop Badge + Category Filter**
Caption: "Spot sales and filter by category."
Show: Dashboard with "Shoes (3)" and "Electronics (1)" filter tabs. Price drop badge (↓ $30) on the Nike column.

**Screenshot 5 — Share Comparison**
Caption: "Share your comparison with anyone."
Show: Share modal open with a URL that has been copied to clipboard. Clean, minimal design.

### Demo Video Script (30 seconds)

0:00 — Open amazon.com. Find a laptop. Click the Haul Save button. Toast appears.
0:08 — Open BestBuy.com. Find a competing laptop. Click Save. Badge shows 2.
0:13 — Open Newegg.com. Save one more. Badge shows 3.
0:17 — Open the side tray. Show all 3 laptops with compact cards.
0:21 — Click "Compare All." Dashboard opens. 3 columns, specs as rows.
0:25 — Point at price difference. Click "Go to Site" on the cheapest one.
0:29 — Done.

---

## 3. Launch Day Sequence

### T-7 Days: Final polish
- All reference customers briefed with install instructions
- Product Hunt page drafted and scheduled
- Reddit posts drafted (not posted yet)
- Email template to reference customers written and ready to send

### T-1 Day: Soft launch
- Submit to Chrome Web Store (review takes 24-72 hours — submit early)
- Send install instructions to 10 reference customers via email
- Ask them to install and complete one save + compare session before launch day
- Set up Product Hunt submission for midnight launch

### Launch Day: Full launch
- Product Hunt goes live at 12:01am PST — have 15 supporters ready to upvote immediately
- Post in r/frugal with the genuine story post (see Section 4)
- Post in r/chrome_extensions with a technical overview
- Post on Cal Poly Discord and class channels
- Reply to every comment on Product Hunt and Reddit in the first 6 hours

### T+3 Days: Earned media
- Follow up with any Reddit threads that have traction
- If Product Hunt did well, post the "how we built it" thread on r/webdev or r/programming
- DM 3 to 5 shopping-focused creators on Twitter/X with a short pitch and demo link

---

## 4. Reddit Post Templates

### r/frugal Post (2.8M members)

**Title:** I built a Chrome extension to solve tab chaos when comparison shopping — save products from any site, compare side-by-side [OC]

**Body:**
I got tired of opening 20 tabs every time I needed to buy something, losing the good ones, and making bad purchase decisions because I couldn't see everything at once.

So I built Haul — a Chrome extension that puts a Save button on any product page. Everything you save shows up in a side tray. When you're ready, one click opens a full comparison dashboard with every product you looked at as a column.

It's free. No account required. Works on Nike, ASOS, Amazon, Target, Best Buy, and basically any shopping site.

[Attach 30-second demo GIF]

I'm a student at Cal Poly building this for an entrepreneurship class, but it's a real tool I use for every purchase over $50. Would love feedback from people who actually comparison shop.

Link: [CWS listing]

---

### r/BuyItForLife Post (1.1M members)

**Title:** Built a free Chrome extension for people who do serious product research before buying — compare specs from different sites side-by-side

**Body:**
BIFL shoppers do more pre-purchase research than anyone. I built Haul to make that research faster.

Save products from any site with one click. See them all in a comparison table — price, brand, specs — before you decide. Price drop alerts coming in the next version.

Free, no sign-in. Works anywhere.

[Demo link + CWS link]

---

### r/buildapc Post (5.4M members)

**Title:** Built a Chrome extension for comparing PC parts across Amazon, Newegg, B&H, and BestBuy — side-by-side table, no more tab chaos

**Body:**
PC building involves comparing specs from 4+ retailers per part. I got frustrated jumping between tabs and built a tool to fix it.

Haul puts a Save button on any product page. Build your comparison list while you browse. Click "Compare All" and see everything in a table — price, ratings, specs — in one place. "Go to Site" takes you directly to the cheapest option.

[Demo showing RAM comparison across Newegg, Amazon, B&H]

Free forever. No account. GitHub: [link]

---

## 5. Product Hunt Launch Checklist

- [ ] Create PH account 2+ weeks before launch (new accounts are penalized)
- [ ] 30-second demo video uploaded to YouTube (unlisted) for PH embed
- [ ] Tagline written: "Save products anywhere, compare side-by-side, stop the tab chaos"
- [ ] First comment drafted as founder: tell the origin story (lost a chair because the tab crashed)
- [ ] 15 supporters in a group chat ready to upvote at 12:01am PST on launch day
- [ ] All supporters have PH accounts that are at least 1 week old
- [ ] Team members available to respond to comments for the first 8 hours

---

## 6. Email to Reference Customers (Alpha)

**Subject:** Haul alpha is ready — you're our first user, here's how to install

---

Hi [Name],

Thanks for agreeing to be a reference customer for Haul. We built it to solve a problem you told us about: [one sentence specific to their pain, e.g., "losing track of furniture options across IKEA and Wayfair"].

The first version is ready and you're one of 10 people installing it today.

**How to install:**
1. Download the zip file attached to this email
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the unzipped Haul folder
5. Pin the Haul icon to your toolbar from the extensions menu

**Try this in 5 minutes:**
1. Go to any shopping site (Nike, Amazon, Target, ASOS)
2. Find a product you're actually interested in
3. Click the Save button that appears on the product page
4. Repeat on another site
5. Open the side tray and click "Compare All"

**Give us feedback:**
[Link to 5-question Google Form]
OR just reply to this email — we read everything.

We want to know: did the Save button appear? Did it capture the right price? Was the comparison useful? What was confusing?

If something breaks, tell us exactly what site you were on and what happened. Screenshots are incredibly helpful.

Thank you for being part of this. You're going to directly shape what Haul becomes.

— Patrick, Trevor, and Kendall

---

## 7. Post-Launch Week 1 Monitoring

**Every morning (10 minutes):**
- Check Chrome Web Store dashboard for new installs and reviews
- Check Product Hunt for new comments
- Read all Reddit mentions (set up Google Alert for "Haul chrome extension")
- Check if any extraction broke on a major site (monitor support emails/reviews for "it didn't capture the price")

**Respond to everything in the first week.** Every review, every comment, every DM. This is the moment users decide if Haul is a real product worth caring about.

**Green signals:**
- More than 50 installs in first 48 hours
- At least 2 organic 5-star reviews (not from friends)
- At least one Reddit comment that was not from us getting upvoted

**Red signals that require immediate action:**
- 1-star review citing extraction failure on a major site → fix and push update within 24 hours
- Multiple reports of the Save button not appearing → emergency debug session
- Product Hunt score below top 10 by 6am → contact remaining supporters to upvote
