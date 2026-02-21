#!/usr/bin/env python3
"""Comprehensive TV Show HTML Converter - handles multiple formats."""
import re
import json
import os

SHOWS_DIR = r"C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked\docs\shows"
INDEX_PATH = r"C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked\data\shows\index.json"

CSS = """.rankings-section { margin-bottom: 2rem; }
.rankings-header { text-align: center; margin-bottom: 2.5rem; }
.rankings-title { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.75rem; }
.rankings-subtitle { color: var(--text-dim); font-size: 1.1rem; }
.dimension-grid { display: grid; gap: 1.5rem; }
.dimension-block { background: rgba(30,30,30,0.8); border-radius: 12px; padding: 2rem; border: 1px solid rgba(255,255,255,0.1); display: grid !important; grid-template-columns: auto 1fr !important; gap: 1.5rem; }
.dimension-score { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-width: 100px; }
.score-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem; position: relative; }
.score-circle::before { content: ''; position: absolute; inset: -3px; border-radius: 50%; background: conic-gradient(var(--primary) calc(var(--score) * 10%), var(--dark) 0); z-index: -1; }
.score-circle::after { content: ''; position: absolute; inset: 0; border-radius: 50%; background: rgba(30,30,30,0.8); }
.score-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }
.dimension-content h3 { font-size: 1.4rem; margin-bottom: 0.75rem; }"""

DIMS = [('char', 'Characters'), ('world', 'World Building'), ('cine', 'Cinematography'), ('spect', 'Visual Spectacle'), ('conc', 'Conceptual Density'), ('drive', 'Narrative Drive'), ('resol', 'Resolution')]

def load_scores():
    with open(INDEX_PATH) as f:
        data = json.load(f)
    scores = {}
    for show in data['shows']:
        slug = show['slug']
        scores[slug] = {k: show.get(k, 0) for k, _ in DIMS}
    return scores

def extract_beef(html):
    """Extract from beef-style: <div class="dimension characters">..."""
    contents = {}
    section = re.search(r'Why It Ranks.*?</h2>(\s*<div class="dimension)', html, re.I | re.S)
    if not section:
        return contents
    
    dim_map = {'characters': 'char', 'world': 'world', 'cinematography': 'cine', 'visual': 'spect', 'concept': 'conc', 'narrative': 'drive', 'resolution': 'resol'}
    
    for cls, key in dim_map.items():
        pattern = rf'<div class="dimension {cls}"[^>]*>.*?<div class="dimension-content"[^>]*>(.*?</div>)\s*(?=<div class="strengths"|</div>\s*<div class="dimension|\s*</section>)'
        m = re.search(pattern, html, re.I | re.S)
        if m:
            contents[key] = m.group(1).strip()
    return contents

def extract_big_little_lies(html):
    """Extract from big-little-lies style: <div class="dimension-block"> with <span class="dimension-name">"""
    contents = {}
    
    # Get the Why It Ranks section
    section_match = re.search(r'Why It Ranks.*?</div>\s*</div>\s*<div class="section-content">(\s*<p>.*?</p>)?\s*<div class="dimension-grid">(.*?)</div>\s*</div>\s*</div>', html, re.I | re.S)
    if not section_match:
        return contents
    
    section = section_match.group(2) if section_match.group(2) else ""
    
    dim_map = {'character': 'char', 'world': 'world', 'cinematography': 'cine', 'visual': 'spect', 'spects': 'spect', 'concept': 'conc', 'narrative': 'drive', 'resolution': 'resol'}
    
    # Find all dimension-block elements
    blocks = re.findall(r'<div class="dimension-block[^"]*"[^>]*>.*?(<span class="dimension-name"[^>]*>([^<]*)</span>).*?<div class="dimension-content"[^>]*>(.*?)</div>.*?</div>', section, re.I | re.S)
    
    for _, name, content in blocks:
        name_lower = name.lower()
        for key, mapped in dim_map.items():
            if key in name_lower and mapped not in contents:
                contents[mapped] = content.strip()
                break
    
    return contents

def extract_godless(html):
    """Extract from godless style: <span class="dimension-title">1. Characters & Performance..."""
    contents = {}
    
    dim_map = {'characters': 'char', 'world': 'world', 'cinematography': 'cine', 'visual': 'spect', 'spectacle': 'spect', 'concept': 'conc', 'narrative': 'drive', 'resolution': 'resol'}
    
    for keyword, key in dim_map.items():
        pattern = rf'<span class="dimension-title"[^>]*>[^/]*{keyword}.*?</div class="dimension-header"[^>]*>.*?<span class="dimension-score"[^>]*>[^/]*?</span>.*?</div>.*?<div class="dimension-content"[^>]*>(.*?)</div>\s*</div>'
        m = re.search(pattern, html, re.I | re.S)
        if m:
            contents[key] = m.group(1).strip()
    return contents

