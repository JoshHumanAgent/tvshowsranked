"""One-time, evidence-preserving migration of the audited catalogue.

The served record is authoritative. Existing ratings are not changed or inferred
from prose. An archived note is historical evidence, never an approved rationale.
Reruns skip records already carrying an assessment; edit those records directly.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KEYS = ('char', 'world', 'cine', 'spect', 'conc', 'drive', 'resol')
DATE = '2026-10-13'


def read(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8-sig'))


def write(path, value):
    (ROOT / path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def migrate():
    catalogue = read('data/shows/index.json')
    evidence = {r['slug']: r for r in read('docs/ranking-ledger/review-evidence.json')}
    findings = read('docs/ranking-ledger/editorial-findings.json')
    corrections = read('data/catalogue-corrections.json')
    withheld = {r['slug']: r['reason'] for r in corrections['withheldReviews']}
    for finding in findings:
        if finding['status'] == 'verified-premise-mismatch':
            for slug in finding['slugs']:
                withheld[slug] = finding['finding']
    migrated = 0
    for show in catalogue['shows']:
        if 'assessment' in show:
            continue
        slug = show['slug']
        source = evidence.get(slug, {})
        match = re.search(r'\(S(\d+)(?:[-–](\d+))?\)', show['title'], re.I)
        scope = ('Seasons ' + match[1] + '–' + match[2] if match and match[2]
                 else 'Season ' + match[1] if match else 'Recorded episode run')
        relevant = [f for f in findings if slug in f['slugs']]
        review_blocked = slug in withheld or any(f['status'] in (
            'identity-mixing-in-review', 'factual-verification-queue', 'factual-or-source-conflict-queue'
        ) for f in relevant)
        dimensions = {}
        for key in KEYS:
            paragraphs = source.get('explanations', {}).get(key, [])
            # Keep one complete paragraph, rather than inventing a modern justification.
            excerpt = paragraphs[0] if paragraphs else None
            dimensions[key] = {
                'reason': None,
                'archive': {
                    'ratings': source.get('categoryValues', {}).get(key, []),
                    'excerpt': excerpt,
                },
            }
        assessment = {
            'version': 1,
            'rubricVersion': '2026-10',
            'status': 'withheld' if slug in withheld else 'legacy',
            'catalogueAsOf': catalogue['lastUpdated'],
            'evidenceCheckedAt': DATE,
            'scope': {'label': scope, 'status': 'named' if match else 'unrecorded'},
            'review': {
                'path': 'docs/shows/' + slug + '.html',
                'status': 'withheld' if review_blocked else 'archived',
                'note': withheld.get(slug) or (
                    'The archived commentary has unresolved programme or factual inconsistencies.' if review_blocked
                    else 'Historical notes have not been reverified. They may describe different ratings or seasons.'),
                'sources': list(dict.fromkeys(f['source'] for f in relevant if f.get('source'))),
            },
            'dimensions': dimensions,
            'issues': [{'id': f['id'], 'kind': f['status'], 'note': f['finding']} for f in relevant],
        }
        if slug == 'lost':
            assessment['provenanceNote'] = 'The starting payoff rating of 1 is preserved from the saved 16 February 2026 assessment. It is not an automatic penalty for an ambiguous ending.'
        if slug in withheld:
            show['reviewStatus'] = 'premise-mismatch'
        show['assessment'] = assessment
        migrated += 1

    museum = next(s for s in catalogue['shows'] if s['slug'] == 'museum-of-innocence')
    if museum['episodes'] == 8:
        museum['episodes'] = 9
        corrections['corrections'].append({
            'title': museum['title'], 'slug': museum['slug'], 'type': 'episode-count',
            'source': 'https://about.netflix.com/en/news/the-wait-is-finally-over-museum-of-innocence-premiering-on-netflix',
            'checkedAt': DATE, 'before': {'episodes': 8}, 'after': {'episodes': 9},
        })
    for slug, reason in withheld.items():
        if not any(r['slug'] == slug for r in corrections['withheldReviews']):
            corrections['withheldReviews'].append({'slug': slug, 'reason': reason})
    catalogue['assessmentSchemaVersion'] = 1
    catalogue['evidenceUpdated'] = DATE
    write('data/shows/index.json', catalogue)
    write('data/catalogue-corrections.json', corrections)
    # Retained compatibility catalogue: numerical inputs remain synchronised;
    # assessment prose has one authoring location in data/shows/index.json.
    master = read('data/core/ranked.json')
    for record in master['shows']:
        if record['slug'] == museum['slug']:
            record['episodes'] = museum['episodes']
    write('data/core/ranked.json', master)
    print(json.dumps({'migrated': migrated, 'withheld': sorted(withheld), 'subjectiveRatingsChanged': 0}))


if __name__ == '__main__':
    migrate()
