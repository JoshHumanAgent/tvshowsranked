# Intended ranking design — evidence ledger

Snapshot: 13 October 2026. This is a reconstruction for future work, not a superseding instruction file. “Explicit” refers to a human statement in the recovered design conversation. “Documented” identifies a later artefact. “Inference” is the auditor's interpretation. Confidence concerns the reconstruction of intent, not the quality of a television show.

The primary source is the [original 4,610-line conversation](<D:/DynamicRankEngine/_archived/old-archive/working-files/Entire Chat with Claude to Build Ranking System.txt>). Line references below refer to that file unless another source is named. The transcript includes the AI's suggestions as well as Josh's messages; an AI's confident restatement is not automatically a new human rule.

## Purpose and scope

| ID | Reconstructed design | Evidence / confidence | Consequence for implementation or assessment |
|---|---|---|---|
| I01 | Find immersive, consequential, meaningful and unforgettable television. | Opening discussion, line 5 onward. Explicit, high. | The product should help choose a worthwhile viewing experience and explain its strengths. |
| I02 | Use consistent criteria even when personal liking differs. | Mad Men discussion around 1354. Explicit, high. | A disliked show can score well on a dimension it executes strongly; broad dislike should not lower every input. |
| I03 | Include worthwhile shows Josh has not personally watched. | Around 918. Explicit, high. | Discovery can extend beyond personal viewing, but the evidence and uncertainty must be honest. |
| I04 | Assess a specifically named run when that is the intended recommendation. | GoT S1–4 around 1760; candidate selected runs around 3176. Explicit, high for named examples. | The title, evidence, score and episode count must share the same scope. |
| I05 | Generalise peak-season selection carefully. | Later files say “peak seasons only”; the strongest direct evidence names particular exceptions. Inference, medium. | Do not automatically crop every show to maximise its final. Treat scope as part of the assessment. |
| I06 | The original area of interest was prestige live-action drama, without documentaries. | Around 664. Explicit, high for that stage. | Reality, procedural comedy and other later additions need an explicit scope decision. Do not attribute every later genre or regional exclusion to Josh. |
| I07 | Reasons should sit beside the ratings. | Around 1296. Explicit, high. | Seven numbers without matching seven explanations do not meet the intended transparency standard. |
| I08 | Prefer careful individual calibration over rapid bulk scoring when quality suffers. | Around 1182 and 2373–2489. Explicit, high. | A catalogue-growth target is not evidence that a show's ratings are well founded. |

## Scale and category boundaries

| ID | Reconstructed design | Evidence / confidence | Consequence |
|---|---|---|---|
| I09 | Five is average, six good, seven very good, eight exceptional, nine almost perfect, ten effectively unimprovable. | Around 26–28 and later calibration. Explicit, high. | A seven is praise; use the scale consistently rather than inflating every recommended show. |
| I10 | Decimal distinctions are allowed when justified. | Around 2916, including 8.3/8.5 discussion. Explicit, high. | A universal half-point-only rule is a later workflow convention. Extra digits do not create extra certainty. |
| I11 | Characters need agency, interiority, productive mystery and coherent complexity. | Kim Wexler discussion, 77–121; final definition 4049 onward. Explicit, high. | Explain behaviour and choices; conspicuous eccentricity is not a substitute for psychological depth. |
| I12 | Judge acting as embodiment and the ensemble as a whole. | BCS discussion around 1313; final definitions. Explicit, high. | A perfect lead does not make an entire assessment perfect. A hard maximum based only on cast size is not established. |
| I13 | A world should be coherent, inhabited and capable of supporting lives beyond the immediate plot. | World discussion around 333, 3380 and final definitions. Explicit, high. | Institutions and ordinary social rules count, including grounded settings. Lore quantity alone does not. |
| I14 | Camera craft concerns meaningful visual language and composition. | Final definitions; Sopranos camera calibration around 1235–1259. Explicit, high. | Judge what the images do, rather than awards or historical importance alone. |
| I15 | Spectacle includes unfamiliar systems and lives rendered visually, as well as fantasy scale. | Wire discussion around 1276; final definition. Explicit, high. | Avoid treating expensive effects as the only way to score well. |
| I16 | Ordinary domestic locations are roughly the five anchor for visual material, not automatically a one. | Early spectacle calibration around 26–28. Explicit, high at that stage. | Low spectacle requires a delivered-experience argument; “people in rooms” is insufficient alone. |
| I17 | Distinguish what is shown from how it is filmed. | Breaking Bad spectacle/camera discussion around 395; final definitions. Explicit, high. | A striking composition of an ordinary room and an elaborate environment are different strengths. |
| I18 | Conceptual density concerns multiple independent ideas meaningfully dramatised and interacting. | Final definition around 4058. Explicit, high. | A list of themes, emotional weight or symbolic interpretations does not by itself establish density. |
| I19 | Remove gravitas as a separate scored dimension and replace thematic resonance with conceptual density. | Seven-category change around 4068–4080. Documented in the direct exchange, high. | Do not quietly restore emotional seriousness under the density label. |
| I20 | Narrative drive allows quiet or slow material when it maintains purpose, tension or curiosity. | “Fly” discussion around 438; final definition. Explicit, high. | Test for stalling rather than equating slower pace with poorer craft. |
| I21 | Narrative path includes development of promises and earned payoffs throughout the run. | Final definition around 4062–4064. Explicit, high. | An excellent last scene alone does not settle the score if earlier promises were abandoned. |
| I22 | Intentional, coherent ambiguity is allowed. | Final path definition. Explicit, high. | Literal explanatory closure and artistic completion must remain distinct. |
| I23 | Severe path failure may coexist with strong other dimensions. | Saved 16 February 02:34 edit: Lost path 1, characters 9, drive 9.5. Documented, high. | Preserve differentiated judgments; do not turn ending disappointment into a blanket score reduction. |

