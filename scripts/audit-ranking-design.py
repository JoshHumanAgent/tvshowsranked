"""Reproducible, read-only audit of catalogue calculations and historical reviews."""
from pathlib import Path
from collections import Counter
import csv
import json
import re
import subprocess
import importlib.util

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/ranking-ledger'
KEYS = ['char','world','cine','spect','conc','drive','resol']
PATTERNS = {
 'char':r'Characters?(?:\s*(?:&|and)\s*Acting)?',
 'world':r'World[ -]?Building', 'cine':r'Cinematography',
 'spect':r'(?:Visual\s+)?Spectacle', 'conc':r'Conceptual\s+(?:Density|Depth)',
 'drive':r'Narrative\s+Drive', 'resol':r'(?:Narrative\s+(?:Path\s*&\s*)?)?Resolution'}

def read(p): return json.loads((ROOT/p).read_text(encoding='utf-8-sig'))
def save(name,data): (OUT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def label(text):
 text=re.sub(r'^[^\w]+','',text).strip()
 return re.sub(r'^\d{1,2}\.\s+','',text)

spec=importlib.util.spec_from_file_location('ledger_html',ROOT/'scripts/build-ranking-ledger.py')
html=importlib.util.module_from_spec(spec);spec.loader.exec_module(html)

def structured_dimensions(review):
 doc=html.Document((ROOT/review['path']).read_text(encoding=review.get('encoding','utf-8-sig')))
 found={k:{'scores':[],'paragraphs':[]} for k in KEYS}
 for n in doc.root.walk():
  if n.tag not in {'h2','h3','h4','div','span'}:continue
  title=label(html.clean(n.text()))
  if len(title)>85:continue
  for key,pattern in PATTERNS.items():
   if not re.fullmatch(rf'{pattern}(?:\s*\(\d+(?:\.\d+)?(?:/10)?\))?',title,re.I):continue
   parent=n.parent
   while parent and parent.tag not in {'body','document','html'}:
    nodes=list(parent.walk())
    other_labels=[x for x in nodes if x is not n and len(html.clean(x.text()))<85 and
      any(re.fullmatch(rf'{p}(?:\s*\(\d+(?:\.\d+)?(?:/10)?\))?',label(html.clean(x.text())),re.I) for k,p in PATTERNS.items() if k!=key)]
    if other_labels:break
    for x in nodes:
     if 'dimension-score' in x.attrs.get('class','').split() and re.fullmatch(r'\d+(?:\.\d+)?',html.clean(x.text())):
      value=float(html.clean(x.text()))
      if 0<=value<=10:found[key]['scores'].append(value)
    paragraphs=[html.clean(x.text()) for x in nodes if x.tag=='p' and len(html.clean(x.text()).split())>=5]
    if paragraphs:
     found[key]['paragraphs']+=paragraphs;break
    parent=parent.parent
 return found

# Use the actual application model; do not create a competing ranking implementation.
node = r"""
const fs=require('fs'), {Model}=require('./ranking-state'), math=require('./ranking-math');
const shows=JSON.parse(fs.readFileSync('data/shows/index.json','utf8').replace(/^\uFEFF/, '')).shows;
const scenarios={current:{},noLength:{multiplierEnabled:false},
 originalWeights:{weights:{char:20,world:15,cine:10,spect:10,conc:15,drive:15,resol:15}},
 visualWeights:{weights:{char:20,world:15,cine:15,spect:10,conc:15,drive:15,resol:10}}};
const result={weights:math.DEFAULT_WEIGHTS,scenarios:{}};
for(const [key,prefs] of Object.entries(scenarios)) {
 const model=new Model(shows);model.apply(prefs);
 result.scenarios[key]=model.shows.map(s=>({slug:s.slug,title:s.title,rank:s.rank,final:s.final}));
}
result.multipliers=Object.fromEntries(shows.map(s=>[s.slug,math.episodeMultiplier(s.episodes)]));
process.stdout.write(JSON.stringify(result));
"""
run=subprocess.run(['D:/node.exe','-e',node],cwd=ROOT,capture_output=True,text=True,encoding='utf8',check=True)
calculation=json.loads(run.stdout)
scenarios={k:{s['slug']:s for s in v} for k,v in calculation['scenarios'].items()}
catalogue=read('data/shows/index.json')['shows']; byslug={s['slug']:s for s in catalogue}
findings=read('docs/ranking-ledger/editorial-findings.json') if (OUT/'editorial-findings.json').exists() else []
corpus=read('docs/ranking-ledger/review-corpus.json'); reviews={}
num=r'(\d+(?:\.\d+)?)'
def analyze_review(review):
 text='\n'.join(label(line) for line in review['text'].splitlines()); values={}; evidence={}
 structured=structured_dimensions(review)
 for key,pattern in PATTERNS.items():
  matches=[]
  for rx in [rf'(?im)^\s*{pattern}\s*\(\s*{num}(?:/10)?\s*\)',
             rf'(?im)^\s*{pattern}\s*\n\s*{num}\s*$',
             rf'(?im)^\s*{num}\s*\n\s*{pattern}\s*$']:
   matches.extend(float(x) for x in re.findall(rx,text))
  values[key]=sorted(set(x for x in matches+structured[key]['scores'] if 0<=x<=10))
  evidence[key]=[p['text'] for p in review.get('paragraphs',[]) if len(p['text'].split())>=5 and
       (re.match(rf'(?i)^\s*{pattern}\s*\(',label(p['text'])) or
        re.match(rf'(?i)^\s*{pattern}(?:\s*\(|\s*$)',label(p['section'])))]
  evidence[key]=list(dict.fromkeys(evidence[key]+structured[key]['paragraphs']))
 printed=[]
 for rx in [rf'(?im)^\s*{num}\s*\n(?:Final Score|Overall Score)',rf'(?im)^(?:Final Score|Overall Score|Seven[- ]Dimension (?:Composite )?Score|TVShowsRanked Final Score)\s*\n\s*{num}',rf'(?im)^Score:\s*{num}']:
  printed.extend(float(x) for x in re.findall(rx,text))
 weight_groups=re.findall(r'(\d+)% weight',text)
 weight_totals=[sum(map(int,weight_groups[i:i+7])) for i in range(0,len(weight_groups),7) if len(weight_groups[i:i+7])==7]
 current=byslug.get(review['slug'])
 mismatch=[k for k in KEYS if current and values[k] and current[k] not in values[k]]
 ambiguity=[k for k in KEYS if len(values[k])>1]
 return {
  'index':review['index'],'slug':review['slug'],'path':review['path'],'catalogueStatus':review['catalogueStatus'],
  'reviewStatus':review['reviewStatus'],'categoryValues':values,'explanations':evidence,
  'explainedCategories':[k for k in KEYS if evidence[k]],
  'categoryMismatchWithCatalogue':mismatch,'ambiguousCategories':ambiguity,
  'printedFinals':sorted(set(printed)),'printedWeightTotals':weight_totals,
  'usesConceptualDepthLabel':bool(re.search(r'Conceptual Depth',text)),
  'placeholderCount':text.count('Content to be added.'),
  'allProgrammeFactsVerifiedExternally':False,
  'sourceHtmlMalformed':review['slug']=='fear-the-walking-dead'}

reviews={r['slug']:analyze_review(r) for r in corpus}
historical=[]
for extra in read('docs/ranking-ledger/additional-corpus.json'):
 if '/docs/shows/' not in extra['path'] and not extra['path'].startswith('data/shows/html/'):continue
 slug=Path(extra['path']).stem
 historical.append(analyze_review({**extra,'index':extra['extraIndex'],'slug':slug,
  'catalogueStatus':'historical-version','reviewStatus':'historical-version'}))
save('historical-review-evidence.json',historical)

rows=[]
for s in catalogue:
 slug=s['slug']; r=reviews.get(slug); active=slug in scenarios['current']
 contributions={k:round(s[k]*calculation['weights'][k]/100,6) for k in KEYS}
 base=round(sum(contributions.values()),6); multiplier=calculation['multipliers'][slug]
 row={
  'slug':slug,'title':s['title'],'status':'active' if active else 'duplicate-alias' if s.get('duplicateOf') else 'unverified',
  'episodes':s['episodes'],'scores':{k:s[k] for k in KEYS},'contributions':contributions,
  'weightedBase':base,'lengthMultiplier':multiplier,'unroundedFinal':round(base*multiplier,8),
  'lengthEffect':round(base*(multiplier-1),6),
  'rank':scenarios['current'].get(slug,{}).get('rank'),'final':scenarios['current'].get(slug,{}).get('final'),
  'noLength':scenarios['noLength'].get(slug),'originalWeights':scenarios['originalWeights'].get(slug),
  'visualWeights':scenarios['visualWeights'].get(slug),
  'reviewPath':r['path'] if r else None,'reviewStatus':s.get('reviewStatus','unflagged'),
  'explanationCategories':r['explainedCategories'] if r else [],
  'reviewMismatchCategories':r['categoryMismatchWithCatalogue'] if r else [],
  'reviewAmbiguousCategories':r['ambiguousCategories'] if r else [],
  'reviewPrintedFinals':r['printedFinals'] if r else []}
 row['historicalVersions']=[x['path'] for x in historical if x['slug']==slug]
 row['auditFindings']=[x for x in findings if slug in x['slugs']]
 if active:
  row['rankChangeWithoutLength']=row['rank']-row['noLength']['rank']
  row['largestContributors']=sorted(contributions,key=contributions.get,reverse=True)
 rows.append(row)
active=sorted((r for r in rows if r['status']=='active'),key=lambda r:r['rank'])
for i,r in enumerate(active):
 r['above']=None if not i else {'title':active[i-1]['title'],'gap':round(active[i-1]['final']-r['final'],2)}
 r['below']=None if i==len(active)-1 else {'title':active[i+1]['title'],'gap':round(r['final']-active[i+1]['final'],2)}
archived=[]
for p in sorted((ROOT/'_archived/josh-edits').glob('*.json')):
 d=json.loads(p.read_text(encoding='utf-8-sig'))
 archived.append({'path':p.relative_to(ROOT).as_posix(),'timestamp':d.get('timestamp'),
  'weights':d.get('weights'),'baseCount':len(d.get('baseScores',{})),
  'overrides':d.get('overrides',{})})
foundation=read('data/core/00-foundation-list.json')
foundation_changes=[]
for s in catalogue:
 if s['title'] in foundation['baseScores']:
  old=foundation['baseScores'][s['title']]
  diffs={k:{'foundation':old.get(k),'current':s[k]} for k in KEYS if old.get(k)!=s[k]}
  if diffs:foundation_changes.append({'title':s['title'],'categories':diffs})
hist=Counter(r['final'] for r in active)
stats={'catalogueRecords':len(rows),'activeShows':len(active),'archivedReviews':len(reviews),
 'weights':calculation['weights'],'weightsTotal':sum(calculation['weights'].values()),
 'reviewExplanationCoverage':dict(sorted(Counter(len(r['explainedCategories']) for r in reviews.values()).items())),
 'reviewsWithAllSevenExtractableScores':sum(all(r['categoryValues'][k] for k in KEYS) for r in reviews.values()),
 'activeReviewsWithCategoryMismatch':sum(bool(r['reviewMismatchCategories']) for r in active),
 'activeReviewsWithMultipleValues':sum(bool(r['reviewAmbiguousCategories']) for r in active),
 'reviewsWith105PercentGrid':sum(105 in r['printedWeightTotals'] for r in reviews.values()),
 'reviewsUsingConceptualDepthLabel':sum(r['usesConceptualDepthLabel'] for r in reviews.values()),
 'reviewsWithPlaceholders':sum(r['placeholderCount']>0 for r in reviews.values()),
 'activeReviewsWhosePrintedFinalNeverMatchesCurrent':sum(bool(r['reviewPrintedFinals']) and r['final'] not in r['reviewPrintedFinals'] for r in active),
 'activeReviewsWithExtractedPrintedFinal':sum(bool(r['reviewPrintedFinals']) for r in active),
 'additionalDistinctReviewBodiesAudited':len(historical),
 'foundationBaseCount':len(foundation['baseScores']),'foundationCategoryChanges':len(foundation_changes),
 'roundedScoreTieGroups':sum(v>1 for v in hist.values()),'showsInRoundedTies':sum(v for v in hist.values() if v>1),
 'lengthChangesRank':sum(r['rank']!=r['noLength']['rank'] for r in active),
 'scoreRange':[min(hist),max(hist)],
 'categoryDistribution':{k:{'mean':round(sum(r['scores'][k] for r in active)/len(active),3),
   'ninesOrHigher':sum(r['scores'][k]>=9 for r in active),'perfectTens':sum(r['scores'][k]==10 for r in active)} for k in KEYS},
 'method':'Scores and rankings use the application Model. Review counts use conservative heading/label extraction; missing extracted explanation means no labelled rationale was found, not proof the entire prose contains no relevant evidence.'}
save('show-ledger.json',rows);save('review-evidence.json',list(reviews.values()))
save('quantitative-audit.json',{'statistics':stats,'historicalExports':archived,'foundationChanges':foundation_changes})
with (OUT/'show-ledger.csv').open('w',encoding='utf-8-sig',newline='') as f:
 fields=['rank','title','slug','status','episodes',*KEYS,'weightedBase','lengthMultiplier','final','rankWithoutLength','scoreWithoutLength','reviewMismatchCategories','reviewAmbiguousCategories','reviewPath']
 w=csv.DictWriter(f,fieldnames=fields);w.writeheader()
 for r in [*active,*[r for r in rows if r['status']!='active']]:
  w.writerow({**{k:r[k] for k in ['rank','title','slug','status','episodes','weightedBase','lengthMultiplier','final','reviewPath']},
   **r['scores'],'rankWithoutLength':(r['noLength'] or {}).get('rank'),
   'scoreWithoutLength':(r['noLength'] or {}).get('final'),
   'reviewMismatchCategories':','.join(r['reviewMismatchCategories']),
   'reviewAmbiguousCategories':','.join(r['reviewAmbiguousCategories'])})
md=['# Per-show ranking ledger','',
 'Generated from the current public catalogue and the application calculation. No personal account overrides are applied. All seven rating inputs, weighted contributions, alternate settings and extracted review evidence are available in the accompanying JSON/CSV. These explanations describe the arithmetic; they do not certify the editorial judgments.','',
 'Category order: Characters / World / Camera / Spectacle / Ideas / Drive / Path. Default weights: 25 / 15 / 5 / 5 / 15 / 15 / 20.','']
for r in active:
 md += [f"## {r['rank']}. {r['title']} — {r['final']:.2f}",'',
  'Ratings: '+ ' / '.join(f"{r['scores'][k]:g}" for k in KEYS)+'.',
  'Weighted contributions: '+ ' + '.join(f"{r['contributions'][k]:g}" for k in KEYS)+f" = **{r['weightedBase']:g}**. {r['episodes']} episodes apply **×{r['lengthMultiplier']:g}**, giving {r['unroundedFinal']:g}, displayed as **{r['final']:.2f}**.",
  f"Without the length adjustment: **{r['noLength']['final']:.2f}, #{r['noLength']['rank']}**. With the original seven-category weights and length enabled: **{r['originalWeights']['final']:.2f}, #{r['originalWeights']['rank']}**."]
 if r['above']:md.append(f"Immediately above: {r['above']['title']} ({r['above']['gap']:.2f} higher)." if r['above']['gap'] else f"Tied in displayed score with {r['above']['title']}; alphabetical order decides the position.")
 md.append(f"[Archived review]({(ROOT/'docs/shows'/str(r['slug']+'.html')).as_posix()}). Labelled explanations found for {len(r['explanationCategories'])}/7 categories.")
 if r['reviewMismatchCategories']:md.append('Review score disagrees with catalogue: '+', '.join(r['reviewMismatchCategories'])+'.')
 if r['reviewAmbiguousCategories']:md.append('Review contains competing values: '+', '.join(r['reviewAmbiguousCategories'])+'.')
 if r['reviewStatus']!='unflagged':md.append('Review status: '+r['reviewStatus']+'.')
 for finding in r['auditFindings']:
  md.append(f"Audit {finding['id']} ({finding['status']}): {finding['finding']}")
 md += ['','Historical reasons from the archived main review (these may support different ratings from the current inputs):','',
        '| Dimension | Review value(s) | Archived rationale excerpt |','|---|---|---|']
 source=reviews.get(r['slug'])
 for key in KEYS:
  values=source['categoryValues'][key] if source else []
  paragraphs=source['explanations'][key] if source else []
  excerpt='No labelled supporting paragraph found.'
  if paragraphs:
   excerpt=next((p for p in paragraphs if re.match(r'^Why\s+\d',p)),paragraphs[0])
   if len(excerpt)>380:
    excerpt=excerpt[:380].rsplit(' ',1)[0]+'…'
  md.append('| '+key+' | '+(', '.join(f'{v:g}' for v in values) or 'Not extractable')+' | '+excerpt.replace('|','\\|').replace('\n',' ')+' |')
 md.append('')
(OUT/'per-show-ledger.md').write_text('\n'.join(md)+'\n',encoding='utf8')
print(json.dumps(stats,indent=2))
print('TOP 15',json.dumps([{'title':r['title'],'rank':r['rank'],'base':r['weightedBase'],'mult':r['lengthMultiplier'],'final':r['final'],'without':r['noLength']['rank']} for r in active[:15]],indent=2))
