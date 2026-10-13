# Maintenance scripts

Supported, read-only checks:

- `validate.js`: health, mathematics, site/archive and catalogue-maintenance audits.
- `audit-catalogue-maintenance.js`: original-record digest, explicit new vectors, source independence, release dates, scope and compatibility parity. Read-only; passing does not certify artistic quality.
- `health-check.js`: catalogue shape, live/authoring parity, queue and review coverage.
- `audit-ranking-math.js`: current totals versus historical caches; `--json` includes every difference.
- `audit-ranking-calibration.js`: JSON diagnostic comparing the current optional duration preference with quality-only order, evidence coverage and recovered edit provenance. It reads files and writes only to stdout. Dated audit JSON/Markdown documents are snapshots; do not overwrite them with a newer policy's output.
- `audit-site.js`: active entries, dependency syntax, sitemap paths and metadata correction drift.
- `*.test.js`: behavioural tests for the model, arithmetic and account synchronization.

Intentional local generators:

- `prepare-review-archive.js`: idempotent context on preserved review pages.
- `generate-sitemap.js`: existing, indexable archive URLs.
- `start-local.ps1`: start/reuse/stop the loopback preview server.
- `migrate-assessments.py`: completed one-time migration from the research ledger. It preserves subjective ratings and skips existing assessment records. It is not an ongoing source of assessment updates.

The research helpers `build-ranking-ledger.py`, `audit-ranking-design.py` and `verify-ranking-ledger.py` produced the frozen pre-improvement snapshot in `docs/ranking-ledger/`. Their historical count/hash assertions describe that source revision. Do not run them over the new catalogue to overwrite that evidence; use `assessment.test.js` and `validate.js` for current verification.

All other batch, discovery, scoring, import and git-sync helpers are recovered legacy tools. They have not been validated for the new active architecture. Some mutate files, target retired catalogues, use old absolute paths, or push to GitHub. Inspect and adapt them before use; they are not part of the supported test or publishing workflow.

See the root README and LOCAL-DEVELOPMENT.md for the current architecture and review evidence.
