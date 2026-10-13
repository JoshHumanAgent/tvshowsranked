/* Read-only structural checks for the shipped site and preserved review archive. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { Model } = require('../ranking-state');
function auditSite(root = path.resolve(__dirname,'..')) {
    const errors=[],warnings=[];
    const read=file=>fs.readFileSync(path.join(root,file),'utf8');
    const html=read('index.html'),catalogue=JSON.parse(read('data/shows/index.json').replace(/^\uFEFF/,''));
    const model=new Model(catalogue.shows);
    for(const [,src] of html.matchAll(/(?:src|href)="([^"?#]+\.(?:js|css|svg))(?:\?[^"\s]*)?"/g)) {
        if(!src.startsWith('https:')&&!fs.existsSync(path.join(root,src)))errors.push('Missing dependency: '+src);
    }
    for(const file of ['app.js','ranking-state.js','ranking-math.js','account-sync.js','firebase-config.js']) {
        try{new vm.Script(read(file),{filename:file});}catch(e){errors.push(e.message);}
    }
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    if(new Set(ids).size!==ids.length)errors.push('Duplicate HTML ids');
    const links=[...read('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
    if(new Set(links).size!==links.length)errors.push('Duplicate sitemap URLs');
    for(const link of links){const url=new URL(link);if(url.origin!=='https://dynamicrankengine.com')errors.push('Unexpected sitemap origin');
        const file=path.join(root,url.pathname==='/'?'index.html':url.pathname.slice(1));
        if(!fs.existsSync(file))errors.push('Sitemap points to a missing page: '+url.pathname);
        else if(/name="robots" content="noindex/.test(fs.readFileSync(file,'utf8')))errors.push('Sitemap contains a noindex page: '+url.pathname);
    }
    for(const show of catalogue.shows){
        if(!show.assessment)errors.push('Missing versioned assessment: '+show.slug);
        if(show.assessment?.review.status==='none')continue;
        const review=read('docs/shows/'+show.slug+'.html');
        if(!review.includes('archive-notice:start'))errors.push('Review lacks historical context: '+show.slug);
        if((show.reviewStatus||show.verificationStatus==='unverified'||show.assessment?.review.status==='withheld')&&!review.includes('content="noindex, follow"'))errors.push('Unverified review is indexable: '+show.slug);
    }
    const corrections=JSON.parse(read('data/catalogue-corrections.json'));
    for(const change of corrections.corrections){const show=catalogue.shows.find(s=>s.slug===change.slug);for(const [key,value] of Object.entries(change.after)){
        if(show?.[key]!==value)errors.push('Verified correction drifted: '+change.slug+' / '+key);
    }}
    const quarantined=catalogue.shows.filter(s=>s.verificationStatus==='unverified');
    const withheld=catalogue.shows.filter(s=>s.assessment?.review.status==='withheld');
    if(quarantined.length)warnings.push(quarantined.length+' unverified catalogue entry is preserved outside the active ranking.');
    if(withheld.length)warnings.push(withheld.length+' original reviews are withheld; '+model.pending.length+' entries await assessment and are excluded from ranking.');
    return {status:errors.length?'FAIL':'PASS',activeShows:model.shows.length,rankedShows:model.ranked.length,pendingAssessments:model.pending.length,preservedRecords:catalogue.shows.length,
        sitemapUrls:links.length,identityCorrections:corrections.identityCorrections,seasonCountCorrections:corrections.seasonCountCorrections,errors,warnings};
}
if(require.main===module){const result=auditSite();console.log(JSON.stringify(result,null,2));process.exitCode=result.errors.length?1:0;}
module.exports={auditSite};
