# Ranking design reading ledger

This ledger reconstructs the intended design from the original conversation, later methodology, review archive, historical score data and current calculation. Original conversation statements attributed to Josh take priority as evidence of intent; assistant proposals, subsequent agent summaries, editorial judgments and present implementation are distinct evidence classes.

The review is descriptive. It does not rescore shows, rewrite reviews, change the application or publish anything.

## Initial findings

- The original discussion opens with immersion as the central aim: television that feels real, consequential, meaningful and memorable.
- Josh explicitly defended five as average, six as good, seven as very good, eight as exceptional, nine as nearly perfect and ten as impossible to improve.
- Visual spectacle concerns the novelty and impact of what appears on screen. Familiar contemporary offices and homes start around five; craft belongs to a separate cinematography dimension.
- Josh's Kim Wexler example concerns internally motivated decisions, conflict and the viewer's uncertainty about a believable inner life. Merely being dramatic or extreme is not sufficient.
- Later documents introduce conflicting weights, including a 105% table; the current 100% formula matches the later repair directive.
- The early methodology rewards sustained quality, permits selected peak seasons, distinguishes intentional ambiguity from abandoned promises, and asks for comparison to established anchors.
- These are preliminary observations. Full coverage, quantitative results and a resolved design breakdown are recorded in the completed report.

## Original conversation: completed reading

All 4,610 lines of `_archived/old-archive/working-files/Entire Chat with Claude to Build Ranking System.txt` were read, including the portions lost in initially truncated outputs. Dates inside the conversation say January 4–6; the year is not explicit. Line numbers below refer to that file.

| Lines | Evidence of intended design |
| --- | --- |
| 5, 26–28 | Immersion is the motivating experience. Five means average, six good, seven very good, eight exceptional, nine almost perfect and ten impossible to improve. These are quality labels, not population percentiles. Ordinary contemporary surroundings can have excellent cinematography without exceptional spectacle. |
| 77–121 | Kim Wexler illustrates internal motivation, agency, ambiguity and coherent complexity. Josh accepts this explanation. Extreme behaviour alone is not depth. |
| 161, 236 | Existing ranks were unsatisfactory because the shows had not received enough thought. AI proposes assessments and Josh critiques them. |
| 333, 395, 438 | Breaking Bad world falls from eight to seven; spectacle falls from seven to six. Drive remains ten: a quiet episode can be an effective breath rather than a pacing failure. |
| 664, 918 | Live-action prestige drama, no documentaries. Include unseen shows: discovering what to watch is half the reason for the list. |
| 1235–1259, 1276 | Judge present viewing craft rather than reputation for its era. The Wire earns spectacle through exposure to unfamiliar lives and places, not lavish effects. |
| 1296, 1313, 1354 | Each number needs a short reason. Ensemble quality matters beyond two wonderful leads. Josh wants a consistent scale even when he personally dislikes a show. |
| 1760 | Peak seasons can be the recommendation unit. A viewer can stop after strong seasons; later decline should not automatically dilute that selected run. |
| 2296–2373, 2869–2916 | Calibration repeatedly overshoots. Josh asks for individual reasoning and permits decimal ratings such as 8.3 and 8.5, rather than crude whole-number corrections. |
| 3088, 4035–4043 | A misplaced Andor position triggered reassessment before the assistant eventually admitted the larger list had not been properly sorted. Arithmetic/order mistakes must not be repaired by changing editorial judgments. |
| 3380 | Game of Thrones establishes the demanding world-building anchor. A 9.5 needs evidence that it is genuinely close to that standard. |
| 3658–3742 | Josh challenges the arithmetic and crude length adjustment. Deliberately complete miniseries need different treatment from unfinished short series. |
| 3877–3949 | GoT's exceptional ensemble supports ten. Josh later accepts a 0.96 miniseries multiplier; ongoing 10–20 episode series receive 0.95. This is a distinction by format, not just count. |
| 4049–4064 | Josh personally supplies the new seven category definitions. Conceptual Density counts distinct, independently explored ideas. Narrative Path & Resolution tracks promises and earned closure; intentional ambiguity is allowed. |
| 4088–4161 | Josh delegates an initial weighting proposal, then explicitly changes World to 15 and Path to 15. The accepted seven weights are 20/15/10/10/15/15/15. Later defaults require separate provenance. |
| 4166–4494 | Early seven-category assessments distinguish selected seasons, cancellation, intentionally open endings and unfinished adaptations, but contain numerical errors. These are examples of judgments, not reliable current scores. |

## Evidence hierarchy and unresolved design distinctions