## Weights, calculation and length

| ID | Reconstructed design | Evidence / confidence | Consequence |
|---|---|---|---|
| I24 | Initial agreed weights are 20/15/10/10/15/15/15. | Human correction around 4138 and agreement at 4161; all four saved exports. Explicit, high. | Preserve this as a named historical configuration. |
| I25 | Today's defaults are 25/15/5/5/15/15/20. | Current math; 16 February change history; later repair directive. Documented, high for current behaviour. | The later preference prioritises characters/payoff and reduces visual influence. Human approval provenance is incomplete in this recovered material. |
| I26 | The weights total 100. | Both coherent weight sets and current validation. Explicit/documented, high. | Superseded 105% tables must not be treated as a valid current formula. |
| I27 | Apply a weighted average, then optional length adjustment, then final rounding. | Master method and current implementation. Documented, high. | Do not add hidden normalisation or use stale prose totals. |
| I28 | Ordering should follow calculated scores. | Repeated sorting corrections around 3088 and 4035–4043. Explicit, high. | Fix an ordering defect as an ordering defect; do not rescore programmes to make a stale list look right. |
| I29 | Longer sustained quality has value and should receive graduated treatment. | Around 3689 and 3939–3949. Explicit, high. | The adjustment is intentional, but its effect needs to be visible. |
| I30 | A miniseries discount of 0.96 was accepted. | Around 3889 and 3934–3936. Explicit, high. | “Short complete work” and “unfinished short run” were conceptually distinct. |
| I31 | The original multiplier used a semantic miniseries category; the current implementation uses only count. | Original table vs current `episodeMultiplier(episodes)`. Verified difference, high. | A format field and an explicit policy are required to restore the original distinction. Do not claim the current count table exactly preserves it. |
| I32 | Personal preferences can change the ranking without changing the public editorial judgment. | Original site wording, saved weight/override exports and current model. Documented, high. | Keep baseline assessments, personal ratings and preference weights separate. |
| I33 | Identical rounded finals are ties in displayed score, even when ordinal positions differ. | Current comparator. Verified behaviour, high; original tie preference not fully established. | Explain the alphabetical ordering and avoid overinterpreting one-place differences. |

## Preservation, evidence and uncertainty

| ID | Reconstructed design | Evidence / confidence | Consequence |
|---|---|---|---|
| I34 | Preserve carefully calibrated work from accidental bulk changes. | Later restoration report and repeated foundation-lock directives. Inference of underlying purpose, high. | Version and protect ratings; ordinal positions should remain derived. |
| I35 | A strong review must support the same version of the assessment that supplies the score. | Request for reasons plus current mismatch audit. Inference, high. | Store evidence, ratings and scope together; do not maintain independent prose totals. |
| I36 | Identity confidence, artistic quality and viewer preference are different facts. | Original willingness to assess unseen work; observed premise failures. Recommended clarification, high practical value. | A provisional assessment should be marked provisional, rather than automatically given low artistic ratings. |
| I37 | Completion must be judged relative to promises and scope. | Original path definition; contradictory cancellation/ongoing treatment in reviews. Inference, high. | A cancelled self-contained season can have an earned payoff; ongoing work has unknown future resolution. |
| I38 | Compare dimensions before adjusting a disliked rank. | Deep calibration discussion and sorting failures. Explicit/inference, high. | Record a reason when an input changes; let the position follow. |
| I39 | Use historical material as provenance, not an instruction to run old automation. | Conflicting agent directives, old stored-final sorter and obsolete host paths. Audit boundary. | No archived maintenance, auto-publishing or rescore script was executed for this research. |
| I40 | Elegance means the smallest number of trustworthy moving parts. | Josh's current request for simplicity and maximum impact. Explicit, high. | One versioned assessment model, seven clear reasons and one calculator provide more value than another layer of rankings, prose or rules. |

## Recorded disagreements that require a deliberate future decision

These are design choices identified by the evidence, not unanswered questions blocking this report.

| Decision | Current situation | Suggested direction and reason |
|---|---|---|
| Default weighting | Later 25/15/5/5/15/15/20 configuration is operational and documented. | Preserve while documenting its history; avoid silently reverting to the earlier set. |
| Length preference | Enabled by default, count-only, capable of large rank changes. | Keep its effect separately visible and optional. Assess runtime/format treatment only as an explicit future revision. |
| Unfinished work | Some reviews use fixed low path scores, some seasonal completion, some N/A. | Define assessed scope and evaluate existing promises; distinguish unknown endpoint from observed failure. |
| Selected seasons | Some entries are whole runs and others selected runs, with leakage from excluded seasons. | Store exact scope as structured data; permit intentional separate recommendation units. |
| Eligibility | Original drama remit, later broader catalogue and conflicting bans. | Document the actual intended catalogue remit before applying blanket exclusions. |
| Protected foundation | 103-base snapshot with later differences; some directives freeze ranks. | Protect provenance and authored judgments, derive order from current settings. |
| Suspect reviews | Three already withheld; two further premise mismatches verified in this audit. | Triage identity and supporting assessment together; do not replace unsupported values with fresh guesses. |
| Sparse evidence | 196 main pages have three labelled reasons despite seven scored categories. | Add short concrete reasons for the missing dimensions from checked evidence. More prose is not inherently better evidence. |

The [main review](D:/DynamicRankEngine/docs/ranking-ledger/ranking-design-review.md) supplies the calculations, worked examples, quantified defects, coverage boundaries and proposed implementation sequence. The [per-show ledger](D:/DynamicRankEngine/docs/ranking-ledger/per-show-ledger.md) keeps the reconstruction tied to actual entries.
