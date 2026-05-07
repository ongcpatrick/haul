# Haul

Haul is a Chrome extension for comparison shopping. It lets shoppers save products from different retail sites while browsing, view saved items in a side tray, and compare options side-by-side before buying.

This repository contains the IME 403 project materials, mid-fidelity wireframes, and the Alpha v0.1.0 Chrome extension.

## Alpha Extension

The working Chrome extension lives in:

```text
haul-extension/
```

The packaged Alpha release zip is:

```text
haul-v0.1.0.zip
```

## Install The Alpha Locally

1. Download or clone this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Turn on **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the `haul-extension/` folder.
6. Pin Haul from the Chrome extensions menu.
7. Visit a product page and click **Save to Haul**.

## Alpha Features

- Product-page detection on common shopping sites
- Floating **Save to Haul** button
- Product extraction using schema.org, Open Graph, site-specific selectors, and generic DOM fallback
- Local Chrome storage for saved products
- Extension badge count
- Side panel with saved products
- Comparison dashboard
- Shareable comparison link
- Privacy-first local alpha with no backend

## Project Structure

```text
.
├── haul-extension/                    Chrome extension source
├── haul-v0.1.0.zip                    Alpha release package
├── Mid-Fidelity Wireframes for Haul/   Wireframe prototype
├── IME403-PROPOSAL.md                 Product proposal
├── HAUL-PRODUCT-SPEC.md               Product specification
├── DEV-SPRINT-PLAN.md                 Build roadmap
├── LAUNCH-PLAYBOOK.md                 Launch plan
├── METRICS-AND-GROWTH.md              Metrics framework
├── USER-RESEARCH-PLAYBOOK.md          Research plan
└── ALPHA-RELEASE-EMAIL.md             Reference customer email template
```

## Release Notes

See [haul-extension/RELEASE-NOTES.md](haul-extension/RELEASE-NOTES.md).

## Privacy

Haul Alpha stores saved products locally in Chrome using `chrome.storage.local`. It does not require an account and does not send saved product data to a backend.

See [haul-extension/PRIVACY.md](haul-extension/PRIVACY.md).

## Team

- Patrick Ong
- Trevor Yargeau
- Kendall Corrine Eulo

## License

MIT License. See [LICENSE](LICENSE).

