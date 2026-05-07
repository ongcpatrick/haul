# Real Product Prompts for Haul

These prompts are for turning Haul from a class alpha into a real product that can make money.

Use these after the Project III Alpha package is stable.

Best order:

1. Money-Making Product Strategy
2. Paid User Validation Plan
3. Chrome Web Store Launch Plan
4. Monetization Architecture
5. Retention and Analytics
6. Affiliate Revenue Plan
7. Pro Feature Roadmap
8. Real User Onboarding
9. Pricing Page and Upgrade Flow
10. 30-Day Revenue Sprint

---

## Prompt 1: Money-Making Product Strategy

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Turn Haul from a class alpha into a real product that can make money.

Analyze:
- HAUL-PRODUCT-SPEC.md
- METRICS-AND-GROWTH.md
- LAUNCH-PLAYBOOK.md
- USER-RESEARCH-PLAYBOOK.md
- haul-extension/
- Mid-Fidelity Wireframes for Haul/

Create:
- REAL-PRODUCT-ROADMAP.md

The roadmap must include:
1. Who will pay first and why
2. The one pain we should monetize first
3. Free vs Pro feature split
4. Why users would pay $4.99/month
5. What must be true before adding Stripe
6. What must be true before adding affiliate links
7. 30-day, 60-day, and 90-day plan
8. The highest-risk assumptions
9. How to test those assumptions cheaply
10. What not to build yet

Constraints:
- Be brutally practical.
- Prioritize revenue and retention over shiny features.
- Assume we have limited engineering time.
- Do not recommend building a backend unless the business case is clear.
- Keep the first paid version small.

Output:
- Create REAL-PRODUCT-ROADMAP.md
- Give me the top 5 actions that move us closest to revenue.
```

---

## Prompt 2: Paid User Validation Plan

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Figure out whether people will actually pay for Haul before we waste time building too much.

Create:
- PAID-VALIDATION-PLAN.md

Include:
1. 10 target customer profiles most likely to pay
2. Interview script focused on willingness to pay
3. A fake-door test for Haul Pro
4. A price testing plan for $2.99, $4.99, $7.99, and $9.99/month
5. A landing page value proposition test
6. Upgrade CTA copy to test inside the extension
7. Exact success metrics for validation
8. What results mean "build Pro"
9. What results mean "do not build Pro yet"

Make this specific to Haul:
- Price drop alerts
- AI auto-categorization
- Smart recommendations
- Advanced extraction
- Shareable comparison lists

Output:
- PAID-VALIDATION-PLAN.md
- 3 upgrade modal copy variants
- 3 reference customer questions that directly test if they would pay
```

---

## Prompt 3: Chrome Web Store Launch Plan

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Prepare Haul for a real Chrome Web Store launch, not just a class alpha.

Important:
Before making policy or listing recommendations, verify current Chrome Web Store requirements from official Google documentation.

Create:
- CHROME-WEB-STORE-LAUNCH.md

Include:
1. Store listing title options
2. Short description options
3. Full description
4. Screenshot plan
5. Demo video script
6. Privacy disclosure checklist
7. Permission justification copy
8. Review-risk checklist
9. Launch-day checklist
10. First 100 reviews plan

Focus on conversion:
- What makes someone install immediately?
- What screenshots make the product obvious?
- What keywords should we target?
- What claims should we avoid?

Output:
- CHROME-WEB-STORE-LAUNCH.md
- Updated listing copy I can paste into Chrome Web Store
- Exact screenshots we need to capture
```

---

## Prompt 4: Monetization Architecture

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Design the simplest monetization architecture for Haul Pro.

Analyze:
- haul-extension/
- HAUL-PRODUCT-SPEC.md
- METRICS-AND-GROWTH.md

Create:
- MONETIZATION-ARCHITECTURE.md

Answer:
1. Can we monetize without accounts at first?
2. When do we need accounts?
3. Should Pro be Stripe Checkout, Stripe Customer Portal, or something else?
4. What is the simplest way to gate Pro features in a Chrome extension?
5. How should license status be stored?
6. How do we prevent casual bypass without overbuilding?
7. What backend is the minimum viable backend, if any?
8. What should be free forever?
9. What should be Pro only?

Constraints:
- Do not over-engineer.
- Avoid subscriptions until we validate willingness to pay.
- Prefer fake-door validation before Stripe.
- If a backend is needed, propose the smallest possible version.

Output:
- MONETIZATION-ARCHITECTURE.md
- A phased implementation plan: fake-door, manual paid beta, automated Stripe
```

---

## Prompt 5: Retention and Analytics

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Define product analytics that tell us whether Haul can become a business.

Create:
- ANALYTICS-AND-RETENTION.md

Define events:
- extension_installed
- first_save_completed
- product_save_failed
- side_panel_opened
- comparison_dashboard_opened
- go_to_site_clicked
- share_clicked
- product_removed
- pro_feature_clicked
- upgrade_clicked
- feedback_submitted

