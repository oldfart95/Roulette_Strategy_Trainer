# Roulette Royale Lab

Roulette Royale Lab is a premium-feeling, browser-based roulette simulator designed as a study and simulation surface, not a gambling product. European single-zero roulette is the default, with American double-zero mode available for comparison. It runs entirely in the browser, uses a transparent fair-play model, and deploys as a plain static site on GitHub Pages.

## Run locally

Open `index.html` in a modern browser. The checked-in browser bundle is wired so the app works both as a plain local file and as a static site on GitHub Pages.

## Deploy to GitHub Pages

1. Push the repository to GitHub.
2. In repository settings, open `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Push to `main`. The included workflow publishes `index.html` and `src/` as a static Pages site automatically.

## Architecture

- `index.html`: static shell entry point.
- `src/config.js`: European and American wheel orders, chip values, defaults, house edges, animation presets, and storage keys.
- `src/data/wheel.js`: outcome classification helpers.
- `src/engine/rng.js`: secure unbiased browser randomness with rejection sampling.
- `src/engine/bets.js`: canonical inside and outside bet definitions, including American 00 straight and 0/00 split support.
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

## Controls

- Select a chip, then tap any number, seam, street, six line, dozen, column, or even-money zone.
- Switch to Drag mode to pick up the selected chip and drop it on a valid table target.
- `Spin` closes betting, samples the result immediately, runs the wheel animation, then settles payouts.
- `Undo` refunds the latest chip placement.
- `Clear` refunds all open bets.
- `Repeat` duplicates the current active layout, or restores the last completed layout if no bets are open.
- `Rebet` restores the last completed layout.
- `Stats` opens the advanced stats window with streaks, frequencies, history, bankroll trends, and bet-type performance.
- `Help` opens payout, house edge, fairness, and strategy notes.
- Keyboard shortcuts: Space spin, Z or Backspace undo, C clear, R repeat, H help, S stats, Escape close modal.

Changing wheel mode resets the session so European and American histories are not mixed.

## Fairness model

- Every spin is independent.
- Outcomes are sampled from the selected standard roulette wheel.
- `window.crypto.getRandomValues` is used for randomness.
- Rejection sampling avoids modulo bias.
- The winning number is decided before the animation resolves.
- The house edge is the normal wheel edge: about 2.70% for European and 5.26% for American.
- The simulator is educational only: no real money, no prizes, and no fake near-miss or adaptive outcome behavior.
