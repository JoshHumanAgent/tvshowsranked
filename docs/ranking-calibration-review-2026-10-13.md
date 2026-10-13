# Critical ranking review — 13 October 2026

Historical snapshot, before Josh's subsequent clarification and the quality-only default. The findings below retain the former episode rule and ranks. The current [assessment standard and duration policy](ASSESSMENTS.md) record the resulting changes.

The calculator is working. The ordering is not yet supported well enough to present as a dependable hierarchy of television quality. The largest problems are the strength of the duration preference, missing assessment scopes, and legacy scores whose explanations do not establish the current values. Buffy at 13 is a useful symptom; simply lowering Buffy would leave those problems intact.

This audit uses the public defaults at commit `84c652d5e24c666d8f5276810e5456b5e0e2061e`: 439 ranked entries, weights 25/15/5/5/15/15/20, length adjustment enabled, no personal account overrides. The [complete numerical ledger](ranking-calibration-2026-10-13.json) records every entry, input hashes, evidence gaps, recovered edits and diagnostic comparisons. [The read-only audit script](../scripts/audit-ranking-calibration.js) reproduces it from a checkout. The earlier `ranking-ledger` remains a historical snapshot.

Coverage: every active record was recalculated and checked for scope, evidence coverage, archived-score differences and provenance in four recovered exports. The live website's catalogue and ranking-math file were fetched and their SHA-256 hashes matched the audited local files. The editorial investigation concentrated on the outliers discussed below, with targeted external criticism and official fact checks. This is not a claim to have watched all 439 programmes, or a completed reassessment of each one. Quality-only positions retain the existing, sometimes questionable, category ratings: they isolate the duration effect and are **not proposed replacement ranks**. All ranks are within this catalogue, not every show ever made.

## What the numbers establish

- All 50 existing tests pass, including comparison of all 442 preserved records with an independent exact-decimal oracle under both weight sets and both length settings. The site validator passes. Obsolete stored totals are not used by the calculator.
- Only 24 entries appear in both the current top 50 and the quality-only top 50. The mean absolute position change is 49.72 places; 51 entries move at least 100 places.
- A show over 100 episodes receives 1.06; an 11–20 episode show receives 0.95. That is an **11.58% relative advantage at identical category ratings**. Episode count cannot itself establish that quality was sustained.
- There are 958 pairs in which the lower-ranked show is equal or better in all seven dimensions, and strictly better in at least one. These are consequences of the separate duration preference, not arithmetic failures. For example, the current Tangerines vector meets or exceeds Buffy's in every dimension, but places 18th against Buffy's 13th. Tangerines is still a provisional research assessment, so this demonstrates the mechanism rather than proving either vector right.
- 286 of 439 weighted quality scores fall between 7 and 8 inclusive. Character ratings of 7, 7.5 or 8 cover 338 shows. This compression makes a relatively small duration adjustment move many positions. A curated catalogue need not have a normal distribution; compression is a calibration question, not proof scores should be forced downward.
- 364 shows share their displayed final score with at least one other entry. Within each tie the order is alphabetical. Buffy and Girls both display 8.24: positions 13 and 14 are not an established quality distinction.
- 434 records are legacy assessments with no current dimension reasons. Their historical review material remains available; this does not mean they have no commentary at all. 424 lack a named assessment scope. Of the 434 legacy entries, 414 have at least one disagreement between a current rating and the archived rating evidence. Five deliberate new assessments also differ from their archives, bringing the overall mismatch count to 419.

The old conversation explicitly requested a length preference, and later accepted a miniseries reduction. It would misrepresent that intent to call the whole adjustment a coding mistake. However, the present implementation uses episode count as a proxy for format: ten episodes get 0.96, eleven get 0.95, and twenty-one jump to 0.97. Those boundaries need a rationale. A completed twelve-episode story receives a bigger penalty than a ten-episode one simply because of its length.

## Buffy: my verdict

**I would not defend its current 13th position as a quality-only conclusion. I also would not dismiss Buffy as an obviously weak programme.** The existing inputs already put it 51st before the duration preference; that is the first and largest explanation for the apparently extraordinary placement.