1. Direct statements by Josh establish intent. Explicit acceptance of a specific assistant proposal is also evidence, with its context retained.
2. Subsequent exported personal settings can establish a later preference; they do not automatically establish a universal editorial rule.
3. Agent instruction documents describe how agents were told to work. Some harden earlier suggestions into absolute rules and contradict each other.
4. Archived reviews and score records show what was actually assessed. Their programme facts and quotations are not independently verified by this audit.
5. Current code establishes current behaviour, including departures from intended semantics.

The original framework moves from eight dimensions to seven: scope is absorbed, gravitas is removed, old theme assessment becomes conceptual density, and promise/closure management becomes explicit. Emotional impact must not silently re-enter as a duplicate eighth category.

The intended product has three layers: identity and viewing scope; defensible editorial ratings; user preferences and deterministic ranking. A change in weights or the catalogue changes relative positions without proving the editorial ratings wrong.

The original accepted seven-category weights were 20/15/10/10/15/15/15. Several later documents print 25/15/5/5/15/15/25 (105%). The repair directive and current implementation use 25/15/5/5/15/15/20 (100%). These are separate historical versions, not one coherent formula.

Peak-season recommendations require all seven scores, episode counts and review commentary to cover the same selected run. The archive often fails this requirement. Format-aware miniseries treatment also disappeared: the current implementation treats every run of ten episodes or fewer as 0.96, and a twelve-episode miniseries as 0.95.

## Review coverage checkpoint

Reviews are numbered alphabetically by slug in `review-corpus.json`. Full visible prose, excluding navigation, scripts, styling and the modern archive notice, has been read for **1–20**. Initial truncation in batch 11–20 was recovered by reading 17 and 18 separately.

Findings in this block: 12 Monkeys versus 1899 illustrates closure versus cancellation. Alias S1–3 and Altered Carbon S1 mix selected-run labels with whole-run criticism. Three Body Problem and Andor contain high scores difficult to reconcile with later unproven-show caps. Annika demonstrates tension with the later procedural exclusion. Angel's intentionally open battle is described both as the point of the ending and as failure to end. Angels in America has unusually extensive seven-axis reasoning, while many shorter reviews explain only three of their seven grid scores. The latter also stretches spectacle into emotional acting, which risks double-counting characters. These observations concern consistency of the supplied evidence; they are not independent factual verification of the programmes.

Full reading now extends through **1–100**. Truncated outputs for 31–40 and 51–74 were recovered by separately reading 32–34 and 59–67. Use 4,300-word chunks thereafter to avoid truncation.

### Findings from reviews 21–100

- Atlanta, Bloodline and Better Call Saul receive review character tens inconsistent with the original ensemble anchors and current inputs. The Breaking Bad review uses 10/8/9/8/8/9/10, although the stored values are 9/7/10/6/9/10/10. In particular its drive nine contradicts Josh's explicit defense of ten. This is evidence of review/catalogue drift, not a reason to replace the catalogue.
- BEEF contains a full detailed assessment, a second seven-category block saying “Content to be added,” and a third summary using different scores. The two complete visible vectors differ. A fluent review can still be structurally unreliable.
- Billions, Boston Legal and Evil show weights adding to 105%. Other review templates show a 100% grid. These artifacts are from different scoring generations.
- Spectacle has a moving baseline: grounded domestic shows receive two or three in some reviews despite the original “ordinary settings about five” calibration. Emotional, conceptual or moral “spectacle” is repeatedly used as a substitute for visual spectacle, which blurs categories even when the assigned score is low.
- Dopesick's resolution seven is defended because the real opioid crisis remains unresolved. Extrapolations similarly treats the absence of a solution to climate change as a narrative-resolution limitation. A drama can resolve its own promises without solving the real social problem it depicts. These reviews expose a definition drift.
- The two Doctor Who reviews explicitly disagree about how an intentionally continuing series should be judged: five because it never ends, versus seven for completed eras. The programme scope and unit of closure need to be recorded.
- Counterpart says the story feels complete, then gives resolution six because it is not the planned ending. Enlightened gives eight despite cancellation because the ending works. Dollhouse also allows a cancelled series a completed ending. Cancellation is evidence to investigate, not a rating in itself.
- Archive 81, Carnivale and EZ Streets explicitly describe interrupted story promises; their resolution penalties have a clearer connection to the stated criterion.
- Reviews for Cross, Can This Love Be Translated? and Dinastía Casillas describe premises/casts that need identity verification. The already-withheld Esref's Dream review is about women's football. This audit has not independently fact-checked these additional cases and must not present their prose as verified facts.
- Escape at Dannemora's long review values deliberate immersion but treats absence of conventional thriller velocity as a limitation. Euphoria's long review more usefully distinguishes purposeful stillness from scenes lingering without narrative justification. That distinction matches Josh's “Fly” example.
- Historical importance (“invented modern television,” “ahead of its time”) repeatedly substitutes for evidence of present execution. Josh explicitly declined era-relative cinematography scoring in the source discussion.

