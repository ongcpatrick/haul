# Haul User Research Playbook

**Product:** Haul Chrome Extension — Shopping Comparison Tool
**Course:** IME 403, Cal Poly
**Purpose:** Talk to real shoppers, validate our assumptions, and build something people actually use.

---

## Who We Are Talking To

We have 10 reference customer types. For V1, we prioritize the three with the most acute pain:

1. **College students shopping for their first apartment** — high stakes, multiple sites, shared decisions
2. **Tech buyers comparing components or electronics** — spec-heavy research, multiple retailers, price sensitivity
3. **Fashion shoppers browsing multiple sites** — frequent shoppers, tab-heavy behavior, impulsive but price-conscious

The other seven types are secondary. We recruit them once we have coverage on the top three.

---

## The 10-Question Interview Guide

These questions are open-ended and non-leading. **Do not describe Haul before asking them.**

1. Walk me through the last time you bought something online that required comparing options from multiple sites. What did that process look like from start to finish?
2. How do you keep track of products you've looked at while you're browsing?
3. What happens when you find something on one site but want to keep looking before deciding?
4. What is the most frustrating part of shopping across multiple sites?
5. Have you ever made a purchase and then found out the same product was cheaper somewhere else shortly after? What happened?
6. Have you ever tried a tool or system to help with this? What did you try, and did it work?
7. If something could do one thing to make cross-site shopping easier, what would it do?
8. How much do you currently spend per month on subscriptions or apps related to shopping, saving money, or productivity? (Honey, Rakuten, Capital One Shopping, Notion, etc.)
9. If a tool saved you 30 minutes every time you shopped for something over $50, what would that be worth to you per month?
10. Is there anything about how you shop online that you think is pretty different from how most people do it?

**Probes to use when an answer is shallow:**
- "Can you give me a specific example?"
- "What did you do next?"
- "How much time did that take?"
- "How did you feel when that happened?"

---

## How to Recruit on Campus and Online

### Where to Find Each Type

**College students shopping for apartments:**
- Kennedy Library first floor and the Village 3 common areas during move-in weeks (September/January)
- Student community Facebook groups and Cal Poly Housing Discord
- Post a flyer in apartment complexes near campus: "5-minute interview for a shopping app — $5 Venmo"

**Tech buyers:**
- r/buildapc Discord servers; Cal Poly CS/CE student Discord
- Computer Science and Engineering club tables at the UU
- Post in Cal Poly subreddit asking for people who build their own PCs or recently bought a laptop

**Fashion shoppers:**
- Orfalea College of Business lounge (Business + Communication students skew high on fashion shopping)
- Instagram DMs to Cal Poly students who post shopping content
- r/femalefashionadvice Discord recruiting post

**Frugal shoppers:**
- r/frugal Discord
- Cal Poly Couponing/Deals Instagram page DMs
- Kennedy Library during midterms — students who are stressed about money are highly motivated to talk

**Sneakerheads:**
- Cal Poly SNKRS club or similar
- Cal Poly subreddit shoe-related threads

**IME classmates:**
- We already know them. Grab them before or after IME 403 for a 10-minute session.

---

## Interview Format

**Length:** 15 to 20 minutes
**Format:** In person preferred; Zoom acceptable
**Incentive:** $5 Venmo / coffee / nothing (for classmates and friends)
**Recording:** Ask permission first. If yes, record with Otter.ai or built-in phone recorder. If no, take detailed notes.

### Before the Interview
- Review their reference customer bio
- Set up your phone to record (if permitted) and a notes doc open on your laptop
- Have your 10 questions printed or visible — do not read from your phone

### During the Interview
- Start with: "I'm going to ask you about how you shop online. There are no right or wrong answers. I'm not selling you anything — I'm trying to understand your experience."
- Do not pitch Haul until after all 10 questions are answered
- If they ask what you're building: "I'll tell you at the end — I don't want it to influence your answers"
- Follow energy — if question 3 leads to a great story, stay there

### After the Interview
- Show them the wireframe (the Figma prototype or wireframe app)
- Ask: "Does this solve the problem you described? What's missing? What's confusing?"
- End with: "Would you be willing to try an early version when it's ready? Can I have your email?"

---

## What to Listen For

