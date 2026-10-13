# Dynamic Rank Engine

A small, static television ranking app. No framework, package install or build step is required.

- Public site: <https://dynamicrankengine.com/> (GitHub Pages, `master`).
- Local work: `D:\DynamicRankEngine`, branch `codex/local-development`.
- Preview: <http://localhost:4173/>. Local editing and publication are separate steps.
- 439 ranked entries, including fourteen provisional research reassessments and 425 legacy assessments, with all 442 original records preserved. Two duplicate aliases and one unidentified entry are excluded from the displayed catalogue.

## Work on the site

See [LOCAL-DEVELOPMENT.md](LOCAL-DEVELOPMENT.md) for startup, storage, testing and recovery.

| File | Responsibility |
| --- | --- |
| `index.html` | Semantic page, panels and native dialogs |
| `styles.css` | Responsive presentation, focus states and reduced-motion behaviour |
| `app.js` | Browser interactions, rendering, backups, authentication and archive loading |
| `ranking-math.js` | Authoritative scoring formula, rounding, weights and capped optional duration preference |
| `ranking-state.js` | Validated preferences, catalogue model, filters, duplicate aliases |
| `account-sync.js` | Bounded reads, ordered writes, acknowledgement and account ownership |
| `firebase-config.js` | Public Firebase web configuration; not an authorization boundary |
| `data/shows/index.json` | Authoritative live catalogue: ratings, versioned scope and per-dimension evidence together |
| `data/core/ranked.json` | Retained compatibility catalogue; numerical inputs stay in agreement with the live record |
| `data/catalogue-corrections.json` | Dated metadata repairs, before/after values and source links |
| `docs/shows/` | Historical review text, labelled as an archive |

`data/core/00-foundation-list.json` is a historical baseline, not the live calculation. The browser ignores stored `final` and account `_final` caches and calculates from category ratings, applied weights and episode settings.

## Assessment improvements — 13 October 2026

