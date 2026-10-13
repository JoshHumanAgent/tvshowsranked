# Assessments

The live record in `data/shows/index.json` binds programme identity, assessed run, seven ratings and supporting evidence. The seven top-level numeric fields are authoritative inputs. Do not keep a second current score vector in review prose or in the nested evidence object. The browser derives totals and ranks.

## The migration

The 13 October 2026 migration preserved every subjective rating. It created `assessment.version: 1` records with rubric version `2026-10`, a catalogue source date, an evidence organisation date, scope, review status, seven dimension records and relevant audit findings. These dates do not claim fresh verification of every review fact. A subsequent, explicit five-record reassessment is described below; other entries still retain that migration state.

Each `dimensions[key]` contains a current `reason` (initially null) and an `archive` containing the ratings actually found beside the historical excerpt. Null reasons are deliberate. A matching number does not establish that old prose is correct, applies to the same seasons, or supports the present judgment.

The interface shows current input, weight and contribution. Expanding a dimension reveals its definition and historical note. Personal edits never rewrite editorial reasons or archive numbers.

## Scope and withheld material

`scope.status: named` means the selected range was recorded in the title. It does not independently verify every episode count. `unrecorded` means the original assessment did not identify its season cutoff. Do not interpret an episode count as a complete-series assessment.

Ongoing stories are judged against promises developed in the assessed run. Cancellation, an unknown endpoint, quiet scenes, ordinary locations and ambiguity are not automatic penalties. Active definitions in `ranking-state.js` are shared by the methodology and detail views.

The migration withheld five established wrong-programme assessments: Pluribus, When Life Gives You Tangerines, Golden Boy, Esrefs Dream and The Art of Sarah. Version 2 now replaces these with explicitly provisional research assessments, restoring calculated scores and ranks. The original wrong-programme prose remains withheld. For any future `assessment.status: withheld` record, derived `final` and `rank` are null; it remains searchable and shortlistable, and personal inputs stay exportable but cannot silently restore a rank.

Fifteen more records have `review.status: withheld` for unresolved factual or adaptation conflicts. Their scores remain recovered starting judgments. This commentary restriction does not claim an external check disproved all fifteen programmes. The twenty withheld archives are noindex and absent from the sitemap. Revolution 9's separate identity quarantine and duplicate aliases are unchanged.

## Revising an assessment

1. Establish the programme, exact included seasons and episode count; record sources.
2. Apply all seven definitions and write a short, concrete reason for each judgment. Preserve historical evidence separately.
3. Edit top-level ratings and `assessment.dimensions[key].reason` together. Increment `assessment.version`, record the review date and sources, and specify scope. A complete new assessment can use `status: reviewed`.
4. To rehabilitate a pending entry, deliberately remove its obsolete top-level `reviewStatus` and change the assessment status. Incorrect historical prose can remain withheld after a new assessment is complete.
5. Keep `data/core/ranked.json` numerical inputs in agreement as a compatibility copy, not another authoring location for reasons. Record metadata repairs in `data/catalogue-corrections.json`.
6. Run `node --test scripts/*.test.js` and `node scripts/validate.js`. The regression guard preserves all untouched baseline ratings and permits only explicit revised vectors. A later deliberate rescore must update those expected changes rather than silently accepting bulk differences.
7. Regenerate archive context and sitemap when review status changes. These local scripts do not deploy.

Do not rewrite the original research ledger to make a historical finding describe a newer revision.

## First five reassessments

See [the dated reassessment record](first-five-reassessments-2026-10-13.md) for all 35 reasons, source coverage, scope and calculated totals. These are interpretations of published evidence, not claims of watching the complete runs. All five declare `basis: research` and `provisional: true`; uncertainty is visible before the score and in the evidence disclosure. Camera judgments based on stills or pilot criticism carry additional dimension-specific limits.

Version 2 reviewed records require a review date, a summary, limitations, named season coverage, episode basis, an episode count matching the ranking input, unique named HTTPS sources, and valid source references for the scope and all seven nonempty reasons. `sources[].coverage` explains what the source can establish. `supersedes` preserves the prior input vector and scope; each dimension's original `archive` is unchanged. Resolved audit findings stay in the data with their resolution, rather than appearing as current failures.

The canonical seven numeric fields remain the only current input vector. Sources do not award or certify these numerical scores. Default weights and length rules are unchanged; ranks follow the calculator. The two Turkish complete-series entries use original broadcast counts (101 and 47), excluding shorter international recuts. Saved personal ratings remain separate and take precedence in that person's ranking; reset restores the newly researched baseline.

The regression guard now allows only these five specified input vectors to differ from the frozen ledger. It also checks source binding, scope drift, provisional labels, archive withholding, preference round trips and the still-supported pending-assessment behaviour. The other 434 ranked programmes remain unreassessed legacy judgments.

## Calculation

One calculator produces contributions, unrounded weighted average, length multiplier and the once-rounded final. The no-length comparison re-ranks all eligible shows with the same current personal inputs. Equal displayed scores expose their tie count; ordinal positions stay alphabetical.

Pending entries follow ranked ones, including under Lowest score, and have blank comparison cells. Weights sum to 100%; defaults and the original optional length table are preserved. Review uncertainty is never converted into an artistic-quality penalty.
