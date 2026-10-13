/* Small static client: model, presentation, and acknowledged account persistence. */
(() => {
    'use strict';
    const $ = id => document.getElementById(id);
    const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
    const cats = RankingState.CATEGORIES;
    const eraLabels = { last3mo:'Last 3 months', last6mo:'Last 6 months', thisYear:'This year', '2020s':'2020s', '2010s':'2010s', '2000s':'2000s', pre2000:'Before 2000' };
    const GUEST_KEY = 'dre:guest:v1';
    let model, catalogueDate = '', query = '', onlyPinned = false, limit = 30, openSlug = null;
    let currentUser = null, auth = null, db = null, authResolved = false, sync = null, syncState = '';
    let registering = false, toastTimer, undoSnapshot = null, routing = false, sdkUnavailable = false, editingRatings = false;
    const reviewCache = new Map();
    const points = number => Number(number.toFixed(4)).toString();
    const multiplierText = number => Number(number.toFixed(5)).toString();
    const scoreText = show => show.pending ? 'Awaiting assessment' : show.final.toFixed(2);
    const rankText = show => show.pending ? 'Not ranked' : 'Rank ' + show.rank;
    // Preserve the original medal scale, with brighter colours for the dark surface.
    const ratingColor = score => score === 10 ? '#f0c554' : score >= 9 ? '#cbd3e1' : score >= 8 ? '#d39b62' : score >= 7 ? '#c98350' : score >= 6 ? '#d76c73' : score >= 5 ? '#bd7988' : '#a87585';

    function toast(message) {
        $('toast').textContent = message; $('toast').hidden = false;
        clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 5000);
    }
    function readLocal(key) {
        try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : null; }
        catch { return null; }
    }
    function writeLocal(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); return true; }
        catch { $('storage-note').textContent = 'Browser storage is unavailable. Download a backup to keep your changes.'; return false; }
    }
    function on(id, event, action) {
        $(id).addEventListener(event, async e => {
            try { await action(e); } catch (error) { toast(error.message || 'Something went wrong. Please try again.'); }
        });
    }
    function editable() { return !!model && authResolved && (!currentUser || sync?.ready); }
    function editingAvailability() { document.querySelectorAll('[data-edit]').forEach(el => { el.disabled = !editable(); }); }
    function persist() {
        if (!editable()) return;
        if (currentUser) sync.changed();
        else if (!writeLocal(GUEST_KEY, model.snapshot())) toast('Changes are in this tab only. Download a backup to keep them.');
        updateLibrary();
    }
    function safePoster(url, size = 'w185') {
        try {
            const parsed = new URL(url);
            if (parsed.protocol === 'https:' && parsed.hostname === 'image.tmdb.org') return parsed.href.replace(/\/(?:w\d+|original)\//, '/' + size + '/');
            if (parsed.protocol === 'https:' && parsed.hostname === 'static.tvmaze.com' && parsed.pathname.startsWith('/uploads/images/')) return parsed.href;
        } catch {}
        return 'assets/film-reel.svg';
    }
    function openDialog(id) {
        const dialog = $(id);
        if (!dialog.open) dialog.showModal();
    }
    document.querySelectorAll('dialog').forEach(dialog => {
        dialog.addEventListener('click', event => {
            if (event.target.closest('[data-close]')) dialog.close();
            else if (event.target === dialog) {
                const bounds = dialog.getBoundingClientRect();
                if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
            }
        });
    });
    document.addEventListener('error', event => {
        if (event.target instanceof HTMLImageElement && !event.target.dataset.fallback) {
            event.target.closest('picture')?.querySelectorAll('source').forEach(source => source.remove());
            event.target.dataset.fallback = 'true'; event.target.src = 'assets/film-reel.svg';
        }
    }, true);

    function renderFilters() {
        const p = model.prefs;
        $('genre-filters').innerHTML = ['all', ...model.genres].map(g => `<button class="chip" data-genre="${escape(g)}" aria-pressed="${p.currentGenres.includes(g)}">${g === 'all' ? 'All genres' : escape(g)}</button>`).join('');
        $('era-filters').innerHTML = `<button class="chip" data-era="all" aria-pressed="${!p.currentEras.length}">Any time</button>` + Object.entries(eraLabels).map(([key,label]) => `<button class="chip" data-era="${key}" aria-pressed="${p.currentEras.includes(key)}">${label}</button>`).join('');
        $('sort-select').value = p.sortBy === 'score-desc' ? 'rank' : p.sortBy;
        $('filters-content').hidden = p.filtersCollapsed;
        $('filters-toggle').setAttribute('aria-expanded', String(!p.filtersCollapsed));
        renderWeights(); editingAvailability();
    }
    function renderWeights() {
        $('weight-sliders').innerHTML = '<legend class="sr-only">Category importance</legend>' + cats.map(c => `<div class="range-row"><label for="weight-${c.key}">${c.name}</label><output for="weight-${c.key}" id="weight-value-${c.key}">${model.prefs.weights[c.key]}%</output><input id="weight-${c.key}" data-weight="${c.key}" type="range" min="0" max="100" step="any" value="${model.prefs.weights[c.key]}"></div>`).join('');
        $('multiplier-toggle').checked = model.prefs.multiplierEnabled;
    }
    function updateWeightValues() {
        for (const c of cats) {
            $('weight-' + c.key).value = model.prefs.weights[c.key];
            $('weight-value-' + c.key).textContent = model.prefs.weights[c.key] + '%';
        }
    }
    function renderList() {
        if (!model) return;
        const focused = document.activeElement;
        const focusSlug = focused?.closest('.show-card')?.dataset.slug;
        const focusAction = focused?.dataset.cardAction;
        const results = model.results({ query, onlyPinned }), shown = results.slice(0, limit);
        $('rankings').innerHTML = shown.map((show, index) => {
            const personal = Object.hasOwn(model.prefs.scoreOverrides, show.title);
            const pinned = model.prefs.pinnedShows.includes(show.title);
            const breakdown = show.pending ? null : RankingMath.breakdown(show, model.prefs.weights, model.prefs.multiplierEnabled);
            return `<article class="show-card" data-slug="${show.slug}" data-top="${!show.pending && show.rank <= 3}" aria-labelledby="card-title-${show.slug}">
                <a class="card-media" href="#show=${show.slug}" data-show="${show.slug}" data-card-action="poster" aria-label="View ${escape(show.title)}, ${rankText(show).toLowerCase()}">
                    <picture><source media="(max-width: 800px)" srcset="${escape(safePoster(show.backdrop || show.poster,'w780'))}"><img class="card-poster" src="${escape(safePoster(show.poster,'w500'))}" alt="" width="200" height="300" loading="${index < 2 ? 'eager' : 'lazy'}" decoding="async"></picture>
                    <span class="card-rank"><span>${show.pending ? 'Awaiting assessment' : 'Rank'}</span><strong>${show.pending ? '—' : String(show.rank).padStart(2,'0')}</strong></span>
                </a>
                <div class="card-body">
                    <div class="card-heading"><div class="show-main"><h2 class="card-title" id="card-title-${show.slug}"><a class="show-title" href="#show=${show.slug}" data-show="${show.slug}" data-card-action="title">${escape(show.title)}</a></h2><div class="show-meta"><span>${show.year}</span><span>${show.episodes} episodes</span>${personal && !show.pending ? '<span class="personal-label">Your ratings</span>' : ''}</div></div>
                        <button class="score-button" data-show="${show.slug}" data-card-action="score" aria-label="${show.pending ? 'View assessment status for' : 'Explain score for'} ${escape(show.title)}${show.pending ? '' : ', ' + scoreText(show)}"><span class="score-number">${show.pending ? '—' : scoreText(show)}</span><span class="score-caption">${show.pending ? 'View status' : 'Score & review ↗'}</span></button>
                    </div>
                    <div class="card-genres" aria-label="Genres">${show.genres.map(g => '<span>' + escape(g) + '</span>').join('')}</div>
                    ${show.pending ? '<p class="card-pending">' + (show.assessment?.origin === 'new' ? 'New to the catalogue · awaiting a supported assessment. No score or rank has been assigned.' : 'A fresh assessment is needed. The old ratings are preserved but do not determine a score or rank.') + '</p>' : `<div class="card-ratings-heading"><span>Seven dimensions</span><span>Ratings / 10</span></div><dl class="card-ratings">${cats.map(c => `<div class="card-rating" data-category="${c.key}" style="--rating-color:${ratingColor(show[c.key])}"><dt id="rating-${show.slug}-${c.key}">${c.name}</dt><dd><span class="card-bar" role="meter" aria-labelledby="rating-${show.slug}-${c.key}" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${show[c.key]}"><span class="card-bar-fill" style="width:${show[c.key] * 10}%"></span></span><span class="card-rating-value" aria-hidden="true">${show[c.key]}</span></dd></div>`).join('')}</dl>`}
                    <div class="card-footer"><div>${breakdown ? `<p class="card-calculation">${points(breakdown.weighted)} quality <span>× ${multiplierText(breakdown.multiplier)} ${model.prefs.multiplierEnabled ? 'length' : 'length off'}</span></p>` : ''}${show.assessment?.provisional ? '<p class="card-assessment-note">Research assessment · provisional</p>' : ''}</div><button class="card-pin" data-pin="${show.slug}" data-card-action="pin" data-edit aria-label="${pinned ? 'Remove' : 'Add'} ${escape(show.title)} ${pinned ? 'from' : 'to'} shortlist" aria-pressed="${pinned}"><span aria-hidden="true">${pinned ? '★' : '☆'}</span> ${pinned ? 'Shortlisted' : 'Shortlist'}</button></div>
                </div>
            </article>`;
        }).join('');
        $('results-count').textContent = `${shown.length} of ${results.length} ${results.length === 1 ? 'show' : 'shows'}${results.length !== model.shows.length ? ' · ' + model.shows.length + ' in catalogue' : ''}`;
        $('list-label').textContent = onlyPinned ? 'Your shortlist' : currentUser || model.modifiedCount ? 'Your rankings' : 'The rankings';
        $('ranking-context').textContent = `${model.ranked.length} ranked · ${model.pending.length} awaiting assessment · ${model.prefs.multiplierEnabled ? 'Small length bonus on' : 'Quality scores only'}`;
        $('empty-state').hidden = results.length > 0;
        $('load-more').hidden = shown.length >= results.length;
        $('load-more').textContent = `Show ${Math.min(30, results.length - shown.length)} more`;
        const pinnedCount = model.shows.filter(s => model.prefs.pinnedShows.includes(s.title)).length;
        $('shortlist-count').textContent = pinnedCount;
        $('shortlist-toggle').setAttribute('aria-pressed', String(onlyPinned));
        $('compare-shortlist').hidden = !onlyPinned || pinnedCount < 2;
        $('search-clear').hidden = !query;
        const filters = [...model.prefs.currentEras.map(value => ({ type:'era', value, label:eraLabels[value] })),
            ...model.prefs.currentGenres.filter(g => g !== 'all').map(value => ({ type:'genre', value, label:value }))];
        $('filter-count').hidden = !filters.length; $('filter-count').textContent = filters.length;
        if (query) filters.push({ type:'query', value:query, label:'“' + query + '”' });
        // Escape text and attributes; user search is never executable markup.
        $('active-filters').innerHTML = filters.map(f => `<button data-remove-filter="${f.type}" data-value="${escape(f.value)}" aria-label="Remove ${escape(f.label)} filter">${escape(f.label)} <span aria-hidden="true">×</span></button>`).join('');
        editingAvailability();
        if (focusSlug && focusAction) $('rankings').querySelector(`[data-slug="${focusSlug}"] [data-card-action="${focusAction}"]`)?.focus({ preventScroll:true });
    }
    function renderAll() { renderFilters(); renderList(); updateLibrary(); if (openSlug) renderDetail(openSlug); }
    function updateLibrary() {
        if (!model) return;
        const pendingEdits = model.pending.filter(s => Object.hasOwn(model.prefs.scoreOverrides,s.title)).length;
        $('modified-count').textContent = `${model.modifiedCount} ${model.modifiedCount === 1 ? 'show has' : 'shows have'} personal ratings.${pendingEdits ? ' Includes ' + pendingEdits + ' awaiting reassessment; their saved inputs are preserved.' : ''}`;
    }
    function setFormulaPanel(open) {
        $('weights-content').hidden = !open;
        $('weights-toggle').setAttribute('aria-expanded', String(open));
    }
    on('open-weights', 'click', () => { setFormulaPanel(true); $('weights-content').scrollIntoView({ block:'nearest' }); });
    on('weights-toggle', 'click', () => setFormulaPanel($('weights-content').hidden));
    on('filters-toggle', 'click', () => {
        if (!model) return;
        model.prefs.filtersCollapsed = !model.prefs.filtersCollapsed;
        $('filters-content').hidden = model.prefs.filtersCollapsed;
        $('filters-toggle').setAttribute('aria-expanded', String(!model.prefs.filtersCollapsed)); persist();
    });
    on('weight-sliders', 'input', event => {
        if (!editable() || !event.target.dataset.weight) return;
        model.setWeight(event.target.dataset.weight, Math.round(Number(event.target.value)));
        updateWeightValues(); renderList(); persist();
    });
    on('reset-weights', 'click', () => {
        if (!editable()) return;
        model.prefs.weights = { ...RankingMath.DEFAULT_WEIGHTS }; model.recalculate(); updateWeightValues(); renderList(); persist();
    });
    on('multiplier-toggle', 'change', event => {
        if (!editable()) return;
        model.prefs.multiplierEnabled = event.target.checked; model.recalculate(); renderList(); persist();
    });
    on('search','input',event => { query = event.target.value; limit = 30; renderList(); });
    on('search-clear','click',() => { query = ''; $('search').value = ''; limit = 30; renderList(); $('search').focus(); });
    on('shortlist-toggle','click',() => { onlyPinned = !onlyPinned; limit = 30; renderList(); });
    on('load-more','click',() => {
        const firstNew = model.results({query,onlyPinned})[limit]?.slug;
        limit += 30; renderList();
        if (firstNew) $('rankings').querySelector(`[data-slug="${firstNew}"] .show-title`)?.focus({ preventScroll:true });
    });
    on('sort-select','change',event => { if (!editable()) return; model.prefs.sortBy = event.target.value; limit = 30; renderList(); persist(); });
    function clearFilters(clearQuery = false) {
        if (!model) return;
        model.prefs.currentGenres = ['all']; model.prefs.currentEras = [];
        if (clearQuery) { query = ''; onlyPinned = false; $('search').value = ''; }
        limit = 30; renderAll(); persist();
    }
    on('clear-filters','click',() => clearFilters());
    on('empty-reset','click',() => clearFilters(true));
    document.addEventListener('click', event => {
        const showLink = event.target.closest('[data-show]');
        if (showLink && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
            event.preventDefault(); openShow(showLink.dataset.show); return;
        }
        const pin = event.target.closest('[data-pin]');
        if (pin && editable()) {
            const show = model.bySlug.get(pin.dataset.pin), pins = model.prefs.pinnedShows;
            model.prefs.pinnedShows = pins.includes(show.title) ? pins.filter(t => t !== show.title) : [...pins, show.title];
            renderList(); if (openSlug) updateDetailValues(); persist(); return;
        }
        const genre = event.target.closest('[data-genre]'), era = event.target.closest('[data-era]'), remove = event.target.closest('[data-remove-filter]');
        if (remove?.dataset.removeFilter === 'query') { query = ''; $('search').value = ''; limit = 30; renderList(); return; }
        if (!editable() || (!genre && !era && !remove)) return;
        const type = genre ? 'genre' : era ? 'era' : remove.dataset.removeFilter;
        const value = genre?.dataset.genre ?? era?.dataset.era ?? remove?.dataset.value;
        const key = type === 'genre' ? 'currentGenres' : 'currentEras';
        let selected = model.prefs[key].filter(v => v !== 'all');
        selected = value === 'all' ? [] : selected.includes(value) ? selected.filter(v => v !== value) : [...selected,value];
        model.prefs[key] = type === 'genre' && !selected.length ? ['all'] : selected;
        limit = 30; renderAll(); persist();
    });

    function assessmentNote(show, key) {
        const baseline = model.base.get(show.title), dimension = baseline.assessment?.dimensions[key];
        const review = baseline.assessment?.review;
        if (dimension?.reason) return `<p>${escape(dimension.reason)}</p>${dimension.evidenceNote ? '<p class="evidence-note">' + escape(dimension.evidenceNote) + '</p>' : ''}<p class="evidence-note">Supports the ${baseline.assessment.basis === 'research' ? 'research' : 'starting'} rating of ${baseline[key]}. Your edits are personal judgments.</p>${dimension.sourceRefs?.length ? '<p class="evidence-note">Evidence: ' + sourceLinks(baseline.assessment,dimension.sourceRefs) + '</p>' : ''}`;
        if (review?.status === 'withheld') return '<p class="evidence-note">The archived note is withheld because its programme details need checking. This starting rating has not yet been reassessed.</p>';
        const archive = dimension?.archive;
        if (!archive?.excerpt) return '<p class="evidence-note">No supporting note was recorded for this dimension. The recovered starting rating is preserved; a new explanation is still needed.</p>';
        const values = archive.ratings || [];
        const label = values.length === 1 ? 'Archived rating ' + values[0] : values.length > 1 ? 'Conflicting archived ratings: ' + values.join(' / ') : 'Archived rating not recorded';
        const agrees = values.length === 1 && values[0] === baseline[key];
        return `<p class="evidence-label">${escape(label)} · starting rating ${baseline[key]}</p><blockquote class="evidence-quote">${escape(archive.excerpt)}</blockquote><p class="evidence-note">${agrees ? 'The number matches, but this historical explanation has not been reverified.' : 'This note has not been reconciled with the starting rating. It is not a verified reason for the current score.'}</p>`;
    }
    function sourceLinks(assessment, ids) {
        return (assessment?.sources || []).filter(s => ids.includes(s.id))
            .map(s => `<a class="text-link" href="${escape(s.url)}" target="_blank" rel="noopener">${escape(s.title)} ↗</a>`).join(' · ');
    }
    function reviewSources(show) {
        if (show.assessment?.sources?.length) return '<ul class="assessment-sources">' + show.assessment.sources.map(s => `<li>${sourceLinks(show.assessment,[s.id])}<span>${s.author ? escape(s.author) + ' · ' : ''}${escape(s.coverage)}</span></li>`).join('') + '</ul>';
        return (show.assessment?.review.sources || []).filter(url => { try { return new URL(url).protocol === 'https:'; } catch { return false; } })
            .map(url => `<a class="text-link" href="${escape(url)}" target="_blank" rel="noopener">Programme source ↗</a>`).join(' ');
    }
    function releaseNote(show) {
        const r = show.release;
        if (!r) return '';
        const seasons = r.seasons.map(s => 'S' + s.season + ': ' + s.episodes).join(' · ');
        const gap = RankingState.releaseGap(show);
        return `<p class="evidence-note release-coverage">Release check ${escape(r.checkedThrough)} · ${r.episodes} listed episodes (${escape(seasons)}). ${gap === 'newer' ? '<strong>Newer episodes are outside this score’s assessed scope.</strong>' : gap === 'unscoped' ? 'The legacy score’s season cutoff still needs verification.' : gap === 'pending' ? 'These release counts do not constitute an assessment.' : 'The assessed run matches the listed releases.'}${r.scheduledEpisodesRemaining ? ' More episodes are scheduled.' : ''} <a class="text-link" href="${escape(r.source)}" target="_blank" rel="noopener">${escape(r.sourceName || 'TVmaze')} ↗</a></p>`;
    }
    function renderDetail(slug) {
        const show = model.bySlug.get(slug);
        if (!show) return;
        const assessment = show.assessment, scope = assessment?.scope, reviewed = assessment?.status === 'reviewed';
        const openIssues = assessment?.issues?.filter(issue => issue.status !== 'resolved') || [];
        const scopeEvidence = reviewed
            ? `<p>${escape(scope.label)}. ${escape(scope.episodeBasis)}.</p><p>Assessed ${escape(assessment.reviewedAt)} against the seven-dimension rubric. ${escape(assessment.limitations)}</p><p>Sources support the facts and interpretation; the numerical judgments are this site's. Other catalogue entries may still carry unreassessed legacy ratings.</p>`
            : `<p>${scope?.status === 'named' ? escape(scope.label) + ' only. Material from later seasons must not affect these ratings.' : 'The original ratings did not record an exact season cutoff. The episode count is retained as catalogue metadata; it does not establish which seasons were actually assessed.'}</p><p>Ratings were recovered from the ${escape(assessment?.catalogueAsOf || 'undated')} catalogue. Evidence was organised on ${escape(assessment?.evidenceCheckedAt || 'an unrecorded date')}; this does not mean every review claim was verified.</p>`;
        const heading = `<div class="detail-heading"><img class="poster" src="${escape(safePoster(show.poster))}" alt="" width="80" height="115"><div><h2 id="show-title">${escape(show.title)}</h2><div class="show-meta"><span>${show.year}</span><span>${show.episodes} ${show.pending ? 'listed ' : ''}episodes</span><span id="detail-rank">${rankText(show)}</span></div><p class="scope-label">${escape(scope?.label || 'Recorded episode run')}</p></div></div>${releaseNote(show)}`;
        if (show.pending) {
            const isNew = assessment?.origin === 'new';
            $('show-detail-body').innerHTML = `${heading}<div class="pending-assessment"><p class="eyebrow">Awaiting assessment</p><h3>A missing assessment is not a low score.</h3><p>${isNew ? 'The release has been catalogued. Its seven dimensions have not yet been assessed with sufficient evidence, so it has no score or rank.' : 'The original review described the wrong programme. Its ratings are preserved in the archive, but they no longer determine a score or rank.'}</p><p>${escape(assessment?.nextAction || assessment?.review.note || 'A fresh assessment of the correct programme is needed.')}</p>${reviewSources(show)}</div><p class="small muted">${isNew ? 'You can shortlist this show while its assessment is pending.' : 'Any previously saved personal ratings are still in your backup.'} Rating edits become available once a supported assessment is published.</p><button class="quiet-button" id="detail-pin" data-pin="${slug}" data-edit></button>`;
            updateDetailValues(); editingAvailability(); return;
        }
        $('show-detail-body').innerHTML = `${heading}
            ${reviewed ? `<div class="assessment-intro"><p class="eyebrow">${assessment.basis === 'research' ? 'Research assessment' : 'Viewing assessment'}${assessment.provisional ? ' · provisional' : ''}</p><p>${escape(assessment.summary)}</p>${assessment.basis === 'research' ? '<p class="evidence-note">Based on published sources. The complete assessed run was not watched for this review.</p>' : ''}</div>` : ''}
            <div class="detail-total"><div><p class="eyebrow" id="detail-score-label">Your current score</p><p id="detail-calculation"></p></div><strong id="detail-score" aria-live="polite">${show.final.toFixed(2)}</strong></div>
            <div class="rank-explanation"><p id="detail-length-effect"></p><p class="small muted" id="detail-rank-context"></p></div>
            <div class="assessment-heading"><h3>Seven dimensions</h3><button class="text-button" id="adjust-ratings" aria-pressed="${editingRatings}" data-edit>${editingRatings ? 'Done editing' : 'Adjust my ratings'}</button></div>
            <p class="small muted dimension-help">Ratings out of 10 · weighted points. Expand a dimension for notes (spoilers).</p>
            <div class="score-editor" id="score-editor">${cats.map(c => `<section class="dimension-row"><details class="dimension" id="dimension-${c.key}"><summary><span class="dimension-title">${c.name}<span class="dimension-note" id="detail-weight-${c.key}">${model.prefs.weights[c.key]}%</span></span><span class="dimension-rating" id="score-value-${c.key}">${show[c.key]}</span><span class="contribution" id="contribution-${c.key}"></span><span class="contribution-track" aria-hidden="true"><span id="contribution-bar-${c.key}"></span></span></summary><div class="dimension-explanation"><p>${escape(c.description)}</p>${assessmentNote(show,c.key)}</div></details><fieldset class="rating-controls" ${editingRatings ? '' : 'hidden'} data-edit><legend class="sr-only">Edit ${c.name}</legend><input id="score-${c.key}" aria-label="Adjust ${c.name}" data-score="${c.key}" type="range" min="0" max="10" step="0.01" value="${show[c.key]}"><label class="sr-only" for="score-number-${c.key}">${c.name} rating</label><input id="score-number-${c.key}" class="rating-number" data-score="${c.key}" type="number" min="0" max="10" step="0.01" inputmode="decimal" value="${show[c.key]}"></fieldset></section>`).join('')}</div>
            <p class="small muted" id="detail-baseline"></p>
            <div class="detail-actions"><button class="text-button" id="reset-show" data-edit>Restore starting ratings</button><button class="quiet-button" id="detail-pin" data-pin="${slug}" data-edit></button></div>
            <details class="disclosure"><summary>Assessment scope & evidence</summary>${scopeEvidence}${assessment?.calibration ? '<p>' + escape(assessment.calibration) + '</p>' : ''}${assessment?.provenanceNote ? '<p>' + escape(assessment.provenanceNote) + '</p>' : ''}${openIssues.length ? '<ul class="assessment-issues">' + openIssues.map(issue => '<li>' + escape(issue.note) + '</li>').join('') + '</ul>' : ''}${reviewSources(show)}</details>
            ${assessment?.review.status === 'none' ? '' : assessment?.review.status === 'withheld' ? '<p class="evidence-note disclosure">' + (reviewed ? escape(assessment.review.note || 'This assessment supersedes the original commentary, which remains withheld. Historical ratings and excerpts are preserved separately.') : 'The original commentary is withheld while its programme details are checked. The recovered ratings still need editorial reassessment.') + '</p>' : `<details class="disclosure" id="original-review"><summary>Original review archive · contains spoilers</summary><p class="small muted">Historical commentary may disagree with the starting scores and may contain factual errors. The calculation above uses the actual ratings shown here.</p><div id="review-copy" class="review-copy"><p>Loading the review…</p></div><a class="text-link" href="docs/shows/${show.slug}.html" target="_blank" rel="noopener">Read the complete archived review ↗</a></details>`}`;
        updateDetailValues(); editingAvailability();
        $('adjust-ratings').addEventListener('click', () => {
            if (!editable()) return;
            editingRatings = !editingRatings;
            $('adjust-ratings').textContent = editingRatings ? 'Done editing' : 'Adjust my ratings';
            $('adjust-ratings').setAttribute('aria-pressed',String(editingRatings));
            document.querySelectorAll('.rating-controls').forEach(el => { el.hidden = !editingRatings; });
        });
        $('score-editor').addEventListener('input', event => {
            if (!editable() || !event.target.dataset.score) return;
            // Keep partial number input intact while updating only valid ratings.
            if (event.target.type === 'number' && (event.target.value === '' || !event.target.validity.valid)) return;
            model.setScore(show.title, event.target.dataset.score, Math.round(Number(event.target.value) * 100) / 100);
            updateDetailValues(event.target); renderList(); persist();
        });
        $('score-editor').addEventListener('focusout', event => {
            if (!editable() || event.target.type !== 'number' || !event.target.dataset.score) return;
            if (event.target.value === '' || !event.target.checkValidity()) {
                toast('Enter a rating from 0 to 10, with up to two decimal places.'); updateDetailValues(); return;
            }
            model.setScore(show.title,event.target.dataset.score,Number(event.target.value));
            updateDetailValues(); renderList(); persist();
        });
        $('reset-show').addEventListener('click', () => {
            if (!editable()) return;
            model.resetShow(show.title); updateDetailValues(); renderList(); persist();
        });
        $('original-review')?.addEventListener('toggle', () => { if ($('original-review').open) loadReview(show.slug); });
    }
    function updateDetailValues(editingInput = null) {
        const show = model.bySlug.get(openSlug);
        if (!show || !$('detail-pin')) return;
        const pinned = model.prefs.pinnedShows.includes(show.title);
        $('detail-pin').textContent = pinned ? 'Remove from shortlist' : 'Add to shortlist';
        $('detail-pin').setAttribute('aria-pressed', String(pinned));
        if (show.pending) return;
        const b = RankingMath.breakdown(show, model.prefs.weights, model.prefs.multiplierEnabled);
        const baseline = model.base.get(show.title), personal = Object.hasOwn(model.prefs.scoreOverrides,show.title);
        $('detail-score').textContent = b.final.toFixed(2);
        $('detail-rank').textContent = 'Rank ' + show.rank;
        $('detail-score-label').textContent = personal ? 'Your ratings · your formula' : baseline.assessment?.basis === 'research' ? 'Research ratings · your formula' : 'Starting ratings · your formula';
        $('detail-calculation').textContent = model.prefs.multiplierEnabled
            ? `${points(b.weighted)} weighted × ${multiplierText(b.multiplier)} length · rounded once`
            : `${points(b.weighted)} weighted quality · rounded once`;
        const delta = Math.round((show.final - show.withoutLengthScore) * 100) / 100;
        $('detail-length-effect').textContent = model.prefs.multiplierEnabled
            ? `Without length: ${show.withoutLengthScore.toFixed(2)} · rank ${show.withoutLengthRank}. ${delta === 0 ? 'Same displayed score.' : 'Displayed effect: ' + (delta > 0 ? '+' : '−') + Math.abs(delta).toFixed(2) + ' points.'}`
            : 'Length adjustment is off. This is the weighted quality score.';
        $('detail-rank-context').textContent = show.tieCount > 1
            ? `${show.tieCount} shows share this displayed score. Their positions are alphabetical, not a quality distinction.`
            : 'Position in the full ranking, using your current formula and ratings.';
        $('detail-rank-context').hidden = show.tieCount <= 1;
        for (const c of b.contributions) {
            $('score-value-' + c.key).textContent = show[c.key];
            $('score-' + c.key).value = show[c.key];
            if ($('score-number-' + c.key) !== editingInput) $('score-number-' + c.key).value = show[c.key];
            $('detail-weight-' + c.key).textContent = c.weight + '%';
            $('contribution-' + c.key).textContent = points(c.points) + ' pts';
            $('contribution-bar-' + c.key).style.width = (c.points / 10 * 100) + '%';
            $('contribution-' + c.key).setAttribute('aria-label', `${c.rating} times ${c.weight}% contributes ${points(c.points)} points`);
        }
        $('detail-baseline').textContent = personal
            ? `Your ratings are saved separately. The starting assessment would score ${RankingMath.calculateFinal(baseline,model.prefs.weights,model.prefs.multiplierEnabled).toFixed(2)} with this formula.`
            : baseline.assessment?.status === 'reviewed'
                ? 'Each explanation supports the research rating shown. Adjustments are saved as your own assessment.'
                : 'Recovered starting ratings. Historical notes have not yet been reconciled into a verified assessment.';
        $('reset-show').hidden = !personal;
    }
    function openShow(slug, push = true) {
        if (!model?.bySlug.has(slug)) return;
        const canonical = model.bySlug.get(slug).slug;
        if (openSlug !== canonical) editingRatings = false;
        openSlug = canonical; renderDetail(openSlug);
        if (push && location.hash !== '#show=' + slug) history.pushState({ dreShow:true }, '', '#show=' + slug);
        openDialog('show-dialog');
    }
    $('show-dialog').addEventListener('close', () => {
        const closedSlug = openSlug;
        openSlug = null;
        // Editing may have rebuilt the list, replacing the dialog's native return-focus target.
        ($('rankings').querySelector(`[data-slug="${closedSlug}"] .show-title`) || $('search')).focus({preventScroll:true});
        if (!routing && location.hash.startsWith('#show=')) {
            if (history.state?.dreShow) history.back();
            else history.replaceState(null, '', location.pathname + location.search);
        }
    });
    function route() {
        if (!model) return;
        const slug = location.hash.startsWith('#show=') ? location.hash.slice(6) : null;
        if (model.bySlug.has(slug)) openShow(slug, false);
        else if ($('show-dialog').open) { routing = true; $('show-dialog').close(); openSlug = null; queueMicrotask(() => { routing = false; }); }
    }
    window.addEventListener('popstate', route);
    window.addEventListener('hashchange', route);
    async function loadReview(slug) {
        const destination = $('review-copy');
        if (!destination || openSlug !== slug) return;
        try {
            if (!reviewCache.has(slug)) {
                const response = await fetch(`docs/shows/${slug}.html`, { signal:AbortSignal.timeout(10000) });
                if (!response.ok) throw new Error('Review unavailable');
                const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
                const heading = [...doc.querySelectorAll('h2')].find(h => /what it feels|overview|premise|synopsis|introduction/i.test(h.textContent));
                const paragraphs = [];
                if (heading) {
                    let next = heading.nextElementSibling;
                    while (next && !/^H[12]$/.test(next.tagName)) {
                        if (next.matches('p')) paragraphs.push(next.textContent);
                        else next.querySelectorAll('p').forEach(p => paragraphs.push(p.textContent));
                        next = next.nextElementSibling;
                    }
                }
                reviewCache.set(slug, paragraphs);
            }
            if (openSlug !== slug || destination !== $('review-copy')) return;
            const paragraphs = reviewCache.get(slug);
            destination.replaceChildren(...paragraphs.map(text => { const p = document.createElement('p'); p.textContent = text; return p; }));
            if (!paragraphs.length) destination.textContent = 'The complete analysis is available in the archived review below.';
        } catch { if (openSlug === slug) destination.textContent = 'The review couldn’t load. Try the archive link below.'; }
    }
    function methodology() {
        $('methodology-categories').innerHTML = cats.map(c => `<div class="method-category"><h3>${c.name}<span>${model?.prefs.weights[c.key] ?? RankingMath.DEFAULT_WEIGHTS[c.key]}%</span></h3><p>${c.description}</p></div>`).join('');
        $('multiplier-table').innerHTML = [[10,'1–10'],[25,'25'],[50,'50'],[75,'75'],[100,'100+']].map(([episodes,label]) => `<tr><td>${label}</td><td>×${multiplierText(RankingMath.episodeMultiplier(episodes))}</td></tr>`).join('');
        openDialog('methodology-dialog');
    }
    on('open-methodology','click',methodology); on('formula-explain','click',methodology);
    on('open-about','click',() => openDialog('about-dialog'));
    on('open-library','click',() => { updateLibrary(); openDialog('library-dialog'); });
    on('compare-shortlist','click',() => {
        const selected = model.shows.filter(s => model.prefs.pinnedShows.includes(s.title));
        $('comparison-body').innerHTML = `<table><caption>Your current formula. Awaiting assessments have no score or rank.</caption><thead><tr><th scope="col">Dimension</th>${selected.map(s => `<th scope="col">${escape(s.title)}</th>`).join('')}</tr></thead><tbody>${[{name:'Assessed run',key:'scope'},{name:'Rank',key:'rank'}, ...cats, {name:'Weighted quality',key:'quality'},{name:'Length adjustment',key:'length'},{name:'Final score',key:'final'}].map(c => `<tr><th scope="row">${c.name}</th>${selected.map(s => `<td>${c.key === 'scope' ? escape(s.assessment?.scope.label || 'Not recorded') : s.pending ? '—' : c.key === 'rank' ? '#' + s.rank : c.key === 'final' ? s.final.toFixed(2) : c.key === 'quality' ? points(RankingMath.breakdown(s,model.prefs.weights,false).weighted) : c.key === 'length' ? '×' + multiplierText(model.prefs.multiplierEnabled ? RankingMath.episodeMultiplier(s.episodes) : 1) : s[c.key]}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
        openDialog('compare-dialog');
    });

    function download(data) {
        const link = document.createElement('a');
        const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
        link.href = url; link.download = 'dynamic-rank-engine-' + new Date().toISOString().slice(0,10) + '.json';
        link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
    }
    on('export-scores','click',() => { if (editable()) download({schemaVersion:1,exportedAt:new Date().toISOString(),...model.snapshot()}); });
    on('import-scores','click',() => { if (editable()) $('import-file').click(); });
    on('import-file','change',async event => {
        const file = event.target.files[0]; event.target.value = '';
        if (!file || !editable()) return;
        try {
            if (file.size > 2 * 1024 * 1024) throw new Error('Choose a rankings JSON backup smaller than 2 MB.');
            const data = JSON.parse((await file.text()).replace(/^\uFEFF/,''));
            if (!data || (!Object.hasOwn(data,'scoreOverrides') && !Object.hasOwn(data,'overrides'))) throw new Error('This file does not contain a rankings backup.');
            const before = model.snapshot(); model.apply(data); undoSnapshot = before;
            $('undo-reset').hidden = false; limit = 30; renderAll(); persist();
            const unmatched = Object.keys(model.prefs.scoreOverrides).filter(t => !model.base.has(t)).length;
            $('library-message').textContent = `Backup restored. ${unmatched ? unmatched + ' unmatched titles were retained in the backup.' : 'Your formula and ratings are applied.'}`;
        } catch (error) { $('library-message').textContent = 'Nothing changed. ' + error.message; }
    });
    on('reset-all','click',() => {
        if (!editable()) return;
        undoSnapshot = model.snapshot(); model.apply({}); query = ''; onlyPinned = false; limit = 30; $('search').value = '';
        $('undo-reset').hidden = false; $('library-message').textContent = 'Defaults restored. Undo is available below.';
        renderAll(); persist();
    });
    on('undo-reset','click',() => {
        if (!editable() || !undoSnapshot) return;
        model.apply(undoSnapshot); undoSnapshot = null; $('undo-reset').hidden = true;
        $('library-message').textContent = 'Your previous rankings are restored.'; renderAll(); persist();
    });

    function syncStatus(status) {
        syncState = status;
        const messages = { loading:'Loading your saved rankings…', ready:'Account ready. Changes save automatically.', pending:'Changes waiting to save…', saving:'Saving to your account…', saved:'Saved to your account.', 'load-error':'Your account could not load. Editing is paused to protect your saved rankings.', 'save-error':'Save not confirmed. Your changes remain on this device. Retry when connected.' };
        $('account-status').textContent = messages[status] || '';
        const needsAttention = ['loading','pending','saving','load-error','save-error'].includes(status);
        $('account-notice').hidden = !needsAttention;
        $('account-notice-text').textContent = messages[status] || '';
        $('retry-sync').hidden = !['load-error','save-error'].includes(status);
        $('recovery-panel').hidden = !currentUser || !readLocal('dre:recovery:' + currentUser.uid);
        editingAvailability();
    }
    function loadScript(src) {
        return new Promise((resolve,reject) => {
            const script = document.createElement('script'); script.src = src; script.async = true;
            script.onload = resolve; script.onerror = () => reject(new Error('Sign-in could not load.'));
            document.head.appendChild(script);
        });
    }
    async function startAccounts() {
        try {
            await AccountSync.withTimeout(loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js'),10000);
            await AccountSync.withTimeout(Promise.all([
                loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js'),
                loadScript('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js')
            ]),10000);
            firebase.initializeApp(window.FIREBASE_CONFIG); auth = firebase.auth(); db = firebase.firestore();
            sync = new AccountSync.Coordinator({
                read:async uid => { const doc = await db.collection('users').doc(uid).get({source:'server'}); return doc.exists ? doc.data() : {}; },
                write:(uid,data) => db.collection('users').doc(uid).set(data),
                apply:data => { model.apply(data); renderAll(); }, snapshot:() => model.snapshot(),
                cache:(uid,data,context) => {
                    writeLocal('dre:account:' + uid, data);
                    if (context.reason === 'change') writeLocal('dre:recovery:' + uid, data);
                    if (context.reason === 'saved') { try { localStorage.removeItem('dre:recovery:' + uid); } catch {} }
                }, status:syncStatus
            });
            auth.onAuthStateChanged(async user => {
                authResolved = true; currentUser = user; undoSnapshot = null; $('undo-reset').hidden = true;
                $('auth-error').textContent = ''; $('auth-password').value = '';
                $('account-button').textContent = user ? (user.displayName?.split(' ')[0] || 'Your account') : 'Sign in';
                $('account-title').textContent = user ? 'Your account' : 'Sign in';
                $('signed-in-panel').hidden = !user; $('sign-in-panel').hidden = !!user;
                $('account-name').textContent = user ? user.displayName || user.email || 'Your account' : '';
                if (user) { $('account-dialog').close(); await sync.load(user.uid); }
                else {
                    sync.disconnect(); restoreGuest(); $('account-notice').hidden = true; renderAll();
                }
                editingAvailability();
            }, () => accountUnavailable());
        } catch { accountUnavailable(); }
    }
    function accountUnavailable() {
        authResolved = true; sdkUnavailable = true; editingAvailability();
        $('account-notice').hidden = false;
        $('account-notice-text').textContent = 'Sign-in is unavailable. You can browse and save guest changes on this device.';
        $('auth-error').textContent = 'Sign-in could not load. Check your connection, then refresh to try again.';
    }
    function restoreGuest() {
        const guest = readLocal(GUEST_KEY);
        try { model.apply(guest || {}); }
        catch { model.apply({}); toast('The saved guest backup could not be read. It has been left untouched.'); }
    }
    on('account-button','click',() => openDialog('account-dialog'));
    on('retry-sync','click',async () => {
        if (syncState === 'load-error') await sync.load(currentUser.uid);
        else await sync.save();
    });
    on('save-account','click',async () => {
        if (editable() && currentUser && await sync.save()) toast('Saved to your account.');
    });
    on('download-recovery','click',() => {
        const data = currentUser && readLocal('dre:recovery:' + currentUser.uid);
        if (data) download({schemaVersion:1,...data});
    });
    on('restore-recovery','click',() => {
        if (!editable() || !currentUser) return;
        const data = readLocal('dre:recovery:' + currentUser.uid);
        if (data) { model.apply(data); renderAll(); persist(); toast('Local changes restored. Saving to your account…'); }
    });
    on('sign-out','click',async () => {
        if (!auth || !currentUser) return;
        if (sync?.dirty && !await sync.save()) { $('auth-error').textContent = 'Your save is not confirmed. Retry saving before signing out.'; return; }
        await auth.signOut(); $('account-dialog').close();
    });
    const authMessage = error => error.code === 'auth/unauthorized-domain'
        ? 'For local sign-in, open http://localhost:4173. This address is not an authorised sign-in domain.'
        : ({'auth/invalid-credential':'Email or password was not recognised.', 'auth/popup-closed-by-user':'Sign-in was cancelled. You can try again.', 'auth/network-request-failed':'Check your connection and try again.', 'auth/too-many-requests':'Too many attempts. Please wait before trying again.'}[error.code] || error.message || 'Sign-in failed. Please try again.');
    async function signIn(action, button) {
        if (!auth || sdkUnavailable) { $('auth-error').textContent = 'Sign-in is unavailable. Refresh the page when connected.'; return; }
        button.disabled = true; $('auth-error').textContent = '';
        try { await action(); $('account-dialog').close(); }
        catch (error) { $('auth-error').textContent = authMessage(error); }
        finally { button.disabled = false; }
    }
    on('google-signin','click',() => signIn(() => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()), $('google-signin')));
    on('auth-form','submit',event => {
        event.preventDefault();
        const email = $('auth-email').value.trim(), password = $('auth-password').value;
        return signIn(() => registering ? auth.createUserWithEmailAndPassword(email,password) : auth.signInWithEmailAndPassword(email,password), $('auth-submit'));
    });
    on('auth-toggle','click',() => {
        registering = !registering;
        $('auth-submit').textContent = registering ? 'Create account' : 'Sign in';
        $('auth-toggle').textContent = registering ? 'Already have an account? Sign in' : 'Create an account';
        $('account-title').textContent = registering ? 'Create an account' : 'Sign in';
        $('auth-password').autocomplete = registering ? 'new-password' : 'current-password';
        $('auth-error').textContent = '';
    });
    window.addEventListener('beforeunload', event => { if (currentUser && sync?.dirty) { event.preventDefault(); event.returnValue = ''; } });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && sync?.dirty) sync.save(); });

    let catalogueLoading = false, accountsStarted = false;
    async function loadCatalogue() {
        if (catalogueLoading) return;
        catalogueLoading = true; $('load-error').hidden = true;
        $('results-count').textContent = 'Loading the catalogue…';
        try {
            const response = await fetch('data/shows/index.json', {cache:'no-cache',signal:AbortSignal.timeout(15000)});
            if (!response.ok) throw new Error('Catalogue unavailable');
            const data = await response.json(); model = new RankingState.Model(data.shows);
            catalogueDate = /^\d{4}-\d{2}-\d{2}$/.test(data.lastUpdated) ? data.lastUpdated : 'not recorded';
            const dateText = catalogueDate === 'not recorded' ? catalogueDate : new Intl.DateTimeFormat('en-NZ',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(catalogueDate));
            const checked = data.catalogueCheckedThrough ? `Release discovery checked through ${data.catalogueCheckedThrough}.` : '';
            $('catalogue-date').textContent = `${model.ranked.length} ranked · ${model.pending.length} awaiting assessment. ${checked}`;
            $('about-date').textContent = `Original ratings were recovered from the ${dateText} catalogue. ${checked} This is a selected release sweep, not a full reassessment of every show. There are ${model.ranked.length} ranked entries and ${model.pending.length} awaiting assessment.`;
            restoreGuest(); renderAll(); route();
            if (!accountsStarted) { accountsStarted = true; startAccounts(); }
        } catch (error) {
            $('load-error').hidden = false; $('results-count').textContent = 'Catalogue unavailable';
            console.error('Catalogue could not load:', error.message);
        } finally { catalogueLoading = false; }
    }
    on('retry-catalogue','click',loadCatalogue);
    editingAvailability(); loadCatalogue();
})();