The [assessment standard](docs/ASSESSMENTS.md#audience-affinity-messages-and-source-independence) now explicitly separates craft from audience affinity, agreement with a message and critical acclaim. The [I May Destroy You source audit](docs/critical-reassessments-2026-10-13.md#follow-up-source-audit) identifies clustered critical evidence and incomplete comparative calibration. This clarification changes the editorial procedure; it does not apply an ideological bonus or penalty, or alter current scores.

The [critical reassessment pass](docs/critical-reassessments-2026-10-13.md) revises Buffy, The Walking Dead, Boston Legal, The Practice, Shameless (US), Fleabag, I May Destroy You, The Pitt and Fallout. All nine have seven new reasons, explicit season coverage and sources. The changes include justified increases as well as decreases; no target ranks were chosen. Scores are provisional research judgments, not complete-viewing assessments. Personal overrides remain separate. The other 425 ranked entries still need calibration against the same standard.

Current verification: all 51 tests pass and the full site validator is healthy. All nine browser-rendered totals and all 63 sourced reasons match the canonical data. A guest edit survived reload and reset to the new baseline. All 433 other preserved records and the original review prose were verified unchanged; regenerated archive context is idempotent. The sitemap contains 415 existing, indexable URLs.

Following the [critical ranking audit](docs/ranking-calibration-review-2026-10-13.md), Josh clarified the preference for realistic, serious drama assessed through believable performances, substantial characters and disciplined writing. The [assessment standard](docs/ASSESSMENTS.md) records the concrete criteria. Quality alone is now the default. The optional duration bonus grows smoothly from zero at ten episodes to at most 0.5% at 100 episodes, with no short-run penalty. It adds at most 0.04 to an 8/10 score. Existing explicit personal toggle choices remain saved; reset uses the new off default. Category ratings and weights are unchanged by this policy update. Earlier audits, stored totals and verification notes below describe their own historical revisions.

Verification of the revised duration policy: 51 tests pass and the validator is healthy. The independent rational oracle covers every preserved record under both weight sets and both bonus states. The optional bonus now moves entries by 2.22 places on average, with 48 of the quality-only top 50 retained. Local browser checks confirm the displayed bonus, its explanation and reload persistence. Josh's account received server confirmation for switching the bonus off; its seven weights and 26 personal-rating count survived reload.

The earlier [first five reassessments](docs/first-five-reassessments-2026-10-13.md) replaced the wrong-programme assessments with 35 sourced reasons and explicit episode coverage. They are provisional research judgments; complete runs were not watched for that pass. The original prose remains withheld. At that revision, the other 434 ranked entries retained their legacy ratings. Verification then: 50 tests passed, the full validator was healthy, all five new totals were checked in the local browser, and a guest personal edit survived reload and reset. The migration notes below record the preceding state.

The [design audit](docs/ranking-ledger/README.md) now informs the interface. Each show explains its seven weighted contributions, score and rank without length adjustment, and equal-score ties. Rating controls open on demand with exact decimal entry. The rubric restores purposeful quiet scenes, grounded visual worlds and earned ambiguity to their original meanings.

Every catalogue record carries versioned scope and seven historical evidence records. Conflicting archive numbers are labelled; missing reasons remain missing. This migration is not a fresh critical assessment of 442 programmes.

At the migration revision, five wrong-programme assessments—Pluribus, When Life Gives You Tangerines, Golden Boy, Esrefs Dream and The Art of Sarah—remained searchable and pinnable but had no score or rank. Existing personal inputs survived backups; editing these entries was paused pending reassessment. Fifteen further reviews with unresolved factual concerns were withheld as commentary, without assuming their numerical inputs were wrong. All twenty withheld reviews were noindex and omitted from the sitemap. The subsequent passes above replace fourteen assessments and now withhold twenty-five original reviews.

All 3,094 category inputs and existing weights/length policy are preserved. Museum of Innocence's count was corrected from eight to nine using Netflix's announcement; its multiplier is unchanged. See [assessment authoring](docs/ASSESSMENTS.md).

Verification: 47 automated tests pass, including the independent arithmetic oracle, all preserved inputs, pending-assessment behaviour, evidence validation, account races and backup round trips. The full site validator passes. Guest browser checks confirmed exact 9.37 entry and reload, invalid/blank input protection, reset, pending-entry discovery, mixed shortlist comparison, weight extremes, Chernobyl's actual no-length reorder, tie explanations, season scope and Escape focus return. Layouts were inspected at desktop, 390 and 320 pixels without horizontal overflow. The signed-in cloud account was not edited during this pass.

The product review below records the earlier recovery pass. Its counts and ratings are historical; this section and the current checks describe the present implementation.

## Product review — 13 October 2026

**Overall assessment: 5/10 before this review; 8/10 after the local repairs.** These are engineering and design judgments, not a certification. The largest remaining weakness is confidence in the original editorial assessments.

| Aspect | Before | Now | Finding and response |
| --- | ---: | ---: | --- |
| Clarity and visual design | 4 | 9 | Oversized introduction, repeated controls and dense cards replaced with a compact ranking list and controls shown when needed. |
| Ranking calculations | 8 | 9 | Earlier arithmetic fixes retained in a shared module; six incorrect season-scoped episode counts corrected. Every total derives from the same inputs. |
| Browsing and discovery | 5 | 9 | Removed the 100-result ceiling and hidden 6.5 minimum. All active entries are reachable. Search, every catalogue genre, dates, sorting, shortlist and comparison are available. |
| Personalisation | 6 | 9 | Weight changes automatically balance to 100%. Ratings are edited in one focused detail view. Exact imported decimal scores are preserved. |
| Accounts and storage | 6 | 8 | Server-confirmed autosave and manual save, serial writes, blocked editing during failed account loads, separate guest storage, recovery copies, portable backups and reset/undo. |
| Accessibility | 3 | 8 | Native modal focus containment, Escape, restored focus, labelled controls, keyboard operation, skip link and reduced-motion support. No formal assistive-technology certification performed. |
| Mobile layout | 5 | 8 | Tested at 320 and 390 pixels without horizontal overflow. Search, ranking and details remain usable; advanced controls expand on demand. |
| Performance | 4 | 9 | Initial guest DOM reduced from 8,620 to 689 elements; initial sliders from 707 to 7. One small lazy poster per row replaces duplicate poster/backdrop requests. Active local HTML/CSS/JS is about 81 KB, versus the previous 269 KB HTML alone. |
| Catalogue integrity | 3 | 6 | Checked all 442 stored IDs against TMDB (433 unique requests); corrected 57 identities and associated artwork, six season counts, two duplicates and one unverified title. Three reviews with mismatched premises are withheld. This does not validate all prose or subjective ratings. |
| Security and privacy | 5 | 7 | Escaped user-controlled text, text-only review extraction, import validation, account-scoped state, explicit storage explanation. An unsigned request for the owner's account document returned 403. Cross-account Firestore rule enforcement is not yet independently verified. |
| Search indexing and archives | 3 | 7 | Fixed all sitemap paths. Its 437 URLs exist locally; unverified reviews are noindex and excluded. All 442 catalogue reviews carry archive context and a link back to current calculations. |
| Maintenance | 3 | 8 | Replaced the 6,000-line page with focused plain-JavaScript modules, read-only checks and behavioural tests. Fixed the malformed ignore file and queue count. Legacy tooling is clearly separated in the instructions. |

## Material data findings

The [correction ledger](data/catalogue-corrections.json) records each repair and its TMDB source. For example, The Morning Show was using The Marvelous Mrs. Maisel's ID; The OA pointed to The Perfect Insider.

| Season-scoped entry | Previous episode count | Verified count |
| --- | ---: | ---: |
| Altered Carbon (S1) | 20 | 10 |
| Sherlock (S1–3) | 12 | 9 |
| Vikings (S1–4) | 59 | 49 |
| The 100 (S1–5) | 100 | 71 |
| Outlander (S1–3) | 67 | 42 |
| Alias (S1–3) | 105 | 66 |

Doctor Who (2005) resolves to Doctor Who; The Killing resolves to The Killing (US). Legacy title-keyed ratings, pins and detail links are carried forward. The original duplicate records remain on disk. If both names have personal ratings, the canonical entry takes precedence and the legacy values remain in backups.

Revolution 9 is excluded pending identity verification: its ID returned 404 and searches did not identify a matching 2024 television series. This is a statement of insufficient evidence, not proof that no such programme exists.

The archived Golden Boy, Esrefs Dream and The Art of Sarah reviews describe premises inconsistent with the identified programmes. They are withheld from the app and marked noindex in the archive. Their starting ratings are explicitly labelled provisional. No replacement subjective ratings were invented. Identification evidence includes [Golden Boy on TMDB](https://www.themoviedb.org/tv/210865-yali-capkini), [Esref Ruya on TMDB](https://www.themoviedb.org/tv/283123-esref-ruya), and [The Art of Sarah on TMDB](https://www.themoviedb.org/tv/273977).

## Verification

- 37 automated tests cover an independent integer-arithmetic oracle across all 442 records, both weight sets and episode settings (1,768 combinations), every weight position, validation, imports, filters, aliases, account races, failed reads/writes, timeouts and ordered saving.
- The read-only validation checks pass. Its remaining warnings explicitly describe the unverified catalogue entry and three withheld reviews.
- Browser checks: automatic weight balancing, rating/reload agreement, exact decimal import, safe literal search text, pagination, shortlist comparison, backup download/restore, invalid import rejection, reset/undo, native keyboard dismissal and focus return.
- Blocking the catalogue request produced a clear failure view. Unblocking it and pressing Try again restored the full active catalogue.
- Josh's account retained the 20/15/15/10/15/15/10 weights, enabled length adjustment and 26 personal ratings. A temporary A–Z preference saved, survived reload and was restored to rank order. Manual saving also received server confirmation. All 30 displayed account totals and ranks matched the current catalogue and the exported preferences.
- Phone checks at 320 and 390 pixels found no horizontal overflow. Core controls and detail dialogs have accessible names. These checks do not replace a full screen-reader or cross-browser audit.

## What would improve it next

1. **Continue editorial calibration.** Fourteen entries now have sourced research assessments; the other 425 active entries still carry legacy judgments. Apply the same standard to reference shows and remaining audit candidates before interpreting ordinal positions as a settled hierarchy.
2. **Verify cloud access rules.** Per-entry assessment scope, date and evidence are implemented. Export the actual deployed Firestore rules into the repo and test owner-versus-other-account permissions in an emulator.
3. **Strengthen viewing evidence.** Research identifies concrete strengths and weaknesses, but complete-run viewing and scene-level checks would improve the provisional assessments, especially their less sampled middle seasons and visual judgments.
4. **Publish reviewed changes.** GitHub Pages serves the root of `master` at the existing domain. `.nojekyll` keeps this buildless site and its evidence files unprocessed. Run the documented checks, commit the intended changes, then push to `master` only when publication is authorized. Confirm the Pages deployment and public version; a successful push alone is not proof of a live release.

The recovered documents `RECOVERY.md`, `WORKFLOWS.md`, `DIRECTIVE.md` and most batch scripts describe older workflows. Use the current README, local guide and `scripts/README.md` for active maintenance.