def extract_andor(html):
    """Extract from andor style: <h2 class="section-title">Character Analysis: Score X/10</h2><div class="card">..."""
    contents = {}
    
    patterns = [
        (r'Character.*?Analysis.*?<div class="card"[^>]*>(.*?</div>)\s*(?=<h2 class="section-title"|<div class="sidebar")', 'char'),
        (r'World-?Building.*?<div class="card"[^>]*>(.*?</div>)\s*(?=<h2 class="section-title")', 'world'),
        (r'Cinematography.*?<div class="card"[^>]*>(.*?</div>)\s*(?=<h2 class="section-title")', 'cine'),
        (r'Spectacle.*?<div class="card"[^>]*>(.*?</div>)\s*(?=<h2 class="section-title")', 'spect'),
        (r'Concept.*?Themes.*?<div class="card"[^>]*>(.*?</div>)\s*(?=<h2 class="section-title")', 'conc'),
        (r'Narrative.*?Drive.*?<div class="card"[^>]*>(.*?</div>)\s*(?=<h2 class="section-title")', 'drive'),
        (r'Resolution.*?Score.*?<div class="card"[^>]*>(.*?</div>)\s*(?=<h2 class="section-title"|<div class="sidebar")', 'resol'),
    ]
    
    for pattern, key in patterns:
        m = re.search(pattern, html, re.I | re.S)
        if m:
            contents[key] = m.group(1).strip()
    return contents

def extract_watchmen(html):
    """Extract from watchmen style: <div class="dimension-card">..."""
    contents = {}
    
    dim_map = {'characters': 'char', 'world-building': 'world', 'cinematography': 'cine', 'visual-spectacle': 'spect', 'conceptual-density': 'conc', 'narrative-drive': 'drive', 'resolution': 'resol'}
    
    for cls, key in dim_map.items():
        pattern = rf'<div class="dimension-card {cls}"[^>]*>.*?<div class="dimension-content"[^>]*>(.*?</div>)\s*</div>'
        m = re.search(pattern, html, re.I | re.S)
        if m:
            contents[key] = m.group(1).strip()
    return contents

def extract_content(html, filename):
    """Try all extraction methods."""
    methods = [
        ('beef', extract_beef),
        ('big-little-lies', extract_big_little_lies),
        ('godless', extract_godless),
        ('andor', extract_andor),
        ('watchmen', extract_watchmen),
    ]
    
    for name, method in methods:
        contents = method(html)
        if contents:
            print(f"    Using {name} extractor: {len(contents)} dims")
            return contents
    
    print("    No content extracted")
    return {}

def build_section(scores, contents):
    lines = ['<section class="rankings-section">', '    <div class="rankings-header">', '        <h2 class="rankings-title">🏆 Why It Ranks</h2>', '        <p class="rankings-subtitle">A detailed breakdown across seven key dimensions</p>', '    </div>', '    <div class="dimension-grid">']
    
    for key, label in DIMS:
        score = scores.get(key, 0)
        content = contents.get(key, '<p>Content to be added.</p>')
        lines.append(f'''
        <div class="dimension-block">
            <div class="dimension-score">
                <div class="score-circle" style="--score: {score};"><span>{score:.1f}</span></div>
                <span class="score-label">{label.upper()}</span>
            </div>
            <div class="dimension-content">
                <h3>{label}</h3>
                {content}
            </div>
        </div>''')
    
    lines.extend(['    </div>', '</section>'])
    return '\n'.join(lines)

def convert_file(filename, scores):
    print(f"\nProcessing: {filename}")
    
    filepath = os.path.join(SHOWS_DIR, filename)
    slug = filename.replace('.html', '')
    
    if slug not in scores:
        print(f"  ERROR: No scores for {slug}")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Add CSS if needed
    if '.rankings-section' not in html:
        pos = html.rfind('</style>')
        if pos != -1:
            html = html[:pos] + CSS + '\n\n' + html[pos:]
            print("  CSS added")
    
    # Extract content
    contents = extract_content(html, filename)
    
    # Build new section
    new_section = build_section(scores[slug], contents)
    
    # Replace old section - try multiple patterns
    patterns = [
        # Pattern 1: Beef-style section
        r'<section class="section">\s*<h2 class="section-title">Why It Ranks</h2>.*?</section>\s*(?=<section class="final-score-block")',
        # Pattern 2: Big-little-lies style
        r'<!-- Why It Ranks Section -->\s*<div class="section">.*?</div>\s*</div>\s*(?=<!-- Final|Final Verdict|<div class="final-score-section")',
        # Pattern 3: Godless style
        r'<section>\s*<h2>The Seven Dimensions</h2>.*?</section>',
    ]
    
    replaced = False
    for i, pattern in enumerate(patterns):
        m = re.search(pattern, html, re.I | re.S)
        if m:
            html = html[:m.start()] + new_section + '\n\n' + html[m.end():]
            print(f"  Replaced (pattern {i+1})")
            replaced = True
            break
    
    if not replaced:
        # Try inserting before final score section
        m = re.search(r'(<section class="final-score-block"|<div class="final-score-section"|<!-- Final)', html, re.I)
        if m:
            html = html[:m.start()] + new_section + '\n\n' + html[m.start():]
            print("  Inserted before final")
            replaced = True
    
    if not replaced:
        print("  ERROR: Could not insert")
        return False
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print("  [DONE]")
    return True

def main():
    scores = load_scores()
    print(f"Loaded scores for {len(scores)} shows\n")
    
    files = [
        "beef.html", "big-little-lies.html", "broadchurch.html", "foundation.html",
        "generation-kill.html", "godless.html", "narcos.html", "pose.html",
        "the-pacific.html", "the-wire.html", "twin-peaks-the-return.html",
        "westworld.html", "when-they-see-us.html"
    ]
    
    success = 0
    for f in files:
        if convert_file(f, scores):
            success += 1
    
    print(f"\n=== Converted {success}/{len(files)} files ===")

if __name__ == "__main__":
    main()
