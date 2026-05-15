# Haul Privacy Policy

**Last Updated:** May 2026

## What Haul Stores Locally

Haul stores saved products, folders, your one-time cloud consent choice, and optional Haul account connection state in Chrome using `chrome.storage.local`.

Saved product fields can include product name, price, original price, image URL, source URL, site name, category, and save time.

## When Data Leaves Your Browser

Haul sends product data to Haul cloud services only for user-facing cloud features:

- **AI assistance:** when you use the AI assistant, Haul sends the products in your comparison and recent chat messages to the Haul Cloudflare Worker, which forwards the request to Anthropic for product advice.
- **Sharing:** when you create a share link or post to Explore, Haul sends the products in that comparison to the Haul Cloudflare Worker so the shared page can be generated.
- **Account posting:** when you connect a Haul account and post to your feed or a circle, Haul sends the selected products to the Haul web app hosted on Railway.
- **Image proxying:** Haul may request product image URLs through the Haul Cloudflare Worker so images render in the extension and shared pages.

Haul asks for consent before AI and sharing features send comparison data to cloud services.

## Account Tokens

If you connect a Haul account, the extension stores a short-lived bearer token locally. The Haul web app stores only a hash of that token server-side and rotates the token when you reconnect.

## What Haul Does Not Do

- Does not sell user data.
- Does not use product or browsing data for personalized advertising.
- Does not collect payment information.
- Does not run product detection scripts on every website by default.
- Does not allow humans to read user data except where required for security, support, legal compliance, or with explicit user consent.

## Permissions Used and Why

| Permission | Why |
|-----------|-----|
| `storage` | Save product lists, folders, consent state, and optional account connection locally |
| `sidePanel` | Display the side tray alongside shopping pages |
| `tabs` | Open product pages, the comparison dashboard, and Haul account pages |
| Host access for supported retail sites | Show the Save to Haul button and read product fields on supported shopping pages |
| Host access for Haul services | Call the Haul Cloudflare Worker and Haul web app for cloud features |
| Optional `<all_urls>` host access | Reserved for users who explicitly grant broader site access for unsupported shops |

## Limited Use

Haul's use of information received from Chrome extension APIs complies with the Chrome Web Store User Data Policy, including the Limited Use requirements. Haul uses extension data only to provide or improve shopping comparison, AI assistance, sharing, account posting, and security features.

## Contact

Questions about privacy: pong01@calpoly.edu
