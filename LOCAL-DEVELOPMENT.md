# Local development

The recovered site lives at `D:\DynamicRankEngine`, from <https://github.com/JoshHumanAgent/tvshowsranked>. GitHub Pages publishes the root of `master`; local development uses `codex/local-development`. `.nojekyll` serves the site as plain static files. Editing locally does not publish; an explicitly authorized push to `master` starts deployment.

## Preview

```powershell
cd D:\DynamicRankEngine
.\scripts\start-local.ps1
```

Open <http://localhost:4173/>. The helper starts or reuses a hidden Python server bound to `127.0.0.1`. Use `-Stop` to stop its verified process, or `-Port 4174` to use another port. This PC already has Python 3.11 and Node.js 24. No dependency installation or build step is required. Refresh after editing.

Use the hostname `localhost` for sign-in: the existing Firebase project authorizes it. The numeric address `127.0.0.1` uses separate browser storage and is not authorized for Google sign-in; it is useful for disposable guest tests.

The preview uses the real existing Firebase project. Signed-in edits save to the same cloud account used by the public website. Use a guest preview for rating/import/reset tests. Never sign Josh out just to test authentication.

## Active files and formula

See the file map and scored review in [README.md](README.md). UI, styles, state and account synchronization have separate files; there is still no framework or build pipeline.

`final = round(sum(category rating × weight) / 100 × episode adjustment, 2)`

Defaults are 25/15/5/5/15/15/20 for characters/world/camera/spectacle/ideas/drive/resolution. Weight edits redistribute the remainder proportionally and use largest remainders to total exactly 100%. Category ratings range from 0 to 10. Length adjustment is off by default; the optional bonus is capped at 0.5% and can put a perfect final score at 10.05. Equal displayed scores sort alphabetically.

Historical JSON `final` and saved `_final` values are never calculation inputs. The validator reports stored totals that differ from the current default calculation as historical drift, not silently used live data.

The catalogue retains 442 original records. The app displays 439 ranked programmes after duplicate handling and identity quarantine. Fourteen now have provisional research reassessments; the other 425 retain legacy judgments. Any future pending entries have null derived score/rank, remain searchable and pinnable, and never become zero-valued lowest scores. Existing overrides remain exportable but do not reinstate a disputed assessment.

`data/shows/index.json` is the authoritative assessment record. Its seven top-level ratings are the only starting-score inputs. The nested `assessment` binds scope, historical notes, source ratings and review status to the record. See [assessment authoring](docs/ASSESSMENTS.md). Metadata repairs and sources remain in `data/catalogue-corrections.json`.

## Saving and recovery

- Guest preferences: `dre:guest:v1` in this origin's local storage. They survive reloads and are separate from every signed-in account.
- Signed-in preferences: Firestore `users/{uid}`. A server read and validation must succeed before editing or writing is enabled. Writes run in order; only the latest acknowledged state is marked saved.
- Reads and writes have a 15-second confirmation timeout. A timed-out Firestore write can still complete when connectivity returns; the UI does not claim that it was cancelled.
- Recovery: account-specific `dre:account:{uid}` and `dre:recovery:{uid}` copies. An unconfirmed recovery copy is not overwritten by a later server read. The account dialog can download or restore it.
- Download and restore backups through **Your data**, including as a guest. Legacy `overrides` backups are accepted. Inputs are validated before replacement. File size is limited to 2 MB.
- Reset is in **Your data** and offers session-local Undo. Import also retains the prior state for Undo. Download a backup for durable recovery.
- Sign-out waits for dirty account data to be confirmed. A failed initial load leaves editing paused and provides Retry. The page warns before leaving with unconfirmed changes.

## Checks

```powershell
node --test scripts/health-check.test.js scripts/account-sync.test.js scripts/ranking-math.test.js scripts/site.test.js scripts/assessment.test.js
node scripts/validate.js
```

If Node is not on a shell's PATH, use `D:\node.exe`. `npm test` and `npm run check` are aliases when npm is available. All checks are read-only.

After an intentional catalogue update:

```powershell
node scripts/prepare-review-archive.js
node scripts/generate-sitemap.js
node scripts/validate.js
```

The first command adds idempotent context around existing review prose; it does not rewrite reviews. The sitemap generator includes only existing, indexable review paths. Neither command commits, pushes or deploys.

## Review evidence and rollback

The full assessment and current limits are in the README. Evidence and account backups are outside Git at:

`C:\Users\Randacus 2025\AppData\Local\DynamicRankEngine\preview`

`before-site-review` preserves the pre-review page, modules, tests and catalogues, including the earlier ranking and sync repairs. `account-backup-after-site-review.json` contains the verified account preferences. Keep account exports out of the public repository.

Use Git history to identify the published revision and keep unrelated local changes out of a release. Do not run the old bulk import, re-rank or git-sync scripts as a shortcut: many target retired files, contain hardcoded old paths or automatically push changes. Retain a local pre-release tag for rollback, and verify GitHub Pages and the public page after publishing.
