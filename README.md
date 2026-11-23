# Anirjit Saha | Digital Identity, Trust & Authorization

An interactive portfolio featuring enterprise identity, authorization, trust and privacy, cloud resilience, and agentic AI access controls.

**Explore the live portfolio:** [anirjit.github.io/anirjit-saha-portfolio](https://anirjit.github.io/anirjit-saha-portfolio/)

## About this project

This repository contains the source for a lightweight, static portfolio hosted with GitHub Pages. It is built with semantic HTML, CSS, and vanilla JavaScript; there is no application backend or custom analytics.

To preview it locally, open `index.html` in a browser, or run `python3 -m http.server 8000` in this folder.

### Highlights

- Light and dark themes (follows the system setting, with a manual toggle remembered per browser)
- Scroll progress bar, active-section navigation, and an animated experience timeline
- Experience filter by focus area (Authorization, CIAM, Decentralized ID, Workforce IAM)
- Open Graph and Twitter card metadata (`assets/og-image.png`) for rich link previews
- Respects `prefers-reduced-motion` (add `?motion=full` to the URL to preview the animations anyway), keyboard accessible, print friendly

When changing `styles.css` or `script.js`, bump the `?v=` query string in `index.html` so browsers fetch the new files.
