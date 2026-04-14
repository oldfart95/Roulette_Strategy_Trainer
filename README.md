# Roulette Royale Lab

Roulette Royale Lab is a premium-feeling, browser-based European roulette simulator designed as a study and simulation surface, not a gambling product. It runs entirely in the browser, uses a transparent fair-play model, and deploys as a plain static site on GitHub Pages.

## Run locally

Open `index.html` in a modern browser. The checked-in browser bundle is wired so the app works both as a plain local file and as a static site on GitHub Pages.

## Deploy to GitHub Pages

1. Push the repository to GitHub.
2. In repository settings, open `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Push to `main`. The included workflow publishes `index.html` and `src/` as a static Pages site automatically.

## Architecture

- `index.html`: static shell entry point.
- `src/config.js`: wheel order, chip values, defaults, animation presets, and storage keys.
- `src/data/wheel.js`: outcome classification helpers.
- `src/engine/rng.js`: secure unbiased browser randomness with rejection sampling.
- `src/engine/bets.js`: canonical European bet definitions.
- `src/engine/payouts.js`: payout resolution for inside and outside bets.
- `src/engine/session.js`: bankroll, undo, clear, repeat, session history, and fairness log.
- `src/engine/stats.js`: simple and advanced analytics.
- `src/storage.js`: localStorage preferences and optional session persistence.
- `src/ui/`: wheel, table, help, stats modal, and app orchestration.
- `src/styles.css`: premium visual theme and responsive layout.
- `src/app.bundle.js`: browser-ready bundle used by `index.html` so direct local file opening works without a dev server.

## Where to edit later

- Theme and visual design: `src/styles.css`
- Rules, defaults, wheel order, chips, animation tuning: `src/config.js`
- Bet definitions and labels: `src/engine/bets.js`
- Fair RNG implementation: `src/engine/rng.js`
- Help and strategy content: `src/ui/content.js`
- Main UI flow and controls: `src/ui/app.js`

## Fairness model

- Every spin is independent.
- Outcomes are sampled from standard single-zero European roulette.
- `window.crypto.getRandomValues` is used for randomness.
- Rejection sampling avoids modulo bias.
- The winning number is decided before the animation resolves.
- The house edge is the normal European single-zero edge, not a hidden system.
