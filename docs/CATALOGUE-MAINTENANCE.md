# Catalogue maintenance

Owner: the assistant working on Dynamic Rank Engine for Josh. Current editorial authority: [ASSESSMENTS.md](ASSESSMENTS.md). This procedure carries the same standard between sessions; it does not claim that research judgments are objective measurements.

## Coverage and dates

Use today's date in Pacific/Auckland and record the actual UTC check time. Discover new **live-action serialized narrative series and limited series**, including dramas with comedy, speculative or horror elements, across international releases. Prioritise substantive narrative work; exclude films, unscripted television, animation and chiefly case-of-the-week procedurals from new intake. Do not exclude or favour a country, religion, political message or presumed audience. Preserve existing out-of-scope records for provenance rather than silently deleting them.

Check official broadcaster/streamer slates, a cross-platform release calendar, international sources, and recent seasons of existing entries. Slates are leads, not proof of release. Confirm programme identity and dated episode records; no future release receives a score. A regional repeat is not a new world premiere. Record sources and uncovered areas explicitly. A finite source sweep cannot certify every television production worldwide.

Keep `catalogueCheckedThrough` separate from the recovered catalogue date and from each assessment's review date. `release` describes the known released run; `assessment.scope` describes what the score covers. Never increase a reviewed episode input until the expanded run has actually been reassessed. Show newer-season gaps beside the existing assessment. For an unscoped legacy entry, flag the missing scope instead of inferring it from its episode count.

## Assessment gate

Confirm the exact title/adaptation, original release date, seasons and episode count. Use broadcaster records for identity and availability where possible, and episode listings for counts. Attribute imported TVmaze metadata and its licence; its audience ratings are never imported.

Follow all seven definitions in ASSESSMENTS.md. Read independent criticism, recording **author, publication, scope and whether the ending was covered**. Two articles by the same author count as one critical perspective. Promotional interviews establish intention; they are not independent confirmation of execution. Include counterevidence and explain adjacent half-point boundaries. Exceptional claims require a dimension-specific comparison with a researched reference, not a target rank. Do not copy review text or convert star scores into dimension ratings.

New research assessments are visibly provisional. If identity is established but the seven scores cannot be defended, publish an honestly unranked entry with null ratings and a concrete next step. If the run is still airing, leave it pending or explicitly assess only a completed earlier season. Absence of evidence is not evidence for a low score. Do not mark an assessment completed simply to reduce the queue.

Each deliberate revision records before/after scope and inputs in the dated maintenance ledger; current explanations live only in the canonical catalogue. Preserve the frozen pre-improvement ledger. An initial new assessment starts at version 1 and has no fictional original review. Later scope/score revisions increment its version.

From 19 October, each version-2 maintenance manifest links the previous dated manifest with its canonical SHA-256 digest. Keep the cumulative intake list, identify this run's additions, and record each changed prior entry with its reason and exact before/after inputs. A pending-to-reviewed transition increments the assessment version; a released-count refresh for a still-pending entry cannot introduce a judgment. A second digest protects every otherwise unchanged catalogue record, excluding release metadata. Compute that digest from the predecessor, never from already edited data. Record release-count changes separately; refreshing release metadata does not change assessed scope. The validator checks this history as well as live/core parity.

## Release gate and repeat visits

1. Check Git status and remote revision. Read this file, ASSESSMENTS.md and the latest maintenance ledger. Resume unresolved intake rather than rediscovering it.
2. Research releases and completed seasons since the last discovery cutoff. Record not-yet-released candidates outside the live catalogue. No inferred release from an announcement alone.
3. Add or revise only evidence-supported records. Keep personal rating keys stable; no account or cloud-write testing on Josh's signed-in profile.
4. Update the maintenance manifest and dated report, including source gaps, pending assessments and why. Reconcile live/core inputs without resynchronizing obsolete batch scores.
5. Run `D:/node.exe --test scripts/*.test.js` (expand the glob in PowerShell), `D:/node.exe scripts/validate.js`, and inspect the diff for unintended scores, scope, artwork or policy changes. New entries must have identity provenance; ranked ones must pass the evidence gate.
6. Exercise new ranked and pending entries in a separate guest browser origin, including sources, formula, search and personal-rating round trips. Preserve the card layout.
7. Commit a bounded release and push normally to the existing Pages branch. Verify the Pages run, public hashes against Git blobs and visible live behavior. A successful push alone is not publication proof.

The weekly chat follow-up checks new releases and advances the oldest high-priority evidence gaps. It reports meaningful changes or blockers, and stays quiet when there is no actionable change. Keep the computer on and Codex running for local scheduled work. Do not silently create a separate task or change a person's ratings. Do not call a source sweep a complete critical reassessment of the catalogue.