| Dimension | Rating | Weight | Contribution |
| --- | ---: | ---: | ---: |
| Characters and acting | 8.5 | 25% | 2.125 |
| World building | 8 | 15% | 1.200 |
| Cinematography | 6.5 | 5% | 0.325 |
| Visual spectacle | 6 | 5% | 0.300 |
| Conceptual density | 7.5 | 15% | 1.125 |
| Narrative drive | 8 | 15% | 1.200 |
| Path and resolution | 7.5 | 20% | 1.500 |
| Weighted quality | | | **7.775** |
| After 144-episode multiplier | | × 1.06 | **8.24 rounded** |

Its archived character explanation offers iconic status and ensemble chemistry, but does not establish why the whole run deserves the current 8.5. Its conceptual explanation substitutes metaphor and influence for a demonstration of distinct interacting ideas. Its 8 for drive needs whole-run support, including weaker stretches, rather than a selection of outstanding episodes. There is no recovered override for Buffy in the four saved exports inspected; that absence does not prove who chose the scores.

There is a substantial positive case to preserve: the heroine's competing ordinary and supernatural obligations, evolving character relationships, and the final rejection of solitary chosen-one power provide material for these criteria. [Charlie Jane Anders's retrospective](https://www.wired.com/2017/03/buffy-the-vampire-slayer-20-years-later/) supplies specific support for that reading. Counterevidence matters too: Lucy Mangan argues that season seven overcrowds the ensemble and weakens established characters. [Her critique](https://www.theguardian.com/tv-and-radio/2017/mar/27/buffy-vampire-slayer-sarah-michelle-gellar) is a critical judgment, not an objective measurement.

Reassessment should test character agency, purposeful progression and earned payoff across the stated 144-episode run. Influence is not an eighth weighted criterion; age and genre are not faults. The evidence presently warrants a fresh assessment and scepticism about the length-driven placement, not an invented replacement score or a predetermined demotion.

## Highest-priority cases

“Quality rank” below means the same existing ratings with duration disabled for the whole catalogue. A large movement identifies a mechanism, not necessarily a bad show.

| Show | Current rank | Quality rank | Critical finding |
| --- | ---: | ---: | --- |
| Buffy the Vampire Slayer | 13 | 51 | Large duration lift; whole-run character and drive evidence is thin. |
| Shameless (US) | 19 | 107 | The explanation equates recurring crises with progression. Test whether consequences accumulate across the full 134 episodes. |
| Boston Legal | 21 | 112 | Two strong leads and fresh weekly cases do not alone establish exceptional ensemble work or drive across 101 episodes. |
| The Practice | 26 | 139 | The archive concedes later decline while the full 168 episodes earn the maximum bonus. Peak-era praise cannot justify the entire scope. |
| The Walking Dead | 34 | 177 | The strongest internal contradiction among these high placements: current drive 8 versus an archive describing repetition, pacing trouble and squandered storylines. |
| Dark | 43 | 15 | Much of the low placement is duration. Its current vector exactly matches a recovered saved edit. |
| The Leftovers | 44 | 18 | Already highly rated in quality; the short run pushes it down. Its vector also matches a saved edit. |
| Rectify | 50 | 19 | Duration matters. Drive 6 also needs a concrete stalling argument; quietness alone is not failure under this rubric. The old review is withheld. |
| Chernobyl | 53 | 14 | Mainly a format penalty, not a failure to rate its quality highly. Current ratings match a recovered edit. |
| Severance | 77 | 20 | Length penalty plus unreliable scope evidence: the prose largely supports season one while the count is nineteen episodes. |
| Andor | 82 | 21 | The record still has twelve episodes without a season-one label; the old prose says season two is forthcoming. Establish scope before rescoring. |
| Normal People | 163 | 71 | Characters are already 9. Low spectacle and duration do much of the work; investigate the spectacle 3 against the domestic-setting anchor. |
| Twin Peaks: The Return | 202 | 110 | Drive 5 is potentially defensible, but intentional delay needs separating from empty stalling. Its vector matches a saved edit. |
| Watchmen (2019) | 250 | 212 | Inputs, not just duration, explain the low place. They match a saved edit; conceptual density 7 deserves a comparison using actual dramatised ideas. |
| I May Destroy You | 276 | 213 | Character and world ratings need a clearer account of the ensemble and social environment; multiple perspectives are not just repetitions of one theme. |
| Fleabag | 369 | 348 | Strongest established-show candidate for underassessment: low character, camera and payoff ratings have no current supporting argument. |
| Fallout | 405 | 398 | Low even without the penalty; its current ratings are below every archived category rating, without replacement reasons. Scope is unnamed. |
| The Pitt | 419 | 424 | Length removal makes it slightly worse. The low inputs and first-season prose versus a thirty-episode count need examination. |

**The Walking Dead.** A drive score of 8 means exceptional purposeful progression under the intended scale. The existing review explicitly describes recurring survival cycles and a run that outstayed its welcome. The live drive score is also a point above the archived 7. That combination is a stronger reason to challenge a score than disliking the programme or consulting an external top-ten list. Reassess the entire selected run; retain deserved world-building credit independently. Its 177 episodes should not be used as evidence that those episodes sustain exceptional quality.

**Boston Legal, The Practice and Shameless.** These are not inherently unworthy because they are long, accessible or episodic. Standalone cases can pay off well, and recurring crises can reveal changed choices. Their current explanations do not show enough of that distinction. Boston Legal's “there is always a new argument” reasoning tests novelty, not necessarily progression. The Practice's early excellence versus later decline needs an explicit whole-run judgment. Shameless needs a comparison between consequential development and repeated reset. These are priority checks, not completed negative verdicts.

**Fleabag.** Characters 7.5, camera 6.5 and payoff 7.5 merit close scrutiny. The archived essay describes a revealing formal device and a deliberate ending, yet the live values are much lower than its numerical claims. External criticism provides specific evidence for character change, an ensemble gaining interiority, and a camera relationship that changes with the protagonist. [Alison Herman's season-two review](https://www.theringer.com/2019/05/20/tv/fleabag-season-2) supports that reassessment. My inference is that the current low placement is poorly defended by the evidence, not that the archive's 10s should be restored. A concentrated domestic world can fairly score below an expansive institutional one. Spectacle 3 nevertheless needs an explanation against the user's ordinary-rooms anchor near 5. Formal novelty should not automatically earn the same bonus in several dimensions.

**The Pitt.** The archive describes triage, imaging, surgery, psychiatry and social work as a specific interacting institution, yet the current world score is 6. It describes cumulative time pressure and gives drive 8; the live drive is 6.5. It calls the first shift a complete arc, while the record now counts thirty episodes. Those are concrete calibration and coverage problems. Functional documentary-style photography is not automatically weak photography: judge what framing and movement communicate. A hospital's unfamiliar processes can count as visual spectacle under the user's definition. This is a high-priority potential underassessment, without assuming acclaim must translate into a nine.

**Fallout.** The archive's specific world and design claims offer a route to testing world 7 and spectacle 7, but faithfulness to a game is not sufficient proof of either. Judge whether institutions and rules make sense on screen and whether the displayed world earns the points. A season can fulfil major promises while leaving the series open. The next assessment must identify which episodes it covers and account for both achievements and failures; neither the glowing archive nor the current low vector is self-validating.

**I May Destroy You and Watchmen.** A tightly focused subject can contain several independent questions. For the former, distinguish memory and self-narration, different boundaries of consent, friendship obligations and mediated public judgment, and then test their interaction. [Judy Berman's review](https://time.com/5844881/i-may-destroy-you-hbo-review/) gives concrete examples across the three central characters. For Watchmen, the [Peabody citation](https://peabodyawards.com/award-profile/watchmen/) identifies the integration of racial history, authority, masked identity and public memory. These support checking the relevant dimensions; an award does not supply a numeric score, and thematic seriousness is not itself conceptual density.

## Do not mistake recovered preferences for automation errors

The four saved exports contain overrides for 52 active shows. Forty-one current vectors exactly match the latest recovered override for that title; eleven differ in one or more dimensions. These are provenance findings, not proof of correctness or proof of who operated the sliders. Absence from the exports does not prove an AI invented the rating.

Girls at 14 deserves discussion, but its current vector exactly matches a saved edit. So do Chernobyl, Dark, The Leftovers, Watchmen, True Detective S1 and Lost. Overwriting them merely because a critic would order the shows differently would discard relevant design history. Girls has a quality-only position of 26 and a 62-episode bonus; its high placement is not just a maximal-length anomaly. If drive 8.5 is challenged, the argument must concern its actual progression, not dislike of its characters.

Lost's payoff 1 is a particularly severe judgment, but it is explicitly present in a recovered override alongside strong character and drive ratings. Do not silently “repair” that one to match a consensus. Conversely, provenance should not prevent a reasoned reassessment: an unusually severe or generous judgment still needs to satisfy the same rubric.

The current weights also express a real preference: characters plus path/payoff total 45%, while camera plus spectacle total 10%. Historically those pairs totalled 35% and 20%. Visually extraordinary television can legitimately fare less well under the current weights. Raising visual scores solely to compensate would distort the inputs instead of honestly changing the preference.

## Scope and factual reliability need repair

- **Andor:** the official account of the [season-two finale](https://www.starwars.com/news/andor-season-2-finale-episodes-10-11-12) confirms the final episodes were available in May 2025. A twelve-episode record can be legitimate as a season-one assessment, but the current label does not say that. Choose the assessed run explicitly; do not simply update the count while retaining reasons for a different run.
- **Severance:** the archive labels its second-season finale “Who Is Alive” with a “To be determined” note. Apple's [episode listing](https://www.apple.com/uk/tv-pr/originals/severance/episodes-images/) identifies it as “Cold Harbor.” That placeholder cannot support a completed nineteen-episode review. Conceptual density 9.5 also needs evidence of interacting ideas, not just an exciting premise and unanswered questions. An ongoing story is not automatically bad at payoff.
- **Chernobyl:** the archive's claim that it won every Emmy for which it was nominated is false: the [Television Academy](https://www.televisionacademy.com/shows/chernobyl) lists 19 nominations and 10 wins. This is a reliability check, not a reason to lower its artistic score.
- **I May Destroy You:** the archive says Emmy voters ignored Coel; the [Television Academy's programme record](https://www.televisionacademy.com/shows/i-may-destroy-you) lists two wins, including writing for Coel. Again, factual errors disqualify that sentence as evidence, not the programme as art.
- **Game of Thrones:** the top entry explicitly covers seasons 1–4. Do not penalise it for season eight. But comparing a selected peak run with Buffy's complete run answers a different question from ranking complete series. Keep the scope visible and apply the same assessment policy to all selected runs.
- **Twin Peaks:** the existing evidence register records that some whole-run prose includes The Return while The Return also has a separate entry. These units need clear boundaries before comparisons are meaningful.

## What I would change first

1. Reassess Buffy, The Walking Dead and Fleabag together against the same anchors. They expose three different failures: a duration-driven placement, an apparently inflated drive score and a potentially suppressed craft assessment. Include one strong reference assessment such as Breaking Bad to keep the scale consistent.
2. Establish exact scopes and rebuild evidence for Andor, Severance and The Pitt. Then handle Fallout and I May Destroy You. An episode count or an ending score should never silently refer to a different run from the review.
3. Review Boston Legal, The Practice and Shameless as whole-run assessments, explicitly balancing peaks, repetition and consequences. Check Girls and Watchmen with awareness of their saved provenance, rather than presuming those unusual judgments are mistakes.
4. Make quality and duration preference distinct in interpretation. For a ranking presented as television quality, I favour the weighted quality score as the main order, with duration an explicit optional preference. The existing toggle already permits the diagnostic comparison. Because the historical length preference was deliberate, this audit does not silently replace it. If it stays central, fix the non-monotonic short-run boundary and justify the scale before choosing a new curve.
5. Require each changed dimension to state evidence, a limitation and why the adjacent half-point would be too high or too low. Use five as average, six as good, seven as very good, eight as exceptional, nine as almost perfect and ten as effectively unimprovable. Do not spread scores artificially or award every good show an eight. Missing evidence is uncertainty to disclose, not an automatic deduction from artistic quality.

Only the diagnostic script and these audit documents were added. Live scores, account preferences, the production site and the historical ledger were not changed. The next scoring pass should produce seven justified ratings per named run; rank should then be a consequence, never the target used to reverse-engineer the ratings.
