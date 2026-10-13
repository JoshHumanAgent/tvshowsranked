"""Verify audit artefacts against exact decimal arithmetic and their source files.

Writes only docs/ranking-ledger/verification.json and audit-source-snapshot.json.
No network access or production mutations.
"""
from pathlib import Path
from decimal import Decimal, ROUND_HALF_UP
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
import re
import subprocess

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/ranking-ledger'
KEYS=['char','world','cine','spect','conc','drive','resol']
WEIGHTS=dict(zip(KEYS,[25,15,5,5,15,15,20]))

def read(path):return json.loads((ROOT/path).read_text(encoding='utf-8-sig'))
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def mult(n):
    for ceiling,value in [(10,'0.96'),(20,'0.95'),(30,'0.97'),(40,'1'),(50,'1.02'),(60,'1.03'),(75,'1.04'),(100,'1.05')]:
        if n<=ceiling:return Decimal(value)
    return Decimal('1.06')
def final(base,m):return float((base*m).quantize(Decimal('.01'),rounding=ROUND_HALF_UP))

catalogue=read('data/shows/index.json')['shows']
ledger=read('docs/ranking-ledger/show-ledger.json')
by_slug={r['slug']:r for r in ledger}
active=sorted((r for r in ledger if r['status']=='active'),key=lambda r:r['rank'])
assert len(ledger)==len(catalogue)==442
assert len(active)==439
assert [r['rank'] for r in active]==list(range(1,440))
for s in catalogue:
    r=by_slug[s['slug']]
    base=sum(Decimal(str(s[k]))*WEIGHTS[k]/100 for k in KEYS)
    assert float(base)==r['weightedBase'],s['slug']
    assert float(mult(s['episodes']))==r['lengthMultiplier'],s['slug']
    for k in KEYS:assert float(Decimal(str(s[k]))*WEIGHTS[k]/100)==r['contributions'][k]
    if r['status']=='active':
        assert final(base,mult(s['episodes']))==r['final'],s['slug']
        assert final(base,Decimal(1))==r['noLength']['final'],s['slug']
        for scenario,weights in [('originalWeights',[20,15,10,10,15,15,15]),('visualWeights',[20,15,15,10,15,15,10])]:
            alternative=sum(Decimal(str(s[k]))*w/100 for k,w in zip(KEYS,weights))
            assert final(alternative,mult(s['episodes']))==r[scenario]['final'],(s['slug'],scenario)
for before,after in zip(active,active[1:]):
    assert before['final']>=after['final']
    assert after['above']['title']==before['title']
    assert after['above']['gap']==round(before['final']-after['final'],2)

reviews=read('docs/ranking-ledger/review-evidence.json')
review_by_slug={r['slug']:r for r in reviews}
assert len(reviews)==457
assert all(r['slug'] in review_by_slug for r in active)
assert len(read('docs/ranking-ledger/historical-review-evidence.json'))==219
assert review_by_slug['killing-eve']['categoryValues']['spect']==[7.0]
assert review_by_slug['game-of-thrones-s1-4']['categoryValues']['spect']==[9.5]
assert review_by_slug['patrick-melrose']['categoryValues']['char']==[7.8]
assert len(review_by_slug['game-of-thrones-s1-4']['explainedCategories'])==7
assert not review_by_slug['godless']['explainedCategories']
assert not review_by_slug['fear-the-walking-dead']['categoryValues']['cine']
assert not review_by_slug['pachinko']['categoryValues']['resol']
assert not review_by_slug['poker-face']['categoryValues']['resol']
assert not review_by_slug['the-white-lotus']['categoryValues']['resol']

stats=read('docs/ranking-ledger/quantitative-audit.json')['statistics']
assert stats['activeReviewsWithCategoryMismatch']==sum(bool(r['reviewMismatchCategories']) for r in active)==419
assert stats['activeReviewsWithMultipleValues']==sum(bool(r['reviewAmbiguousCategories']) for r in active)==11
assert stats['lengthChangesRank']==sum(r['rank']!=r['noLength']['rank'] for r in active)==427
ties=Counter(r['final'] for r in active)
assert stats['roundedScoreTieGroups']==sum(n>1 for n in ties.values())==102
assert stats['showsInRoundedTies']==sum(n for n in ties.values() if n>1)==360

inventory=read('docs/ranking-ledger/source-inventory.json')['sources']
additional=read('docs/ranking-ledger/additional-source-inventory.json')
for r in [*inventory,*additional]:assert digest(ROOT/r['path'])==r['sha256'],r['path']
assert len(inventory)==457 and len(additional)==378
assert sum('/docs/shows/' in r['path'] for r in additional)==200
assert sum(r['path'].startswith('data/shows/html/') for r in additional)==140

