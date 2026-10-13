"""Read-only source extraction for the ranking design ledger. No site data is changed."""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import hashlib
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs' / 'ranking-ledger'

class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []
    def text(self):
        return ' '.join(c.text() if isinstance(c, Node) else c for c in self.children)
    def walk(self):
        yield self
        for c in self.children:
            if isinstance(c, Node): yield from c.walk()

class Document(HTMLParser):
    VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.root = Node('document'); self.current = self.root; self.feed(source)
    def handle_starttag(self, tag, attrs):
        child = Node(tag, attrs, self.current); self.current.children.append(child)
        if tag not in self.VOID: self.current = child
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID: self.handle_endtag(tag)
    def handle_endtag(self, tag):
        current = self.current
        while current.parent:
            if current.tag == tag:
                self.current = current.parent; return
            current = current.parent
    def handle_data(self, data): self.current.children.append(data)

def clean(text): return re.sub(r'\s+', ' ', text).strip()

def visible(node):
    if node.tag in {'style','script','head','nav','footer'} or 'archive-note' in node.attrs.get('class','').split(): return ''
    if node.tag == 'br': return '\n'
    content = ''.join(visible(c) if isinstance(c, Node) else c for c in node.children)
    if node.tag in {'p','h1','h2','h3','h4','li','div','section','article','tr','header','table','blockquote'}:
        content = '\n' + content + '\n'
    return content

