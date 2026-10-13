/* Adds context to existing prose; never rewrites an assessment or its historical scores. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const data = JSON.parse(fs.readFileSync(path.join(root,'data/shows/index.json'),'utf8').replace(/^\uFEFF/,''));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let updated = 0;
for (const show of data.shows) {
    if (show.assessment?.review.status === 'none') continue;
    const filename = path.join(root,'docs/shows',show.slug + '.html');
    let html = fs.readFileSync(filename,'utf8');
    const target = show.duplicateOf || show.slug;
    const disputed = show.verificationStatus === 'unverified' || !!show.reviewStatus || show.assessment?.review.status === 'withheld';
    const metadata = `<!-- archive-context:start -->\n<link rel="stylesheet" href="../../archive.css">\n<link rel="canonical" href="https://dynamicrankengine.com/docs/shows/${target}.html">\n${disputed ? '<meta name="robots" content="noindex, follow">\n' : ''}<!-- archive-context:end -->`;
    html = html.replace(/<!-- archive-context:start -->[\s\S]*?<!-- archive-context:end -->\n/g,'');
    html = html.replace('</head>',metadata + '\n</head>');
    const note = show.assessment?.status === 'reviewed'
        ? 'This original review has been superseded by a new research assessment. Open the current rankings for the replacement ratings, reasons, scope and evidence. This archived prose is not support for those ratings.' + (show.assessment.review.note ? ' ' + escape(show.assessment.review.note) : '')
        : disputed ? show.reviewStatus ? 'This historical review describes the wrong programme. Its ratings are preserved for provenance but no longer produce a live score or rank.'
        : 'This historical entry has unresolved programme or factual inconsistencies. Its claims have not been verified; do not treat this prose as evidence for a current rating.'
        : 'These are the original comments and scores. They may contain spoilers and outdated ratings or streaming information. The live ranking uses your current formula.';
    const banner = `<!-- archive-notice:start -->\n<aside class="archive-note" aria-label="Archived review notice"><strong>${disputed ? 'Unverified archive' : 'Original review archive'}</strong><p>${note}</p><a href="../../index.html${show.verificationStatus === 'unverified' ? '' : '#show=' + target}">Open the current rankings →</a></aside>\n<!-- archive-notice:end -->`;
    html = html.replace(/\n<!-- archive-notice:start -->[\s\S]*?<!-- archive-notice:end -->/g,'');
    html = html.replace(/<body([^>]*)>/i,match=>match+'\n'+banner);
    if (html !== fs.readFileSync(filename,'utf8')) { fs.writeFileSync(filename,html); updated++; }
}
console.log(`Context added to ${updated} archived reviews.`);