For each event include:
- Why it matters
- Properties to collect
- Whether it can be tracked locally in alpha
- Whether it requires user consent or privacy disclosure

Define:
1. Activation metric
2. Retention metric
3. Revenue metric
4. North Star metric
5. Weekly dashboard format
6. Red/yellow/green thresholds

Constraints:
- Privacy-first.
- Do not add analytics code yet unless explicitly asked.
- Explain what can be measured manually during alpha.

Output:
- ANALYTICS-AND-RETENTION.md
- 1-page weekly metrics dashboard template
```

---

## Prompt 6: Affiliate Revenue Plan

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Evaluate whether affiliate revenue is a better first money path than subscriptions.

Important:
Research current affiliate program requirements and rules before recommending implementation.

Create:
- AFFILIATE-REVENUE-PLAN.md

Analyze:
- Amazon Associates
- Target
- Best Buy
- Nike
- ASOS
- eBay
- Impact/CJ/AWIN-style networks

Include:
1. Which programs are realistic first
2. Which programs are hard for a new extension
3. Disclosure requirements
4. Technical implementation approach
5. How to avoid breaking user trust
6. Revenue assumptions
7. Whether affiliate should come before Pro subscriptions
8. Risks of affiliate links in a Chrome extension

Output:
- AFFILIATE-REVENUE-PLAN.md
- Recommendation: affiliate first, subscription first, or both later
```

---

## Prompt 7: Pro Feature Roadmap

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Choose the smallest Pro feature set users would actually pay for.

Create:
- PRO-FEATURE-ROADMAP.md

Rank these features:
- Price drop alerts
- AI auto-categorization
- Smart recommendations
- Advanced extraction
- Shared comparison lists
- Unlimited saved lists
- Cross-device sync
- Deal history
- Export to PDF/image

For each feature include:
- User pain solved
- Willingness-to-pay strength
- Engineering difficulty
- Ongoing cost
- Privacy risk
- MVP version
- Full version

Then recommend:
1. First Pro feature to validate
2. First Pro feature to build
3. What should stay free
4. What should not be built yet

Output:
- PRO-FEATURE-ROADMAP.md
- Final recommended Free vs Pro split
```

---

## Prompt 8: Real User Onboarding

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Improve onboarding so a first-time user reaches the "aha moment" quickly.

The aha moment:
User saves at least 2 products and opens the comparison dashboard.

Analyze:
- haul-extension/popup/
- haul-extension/sidepanel/
- haul-extension/content-script.js
- Mid-Fidelity Wireframes for Haul/src/app/components/FirstTimeOnboarding.tsx
- Mid-Fidelity Wireframes for Haul/src/app/components/EmptyState.tsx

Create:
- ONBOARDING-IMPROVEMENT-PLAN.md

Include:
1. Current onboarding gaps
2. First-run flow
3. Empty-state copy
4. Save button tooltip copy
5. Nudge after first save
6. Nudge after second save
7. CTA to Compare All
8. How to measure onboarding success

If implementation is low-risk:
- Improve copy and nudges directly in haul-extension/
- Do not add dependencies
- Keep alpha installable
- Recreate haul-v0.1.0.zip

Output:
- ONBOARDING-IMPROVEMENT-PLAN.md
- Files changed, if any
```

---

## Prompt 9: Pricing Page and Upgrade Flow

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Design a credible pricing and upgrade flow for Haul Pro.

Create:
- PRICING-AND-UPGRADE-FLOW.md

Include:
1. Free plan copy
2. Pro plan copy
3. Monthly vs annual pricing recommendation
4. Upgrade modal copy
5. Fake-door upgrade flow for alpha/beta
6. "Coming soon" waitlist capture flow
7. Success message after upgrade interest
8. Cancellation-risk concerns
9. Exact copy for three upgrade triggers:
   - price drop alert clicked
   - AI categorization clicked
   - smart recommendations clicked

Constraints:
- Do not implement Stripe yet.
- Do not require accounts yet.
- Focus on learning whether people want Pro.

Output:
- PRICING-AND-UPGRADE-FLOW.md
- Upgrade modal copy variants
```

---

## Prompt 10: 30-Day Revenue Sprint

```text
You are working in:
/Users/ongcp/Documents/AI Projects/IME 403 Haul Project

Goal:
Create a 30-day sprint plan whose only goal is to get Haul closer to revenue.

Create:
- 30-DAY-REVENUE-SPRINT.md

Plan week by week:
- Week 1: alpha reliability and reference user testing
- Week 2: public beta and Chrome Web Store prep
- Week 3: acquisition experiments
- Week 4: monetization validation

For each week include:
- Goal
- Tasks
- Metrics
- Minimum success threshold
- Kill/continue decision

Include:
- Daily checklist
- Outreach targets
- Reddit/Product Hunt/Cal Poly channel plan
- Feedback synthesis plan
- Revenue hypothesis
- What to build
- What not to build

Output:
- 30-DAY-REVENUE-SPRINT.md
- Top 3 actions to do this week
```