node=r"""
const assert=require('assert/strict'),fs=require('fs'),m=require('./ranking-math'),{Model,balanceWeights}=require('./ranking-state');
const shows=JSON.parse(fs.readFileSync('data/shows/index.json','utf8').replace(/^\uFEFF/,'')).shows;
const boundaries=[1,10,11,20,21,30,31,40,41,50,51,60,61,75,76,100,101];
const expected=[.96,.96,.95,.95,.97,.97,1,1,1.02,1.02,1.03,1.03,1.04,1.04,1.05,1.05,1.06];
assert.deepEqual(boundaries.map(m.episodeMultiplier),expected);
const allEight=Object.fromEntries(m.KEYS.map(k=>[k,8]));
assert.equal(m.calculateFinal({...allEight,episodes:10}),7.68);
assert.equal(m.calculateFinal({...allEight,episodes:101}),8.48);
assert.equal(m.calculateFinal({...Object.fromEntries(m.KEYS.map(k=>[k,10])),episodes:101}),10.6);
const model=new Model(shows);
const before=model.bySlug.get('breaking-bad');
const oldBase=m.breakdown(before).weighted;
model.setScore(before.title,'char',9.5);
assert.equal(m.breakdown(model.bySlug.get('breaking-bad')).weighted-oldBase,.125);
assert.equal(shows.find(s=>s.slug==='breaking-bad').char,9);
const ignoredFinal=new Model(shows);ignoredFinal.apply({scoreOverrides:{'Breaking Bad':{_final:999}}});
assert.equal(ignoredFinal.bySlug.get('breaking-bad').final,9.31);
for(let i=1;i<model.shows.length;i++)if(model.shows[i-1].final===model.shows[i].final)assert(model.shows[i-1].title.localeCompare(model.shows[i].title,'en')<=0);
assert.equal(Object.values(balanceWeights(m.DEFAULT_WEIGHTS,'char',100)).reduce((a,b)=>a+b),100);
process.stdout.write(JSON.stringify({boundaryCases:boundaries.length,uniformEight:[7.68,8.48],theoreticalMaximum:10.6,personalOverrideIsolated:true,staleImportedFinalIgnored:true,tiesAlphabetical:true}));
"""
runtime=json.loads(subprocess.run(['D:/node.exe','-e',node],cwd=ROOT,capture_output=True,text=True,encoding='utf8',check=True).stdout)

sources=[
 'ranking-math.js','ranking-state.js','app.js','data/shows/index.json','data/core/ranked.json',
 'data/core/00-foundation-list.json','data/core/00-HOW-TO-RANK.md','data/core/04-DIRECTIVE.md',
 'data/core/CLEAN-AND-REPAIR-DIRECTIVE.md','DIRECTIVE.md','WORKFLOWS.md',
 'docs/methodology/scoring_learnings.md','docs/methodology/current_rankings_rationale.md',
 'docs/methodology/MainBannerHook.txt','docs/top100currentdefault.md',
 '_archived/old-archive/working-files/Entire Chat with Claude to Build Ranking System.txt',
 '_archived/old-archive/working-files/tv_ranking_agent_instructions.md',
 '_archived/old-archive/working-files/Master Ranking.txt',
 '_archived/old-archive/working-files/top_100_tv_rankings_v2.md',
 '_archived/old-archive/old-rankings/TVSHOWS-RANKED-MEMORY.md',
 '_archived/memory/06-CHANGES.md','data/archive/DAILY-REPORT-2026-02-23.md',
 'data/archive/RERANK-PLAN-2026-02-23.md','scripts/build-ranking-ledger.py','scripts/audit-ranking-design.py',
 'scripts/verify-ranking-ledger.py','docs/ranking-ledger/editorial-findings.json']
sources += [p.relative_to(ROOT).as_posix() for p in sorted((ROOT/'_archived/josh-edits').glob('*.json'))]
snapshot={'dateUTC':datetime.now(timezone.utc).isoformat(),'scope':'Read-only local public-default research snapshot; no account overrides.',
 'sources':[{'path':p,'sha256':digest(ROOT/p),'bytes':(ROOT/p).stat().st_size} for p in sources]}
(OUT/'audit-source-snapshot.json').write_text(json.dumps(snapshot,ensure_ascii=False,indent=2)+'\n',encoding='utf8')

document=(OUT/'per-show-ledger.md').read_text(encoding='utf8')
assert len(re.findall(r'^## \d+\.',document,re.M))==439
findings=read('docs/ranking-ledger/editorial-findings.json')
unmatched=sorted({s for f in findings for s in f['slugs'] if s not in review_by_slug})
assert not unmatched,unmatched
result={'passed':True,'verifiedAtUTC':datetime.now(timezone.utc).isoformat(),
 'catalogueRows':442,'activeRanks':439,'independentDecimalFinalChecks':439*4,
 'reviewBodies':457,'additionalDistinctReviewBodies':219,
 'htmlSourceHashesVerified':len(inventory)+len(additional),'nonHtmlSourceHashesRecorded':len(sources),
 'perShowSections':439,'runtimeChecks':runtime,
 'editorialBoundary':'No test certifies the artistic rating or every programme fact. Historical long-backup prose coverage is described separately in the report.',
 'mutationBoundary':'Only ledger output files written. No application, rating, account or production mutation.'}
(OUT/'verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
print(json.dumps(result,indent=2))
