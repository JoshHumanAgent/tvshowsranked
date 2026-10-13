# Dynamic Rank Engine

Read `docs/ASSESSMENTS.md` and `docs/CATALOGUE-MAINTENANCE.md` before changing catalogue data, ratings, explanations or release coverage. These are the current editorial rules. The older research ledger and dated reviews are evidence snapshots, not instructions to restore old scores.

- Josh wants analytical judgments of dramatic craft, credible people and consequences. No popularity, prestige, ideology, nationality, genre or automatic cancellation adjustments. Never fill a missing assessment with a guessed score.
- `ranking-math.js` is the sole calculator. Defaults are 25/15/5/5/15/15/20; length is off by default and at most +0.5% when enabled. Do not change these without a new user instruction.
- Released episodes and assessed episodes are different facts. Record exact identity, scope, cutoff, sources, author coverage and limitations. A new season does not inherit an old assessment.
- `data/shows/index.json` is authoritative. Keep `data/core/ranked.json` input-compatible. Preserve historical ledgers, the original 442 records and personal accounts/overrides.
- Record each deliberate change in the maintenance ledger and update the explicit regression expectations. Run all supported tests and `scripts/validate.js`, then verify the public files and actual browser after publishing.
- Preserve the full cards, ranks under posters and coloured dimension bars. Keep new controls minimal.
- Work in this repository, not the unrelated ManaCraft checkout. Do not drive game windows. Preserve unrelated work. Do not use question popups; ask any necessary question in chat.
- Publishing catalogue improvements to the existing site is authorised. Use the established GitHub Pages workflow, never force-push. Ongoing weekly upkeep is authorised; do not create duplicate schedules.