### Historical exports and current audit

All four saved Josh exports (February 15–16) carry **20/15/10/10/15/15/15**, with 103 base shows and 3/2/50/3 overrides respectively. The foundation file is the last export. An archived agent briefing documents **20/15/15/10/15/15/10**, while the February 17 handoff documents **25/15/5/5/15/15/20**. The exact human decision that changed the defaults is not established merely by those agent-authored handoffs.

The briefing calls stored final scores approximate initial-sort values. The handoff says never recalculate them and use an authoritative master table instead. These incompatible maintenance instructions explain why inputs, totals and order evolved independently. `scripts/re-rank.js` simply sorts stored final numbers; it does not recompute them from seven ratings. It was read, not executed.

`scripts/audit-ranking-design.py` generates a numerical ledger through the actual application model, avoiding a second ranking implementation. Its preliminary extraction finds widespread category disagreement between review pages and catalogue records. Parser coverage and exceptional long-review layouts still need validation before final statistics are quoted. It also records every contribution, length effect, rank without length, rank under original weights, nearest neighbours, and archived evidence. Nothing is written back to production data.

Full reading extends through **1–156**, including every long review in this range. No truncated output remains unrecovered in this range.

### Findings from reviews 101–156

- The GoT S1–4 review prints contributions summing to **9.60**, then states **“normalized: 9.45”** without a defined normalization. Its camera nine and path 9.5 differ from the current eight and nine. This is a direct, visible example of a polished explanation being detached from its arithmetic. It also lists 2015 awards under an S1–4/2011–2014 scope, an internal time-scope mismatch.
- GoT S1–4 calls selected-season closure sufficient for a path 9.5. Heroes (S1) says its first season “resolves beautifully,” then assigns five because later seasons deteriorate. House of Cards S1–2 similarly says later decline does not retroactively damage those seasons while allowing it to temper the score. This asymmetry changes the ranking's meaning.
- From awards world nine and concepts eight for unexplained mysteries, while assigning path five because answers are pending. Unknownness is not yet evidence of coherent rules or distinct explored ideas; this risks rewarding a promise in two categories while penalizing its uncertainty in a third.
- For All Mankind and House of the Dragon allow high resolution scores for seasonal progress while other ongoing shows are capped or heavily penalized merely for continuing. The better generalizable test is promises due within the assessed run, with unfinished-series confidence tracked separately.
- Generation Kill and I May Destroy You explicitly value open-ended thematic resolution. These are useful counterexamples to reviews that require a social problem or traumatic experience to be solved.
- Godless contains all seven numbers but only “Content to be added” in the corresponding explanation blocks. Its summary lists both “perfectly paced” and slow middle episodes, without explaining the calibration. It cannot presently supply seven defensible category rationales.
- Grey's Anatomy, High Potential, Foyle's War, High Maintenance and other ongoing/episodic entries expose catalogue-scope drift from the later serialized-only charter. The original user's broader live-action prestige-drama instruction should not be silently replaced by an agent's narrower eligibility rule.
- Head Over Heels and Good Boy join the identity/premise verification queue. This is a concern raised by the archive, not a verified finding about their real plots.
- The programme page often cites recognizability, awards, budget, fame or cultural importance as proof of category merit. The original framework demands observable execution. Such context can support analysis but cannot substitute for the actual criterion.

Full reading now covers **1–228**. Mad Men's long review (193) was read separately to recover a truncated passage. No other gaps remain in this range.

### Findings from reviews 157–228