### Signs we are on the right track:
- They describe a specific memory of tab chaos costing them time or money ("I lost the chair I wanted")
- They have tried to build their own system (spreadsheet, screenshots, bookmarks) and it was frustrating
- They express frustration with tools that only work on one site ("Amazon wishlist doesn't help for Target")
- When shown the wireframe, they say something like "I would have used this last week"
- They ask "when can I install it?" without being prompted

### Signs we need to rethink something:
- They do not recognize the pain — they just buy the first thing they see
- They already have a system that works for them and would not switch
- The wireframe confuses them about what the product does
- They would not pay anything for this, even if they like it
- Their use case is completely unlike our assumptions (they only shop on Amazon, etc.)

### Quotes to capture word-for-word:
Any sentence that starts with:
- "I always end up..."
- "The most annoying thing is..."
- "I wish it could..."
- "I've tried [tool] but..."
- "I would definitely pay for..."
- "I would never pay for..."

These are the building blocks of your landing page copy, pitch deck, and Product Hunt description.

---

## Synthesizing Findings

After every 5 interviews, run a synthesis session:

1. List every pain mentioned across all 5 interviews
2. Mark which pains came up in 3+ interviews — these are validated
3. Mark which pains are unique to 1 person — these are edge cases
4. Write one sentence for each validated pain: "When [user type] is [situation], they feel [emotion] because [cause]."
5. Check your assumptions: did interviews confirm or challenge what you built the spec around?

**Update the product spec if a validated pain is not addressed by V1.**

---

## Quantitative Feedback Form (Post-Install)

Send this to reference customers after they have used Haul for one shopping session.

**Haul Alpha Feedback — 5 Questions**

1. On a scale of 1-10, how likely are you to use Haul the next time you shop online? (1 = definitely not, 10 = definitely yes)

2. Which feature did you find most useful?
   - [ ] Save button on product pages
   - [ ] Side tray with all saves
   - [ ] Comparison dashboard
   - [ ] Share comparison link
   - [ ] Something else: ______

3. Which feature was hardest to understand or use?
   - [ ] Finding the Save button
   - [ ] Opening the side tray
   - [ ] Opening the comparison dashboard
   - [ ] The comparison table layout
   - [ ] Something else: ______

4. Did Haul fail to capture the right product data on any site? If yes, which site?
   - [ ] No, it worked everywhere I tried
   - [ ] Yes: ______

5. In your own words, what would make Haul worth paying $4.99/month for?
   (open text)

**Where to host this form:** Google Forms, linked from the alpha release email. Share the link again after 3 days if no response.

---

## Qualitative Interview Schedule

| Week | Goal | Target Count |
|------|------|-------------|
| Week 1 (pre-build) | Validate the pain exists and is acute | 5 discovery interviews |
| Week 4 (mid-build) | Show wireframe and get reaction to core loop | 5 concept testing interviews |
| Week 7 (pre-launch) | Test the working extension with real users | 5 usability testing sessions |
| Week 9 (post-launch) | Understand activation + retention | 3 retention interviews |

**Minimum viable research:** If you only have time for one session, do Week 7 usability testing. Watching someone try to use the extension for the first time reveals more in 20 minutes than all the surveys combined.

---

## Usability Testing Protocol (Week 7)

**Setup:** Working extension installed on a test Chrome profile. Participant uses their own computer or yours.

**Tasks to give (one at a time, no hints):**

1. "You're looking for new running shoes. Use Haul to save a shoe from Nike.com and a shoe from ASOS.com."
2. "Now compare what you saved."
3. "If you wanted to share these options with a friend, how would you do that?"
4. "Now remove the ASOS shoe from your comparison."

**What to observe:**
- Does the Save button appear immediately when they land on the product page?
- Do they hesitate before clicking Save? (button not obvious enough)
- Do they find the side tray without being told? (discovery problem)
- Do they find "Compare All" without help? (CTA visibility)
- Do they understand the comparison table at a glance? (layout clarity)
- Any error messages or broken states?

**After the tasks:**
- "What was confusing?"
- "What would you do differently next time?"
- "Would you use this the next time you shop for [something they care about]?"
- "What's missing?"

Write up findings within 24 hours while memory is fresh.