def build():
    OUT.mkdir(exist_ok=True)
    catalogue = json.loads((ROOT/'data/shows/index.json').read_text(encoding='utf-8-sig'))['shows']
    byslug = {s['slug']:s for s in catalogue}
    reviews=[]
    for p in sorted((ROOT/'docs/shows').glob('*.html')):
        source=p.read_text(encoding='utf-8-sig'); doc=Document(source)
        body=next((n for n in doc.root.walk() if n.tag=='body'),doc.root)
        nodes=list(body.walk())
        lines=[clean(s) for s in visible(body).splitlines() if clean(s)]
        paragraphs=[]; heading=''
        for n in nodes:
            if n.tag in {'h1','h2','h3','h4'}: heading=clean(n.text())
            if n.tag=='p' and not (n.parent and 'archive-note' in n.parent.attrs.get('class','')):
                paragraphs.append({'section':heading,'text':clean(n.text())})
        review={'index':len(reviews)+1,'slug':p.stem,'path':p.relative_to(ROOT).as_posix(),
                'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),
                'catalogueStatus':'outside-current-catalogue' if p.stem not in byslug else
                'duplicate-alias' if byslug[p.stem].get('duplicateOf') else
                'unverified' if byslug[p.stem].get('verificationStatus')=='unverified' else 'active',
                'reviewStatus':byslug.get(p.stem,{}).get('reviewStatus','unflagged'),
                'headings':[clean(n.text()) for n in nodes if n.tag in {'h1','h2','h3','h4'}],
                'text':'\n'.join(lines),'paragraphs':paragraphs}
        review['words']=len(review['text'].split()); reviews.append(review)
    (OUT/'review-corpus.json').write_text(json.dumps(reviews,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    inventory={'reviewCount':len(reviews),'catalogueRecords':len(catalogue),'words':sum(r['words'] for r in reviews),
               'statusCounts':dict(Counter(r['catalogueStatus'] for r in reviews)),
               'scope':'Every HTML review in docs/shows. Source prose is historical evidence, not verified programme facts.',
               'sources':[{'path':r['path'],'sha256':r['sha256'],'words':r['words'],'status':r['catalogueStatus']} for r in reviews]}
    (OUT/'source-inventory.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(json.dumps({k:v for k,v in inventory.items() if k!='sources'},ensure_ascii=False,indent=2))

def read_batch(start,end,mode='full'):
    corpus=json.loads((OUT/'review-corpus.json').read_text(encoding='utf8'))
    for r in corpus[start-1:end]:
        print(f"\n===== {r['index']:03d} {r['slug']} [{r['catalogueStatus']}] =====")
        if mode=='full': print(r['text'])
        else:
            for p in r['paragraphs']:
                if re.search('rank|dimension|analysis|score|verdict',p['section'],re.I):print(p['section']+': '+p['text'])

def build_extras():
    primary=json.loads((OUT/'review-corpus.json').read_text(encoding='utf8'))
    seen={r['text']:r['path'] for r in primary}; extras=[]; inventory=[]
    paths=sorted((ROOT/'data/shows/html').glob('*.html'))+sorted((ROOT/'_archived').rglob('*.html'))
    for p in paths:
        encoding='utf-8-sig'
        try: source=p.read_text(encoding=encoding)
        except UnicodeDecodeError:
            encoding='cp1252'; source=p.read_text(encoding=encoding)
        doc=Document(source)
        body=next((n for n in doc.root.walk() if n.tag=='body'),doc.root)
        text='\n'.join(clean(s) for s in visible(body).splitlines() if clean(s))
        relative=p.relative_to(ROOT).as_posix()
        item={'path':relative,'encoding':encoding,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),
              'words':len(text.split()),'identicalVisibleTextTo':seen.get(text)}
        if text not in seen:
            item['extraIndex']=len(extras)+1
            extras.append({**item,'text':text})
            seen[text]=relative
        inventory.append(item)
    (OUT/'additional-corpus.json').write_text(json.dumps(extras,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    (OUT/'additional-source-inventory.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(json.dumps({'additionalHtmlFiles':len(inventory),'distinctAdditionalBodies':len(extras),
                     'additionalWords':sum(x['words'] for x in extras),'lastSources':[{k:v for k,v in x.items() if k!='text'} for x in extras[140:]]},indent=2))

def read_extras(start,limit):
    corpus=json.loads((OUT/'additional-corpus.json').read_text(encoding='utf8'))
    words=0; end=start-1
    for r in corpus[start-1:]:
        if words and words+r['words']>limit: break
        print(f"\n===== EXTRA {r['extraIndex']:03d} {r['path']} =====\n{r['text']}")
        words+=r['words'];end=r['extraIndex']
    print(f'\nEXTRA COVERAGE: {start}-{end}; {words} words; next {end+1}')

def build_deltas():
    """Omit only exact previously inventoried lines, retaining a source for each."""
    primary=json.loads((OUT/'review-corpus.json').read_text(encoding='utf8'))
    extras=json.loads((OUT/'additional-corpus.json').read_text(encoding='utf8'))
    seen={}
    for r in primary:
        for line in r['text'].splitlines(): seen.setdefault(clean(line),r['path'])
    deltas=[]
    for r in extras:
        novel=[]; duplicate=[]
        for line in r['text'].splitlines():
            line=clean(line)
            if line in seen: duplicate.append({'text':line,'source':seen[line]})
            else:
                novel.append(line); seen[line]=r['path']
        deltas.append({'extraIndex':r['extraIndex'],'path':r['path'],'text':'\n'.join(novel),
                       'words':sum(len(x.split()) for x in novel),'duplicateLines':duplicate})
    (OUT/'additional-reading-deltas.json').write_text(json.dumps(deltas,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(json.dumps({'extraBodies':len(deltas),'novelWords':sum(x['words'] for x in deltas),
      'first140Words':sum(x['words'] for x in deltas[:140]),'backupReviewWords':sum(x['words'] for x in deltas[140:219]),
      'uiWords':sum(x['words'] for x in deltas[219:])},indent=2))

def read_deltas(start,limit):
    corpus=json.loads((OUT/'additional-reading-deltas.json').read_text(encoding='utf8'))
    words=0; end=start-1
    for r in corpus[start-1:]:
        if words and words+r['words']>limit: break
        print(f"\n===== EXTRA {r['extraIndex']:03d} {r['path']} ({len(r['duplicateLines'])} exact previously inventoried lines omitted) =====\n{r['text']}")
        words+=r['words'];end=r['extraIndex']
    print(f'\nDELTA COVERAGE: {start}-{end}; {words} novel words; next {end+1}')

def historical_assessments(start,limit):
    """Read each older version's explicit rating conclusions and arithmetic."""
    corpus=json.loads((OUT/'additional-corpus.json').read_text(encoding='utf8'))
    words=0; end=start-1
    for r in corpus[start-1:219]:
        lines=r['text'].splitlines()
        selected=[]
        for i,line in enumerate(lines):
            if i<3 or re.match(r'(?i)^(Why\b|Comparative Assessment:|Episode Multiplier:|Characters:|Concepts:|Rank:|FINAL SCORE|Final Verdict|TVShowsRanked Final|Seven.Dimension|Weight:|\d+(?:\.\d+)?(?:/10)?$)',line):
                selected.append(line)
        if len(selected)<18: selected=lines
        text='\n'.join(selected); n=len(text.split())
        if words and words+n>limit:break
        print(f"\n===== HISTORICAL ASSESSMENT {r['extraIndex']} {r['path']} =====\n{text}")
        words+=n;end=r['extraIndex']
    print(f'\nASSESSMENT COVERAGE: {start}-{end}; {words} selected words; next {end+1}')

if __name__=='__main__':
    if len(sys.argv)>1 and sys.argv[1]=='deltas': build_deltas()
    elif len(sys.argv)>1 and sys.argv[1]=='historical-assessments': historical_assessments(int(sys.argv[2]),int(sys.argv[3]) if len(sys.argv)>3 else 5000)
    elif len(sys.argv)>1 and sys.argv[1]=='delta-chunk': read_deltas(int(sys.argv[2]),int(sys.argv[3]) if len(sys.argv)>3 else 5000)
    elif len(sys.argv)>1 and sys.argv[1]=='extras': build_extras()
    elif len(sys.argv)>1 and sys.argv[1]=='extra-chunk': read_extras(int(sys.argv[2]),int(sys.argv[3]) if len(sys.argv)>3 else 4300)
    elif len(sys.argv)>1 and sys.argv[1]=='read': read_batch(int(sys.argv[2]),int(sys.argv[3]),sys.argv[4] if len(sys.argv)>4 else 'full')
    elif len(sys.argv)>1 and sys.argv[1]=='chunk':
        corpus=json.loads((OUT/'review-corpus.json').read_text(encoding='utf8'))
        start=int(sys.argv[2]); limit=int(sys.argv[3]) if len(sys.argv)>3 else 4300
        end=start-1; words=0
        for r in corpus[start-1:]:
            if words and words+r['words']>limit: break
            words+=r['words']; end=r['index']
        read_batch(start,end)
        print(f'\nCOVERAGE: {start}-{end}; {words} words; next {end+1}')
    else:build()