- In the Flesh calls itself complete in its introduction, then explains path five through cancellation. In Treatment and My So-Called Life assign spectacle one because they deliberately avoid visual scale, whereas Josh's ordinary-settings baseline was around five.
- Jessica Jones rates all 39 episodes but explains path eight with the first season's ending. Looking explicitly counts its concluding film; similar treatment is not consistently applied to Deadwood or Firefly. A viewing unit must specify any included film as well as seasons.
- Little America measures closure per anthology story; other continuing programmes receive lower scores merely for continuing. Normal People explicitly celebrates an open continuation at path nine. These useful examples support promise fulfillment within the assessed scope rather than mandatory finality.
- Lost's whole-run review and the original request to consider its good seasons are different recommendation units. Neither can silently stand in for the other.
- Maid treats the unfamiliar poverty/bureaucracy world as strong world-building but gives spectacle two. The user's Wire example awarded visual novelty for access to unseen social lives. This needs a consistent boundary, not automatic preference for expensive effects.
- Mad Men's long review contains five tens; the current catalogue contains none. Its highly confident prose is a different scoring version, not evidence that the catalogue should be replaced by those tens.
- Mr. Robot also receives a character ten in the review despite the original user's explicit concern about its high placement. Normal People's two-lead character ten exposes the difference between the original ensemble discussion and later hard cast-size caps.
- Murder One's conceptual-density rationale is television-format innovation, rather than distinct ideas dramatized within the story. This is a direct example of changing the measured property. Its grid also adds to 105%.
- Midnight Mass and many later entries use “Conceptual Depth.” Depth of one theme and density of distinct interacting ideas are related but different criteria.
- Memory of a Killer, Museum of Innocence, No One Will Miss Us and Murder One require identity/cast/premise verification. These are audit flags, not externally verified corrections. No cast, medical or historical assertion in a generated review is accepted merely because its prose sounds specific.
- A second repository review collection exists at `data/shows/html`: 140 shorter HTML pages, with different visible content from the main archive. They are being inventoried and read separately; the 457-page primary corpus does not by itself cover those versions.

At this checkpoint, full reading covered **1–363** in the primary corpus, with no outstanding truncation gaps.

### Findings from reviews 229–363

- Queer Eye is explicitly described as a reality makeover programme, with “acting” redefined as authenticity. This directly conflicts with the original live-action prestige-drama/no-documentary remit and demonstrates that the same seven labels do not guarantee comparable judgments across formats.
- Pachinko and Poker Face print resolution “N/A” while showing a numerical final and a 20% resolution weight. Missing information is distinct from a zero, an automatic six, or a judged seven. The review never explains what went into its arithmetic.
- Patrick Melrose and Rectify have detailed rationales and decimal scores such as 7.8/7.9/7.1. Their numbered/icon-based headings require parser support; they must not be classified as lacking explanations. Their prose also drifts from “exceptional” as the eight anchor to claims of extraordinary quality scored in the sevens.
- Rectify describes its final eight episodes as abbreviated compared with six earlier episodes, an internal inconsistency even without external television research. Detailed prose is not equivalent to checked facts.
- The 100 S1–5 says later seasons are excluded, then explicitly downgrades resolution because later seasons undercut the selected ending. Sherlock's two versions do the same. These are especially clear scope violations.
- Terriers gives a cancelled single season path nine for a satisfying complete arc. Reacher says each season resolves and “ending irrelevant” yet path six; Shetland says each story resolves yet path five. The distinction is editorially inconsistent, not an arithmetic issue.
- Silo gives spectacle four while praising a unique, fully constructed underground society. This illustrates the gap between Josh's visual novelty/immersion criterion and an action/effects-only reading. Small Axe and Station Eleven provide further tests of atmosphere and material visual worlds without expensive action.
- The Bureau's long review uses the archived visual-heavy weights 20/15/15/10/15/15/10, prints 7.48 from rounded contribution terms, and states multiplier 1.0 for 50 episodes. The current rule gives 1.02. It is useful history, not the current calculation.
- The Killing DK's long review declares the completed three-season story, then its footer says “4th announced.” Several series pages similarly combine projected episode counts with assessments written only for an earlier season. Assessment date and included episodes need to be explicit.
- Rome uses the dollar budget itself to justify spectacle ten. The Crown does the same with production cost and awards. Those are inputs/context, not evidence of the delivered visual result.
- The Leftovers calls intentional ambiguity perfect and awards resolution ten. This is a strong internal counterexample to treating explanatory certainty as a mandatory quality test. The original requirement was coherent, earned payoff.
- The I-Land is one of the few reviews using the lower half of the scale. The archive predominantly describes worthwhile selections; the observed concentration above five does not by itself prove inflation across television as a whole. Inflated review/category claims must be assessed against anchors and examples, not a forced bell curve.
- Pluribus, The Loyal Pin, Tales from the Loop, Stay Close and several other premises/casts enter the verification queue. Pluribus is described as an eight-futures anthology and The Loyal Pin as a male military-bodyguard romance; checking these against primary sources can establish whether the rationale describes the actual work.


Completion: all 457 main review bodies and all 140 short alternatives have now been read. See `reading-notes-continuation.md` and the final report for complete coverage and superseding quantitative results.
