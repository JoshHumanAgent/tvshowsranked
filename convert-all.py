#!/usr/bin/env python3
"""
Complete TV Show HTML Converter
Properly extracts content and converts to new format
"""

import json
import re
import os

SHOWS_DIR = r"C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked\docs\shows"
INDEX_PATH = r"C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked\data\shows\index.json"

NEW_CSS = """.rankings-section { margin-bottom: 2rem; }
.rankings-header { text-align: center; margin-bottom: 2.5rem; }
.rankings-title { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.75rem; }
.rankings-subtitle { color: var(--text-dim); font-size: 1.1rem; }
.dimension-grid { display: grid; gap: 1.5rem; }
.dimension-block { background: rgba(30,30,30,0.8); border-radius: 12px; padding: 2rem; border: 1px solid rgba(255,255,255,0.1); display: grid; grid-template-columns: auto 1fr; gap: 1.5rem; }
.dimension-score { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-width: 100px; }
.score-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem; position: relative; }
.score-circle::before { content: ''; position: absolute; inset: -3px; border-radius: 50%; background: conic-gradient(var(--primary) calc(var(--score) * 10%), var(--dark) 0); z-index: -1; }
.score-circle::after { content: ''; position: absolute; inset: 0; border-radius: 50%; background: rgba(30,30,30,0.8); }
.score-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }
.dimension-content h3 { font-size: 1.4rem; margin-bottom: 0.75rem; }"""

DIMENSIONS = [
    ("char", "Characters", "characters"),
    ("world", "World Building", "world"),
    ("cine", "Cinematography", "cinematography"),
    ("spect", "Visual Spectacle", "visual"),
    ("conc", "Conceptual Density", "concept"),
    ("drive", "Narrative Drive", "narrative"),
    ("resol", "Resolution", "resolution"),
]

SLUG_MAP = {
    "watchmen.html": "watchmen-2019",
}

def load_scores():
    with open(INDEX_PATH, 'r') as f:
        data = json.load(f)
    scores = {}
    for show in data['shows']:
        scores[show['slug']] = {
            'char': show.get('char', 0),
            'world': show.get('world', 0),
            'cine': show.get('cine', 0),
            'spect': show.get('spect', 0),
            'conc': show.get('conc', 0),
            'drive': show.get('drive', 0),
            'resol': show.get('resol', 0),
        }
    return scores

def extract_beef_content(html):
    """Extract content from beef-style HTML with .dimension classes."""
    contents = {}
    
    # Find the Why It Ranks section
    match = re.search(r'Why It Ranks.*?</h2>>(.*?)</section>', html, re.DOTALL | re.IGNORECASE)
    if not match:
        print("    No 'Why It Ranks' section found")
        return contents
    
    section = match.group(1)
    
    # Extract each dimension block
    dim_pattern = r'</div>\s*<div class="dimension ([^"]+)"[^>]*><div class="dimension-header"[^>]*>.*?</div><div class="dimension-content"[^>]*>(.*?)</div>\s*(?:<div class="strengths"|</div>\s*(?:<div class="dimension|\s*</section>))'
    
    dim_map = {
        'characters': 'char',
        'world': 'world', 
        'cinematography': 'cine',
        'visual': 'spect',
        'concept': 'conc',
        'narrative': 'drive',
        'resolution': 'resol'
    }
    
    # Find all dimension blocks
    blocks = re.findall(r'<div class="dimension ([^"]+)"[^>]*>.*?</div>\s*<div class="dimension-content"[^>]*>(.*?)</div>(?=\s*(?:<div class="strengths"|</div>))', section, re.DOTALL | re.IGNORECASE)
    
    for dim_class, content in blocks:
        for key, mapped in dim_map.items():
            if key in dim_class.lower():
                contents[mapped] = content.strip()
                print(f"    Found {mapped}: {len(content)} chars")
                break
    
    return contents

def extract_godless_content(html):
    """Extract content from godless-style HTML with numbered titles."""
    contents = {}
    
    dim_map = {
        'characters': 'char',
        'world': 'world',
        'cinematography': 'cine', 
        'visual': 'spect',
        'spectacle': 'spect',
        'concept': 'conc',
        'narrative': 'drive',
        'resolution': 'resol'
    }
    
    # Pattern for dimension blocks
    pattern = r'<span class="dimension-title"[^>]*>[^<]*(?:\d+\.\s*)?([^<]+).*?<div class="dimension-content"[^>]*>(.*?)</div>\s*</div>'
    
    matches = re.finditer(pattern, html, re.DOTALL | re.IGNORECASE)
    for match in matches:
        title = match.group(1).lower()
        content = match.group(2).strip()
        
        for key, mapped in dim_map.items():
            if key in title:
                contents[mapped] = content
                print(f"    Found {mapped}: {len(content)} chars")
                break
    
    return contents

def extract_andor_content(html):
    """Extract from andor-style HTML with section-title -> card pattern."""
    contents = {}
    
    patterns = [
        (r'Character Analysis.*?Score.*?\u003c/div\u003e.*?\u003cdiv class="card"\u003e(.*?)\u003c/div\u003e\s*(?=\u003ch2 class="section-title"|Resolution|Final Verdict|\u003cdiv class="sidebar")', 'char'),
        (r'World-?Building.*?Score.*?\u003c/div\u003e.*?\u003cdiv class="card"\u003e(.*?)\u003c/div\u003e\s*(?=\u003ch2 class="section-title"|Cinematography)', 'world'),
        (r'Cinematography.*?Score.*?\u003c/div\u003e.*?\u003cdiv class="card"\u003e(.*?)\u003c/div\u003e\s*(?=\u003ch2 class="section-title"|\u003cdiv class="sidebar")', 'cine'),
        (r'Spectacle.*?Score.*?\u003c/div\u003e.*?\u003cdiv class="card"\u003e(.*?)\u003c/div\u003e\s*(?=\u003ch2 class="section-title"|Concept)', 'spect'),
        (r'Concept.*?Themes.*?Score.*?\u003c/div\u003e.*?\u003cdiv class="card"\u003e(.*?)\u003c/div\u003e\s*(?=\u003ch2 class="section-title"|Narrative)', 'conc'),
        (r'Narrative.*?Drive.*?Score.*?\u003c/div\u003e.*?\u003cdiv class="card"\u003e(.*?)\u003c/div\u003e\s*(?=\u003ch2 class="section-title"|Resolution)', 'drive'),
        (r'Resolution.*?Score.*?\u003c/div\u003e.*?\u003cdiv class="card"\u003e(.*?)\u003c/div\u003e\s*(?=\u003ch2 class="section-title"|Final Verdict|\u003cdiv class="sidebar")', 'resol'),
    ]
    
    for pattern, key in patterns:
        match = re.search(pattern, html, re.DOTALL | re.IGNORECASE)
        if match:
            contents[key] = match.group(1).strip()
            print(f"    Found {key}: {len(match.group(1))} chars")
    
    return contents

def extract_dimension_card_content(html):
    """Extract from watchmen-style with dimension-card classes."""
    contents = {}
    
    dim_map = {
        'characters': 'char',
        'world-building': 'world',
        'cinematography': 'cine',
        'visual-spectacle': 'spect',
        'spectacle': 'spect',
        'visual': 'spect',
        'conceptual-density': 'conc',
        'concept': 'conc',
        'narrative-drive': 'drive',
        'narrative': 'drive',
        'resolution': 'resol'
    }
    
    # Pattern for dimension-card blocks
    pattern = r'\u003cdiv class="dimension-card ([^"]+)"[^>]*>.*?\u003cdiv class="dimension-content"[^>]*>(.*?)\u003c/div\u003e\s*\u003c/div\u003e'
    
    matches = re.finditer(pattern, html, re.DOTALL | re.IGNORECASE)
    for match in matches:
        dim_class = match.group(1).lower()
        content = match.group(2).strip()
        
        for key, mapped in dim_map.items():
            if key in dim_class:
                contents[mapped] = content
                print(f"    Found {mapped}: {len(content)} chars")
                break
    
    return contents

def extract_content(html, filename):
    """Try all extraction methods."""
    print(f"  Extracting content from {filename}...")
    
    methods = [
        extract_beef_content,
        extract_godless_content,
        extract_andor_content,
        extract_dimension_card_content,
    ]
    
    for method in methods:
        contents = method(html)
        if contents:
            return contents
    
    print(f"    Warning: Could not extract content from {filename}")
    return {}

def build_new_section(scores, content_map):
    """Build the new Why It Ranks section."""
    lines = [
        '\u003csection class="rankings-section"\u003e',
        '    \u003cdiv class="rankings-header"\u003e',
        '        \u003ch2 class="rankings-title"\u003e🏆 Why It Ranks\u003c/h2\u003e',
        '        \u003cp class="rankings-subtitle"\u003eA detailed breakdown across seven key dimensions\u003c/p\u003e',
        '    \u003c/div\u003e',
        '    \u003cdiv class="dimension-grid"\u003e'
    ]
    
    for key, label, dim_class in DIMENSIONS:
        score = scores.get(key, 0)
        score_display = f"{score:.1f}"
        content = content_map.get(key, '\u003cp\u003eContent to be added.\u003c/p\u003e')
        
        block = f'''
        \u003cdiv class="dimension-block"\u003e
            \u003cdiv class="dimension-score"\u003e
                \u003cdiv class="score-circle" style="--score: {score};"\u003e\u003cspan\u003e{score_display}\u003c/span\u003e\u003c/div\u003e
                \u003cspan class="score-label"\u003e{label.upper()}\u003c/span\u003e
            \u003c/div\u003e
            \u003cdiv class="dimension-content"\u003e
                \u003ch3\u003e{label}\u003c/h3\u003e
                {content}
            \u003c/div\u003e
        \u003c/div\u003e'''
        lines.append(block)
    
    lines.append('    \u003c/div\u003e')
    lines.append('\u003c/section\u003e')
    
    return '\n'.join(lines)

def add_css(html):
    """Add the new CSS."""
    if '.rankings-section' in html:
        return html
    html = html.replace('\u003c/style\u003e', f'{NEW_CSS}\n\u003c/style\u003e')
    return html

def convert_file(filename, scores):
    """Convert a single file."""
    filepath = os.path.join(SHOWS_DIR, filename)
    slug = SLUG_MAP.get(filename, filename.replace('.html', ''))
    
    print(f"Processing: {filename} (slug: {slug})")
    
    if slug not in scores:
        print(f"  ERROR: No scores for {slug}")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Add CSS
    html = add_css(html)
    
    # Extract content
    content_map = extract_content(html, filename)
    
    # Build new section
    new_section = build_new_section(scores[slug], content_map)
    
    # Replace old section
    # Try patterns to find and replace the Why It Ranks section
    patterns = [
        # Pattern 1: beef-style section
        r'(\u003csection class="section"\u003e\s*)?\u003ch2 class="section-title"\u003eWhy It Ranks\u003c/h2\u003e.*?(\u003cdiv class="dimension characters".*?)\u003c/section\u003e\s*(?=\u003csection class="final-score-block")',
        # Pattern 2: godless-style
        r'\u003ch2\u003eThe Seven Dimensions\u003c/h2\u003e.*?(\u003cdiv class="dimension".*?){7}\u003c/section\u003e',
        # Pattern 3: watchmen-style ranking-section
        r'\u003csection class="ranking-section"\u003e\u003ch2\u003eWhy It Ranks\u003c/h2\u003e.*?\u003c/div\u003e\s*\u003c/div\u003e\s*(?=\u003csection class="final-score-section")',
    ]
    
    replaced = False
    for pattern in patterns:
        match = re.search(pattern, html, re.DOTALL | re.IGNORECASE)
        if match:
            start = match.start()
            end = match.end()
            html = html[:start] + new_section + '\n\n' + html[end:]
            replaced = True
            print(f"  [OK] Replaced using pattern")
            break
    
    if not replaced:
        print(f"  Warning: Could not find section to replace")
        # Try inserting before final-score
        match = re.search(r'(\u003csection class="final-score-block"|\u003csection class="final-score-section")', html)
        if match:
            html = html[:match.start()] + new_section + '\n\n' + html[match.start():]
            print(f"  [OK] Inserted before final-score")
        else:
            print(f"  ERROR: Cannot insert")
            return False
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print(f"  [DONE]")
    return True

def main():
    files = [
        "andor.html", "beef.html", "big-little-lies.html", "broadchurch.html",
        "foundation.html", "generation-kill.html", "godless.html", "narcos.html",
        "pose.html", "the-pacific.html", "the-wire.html",
        "twin-peaks-the-return.html", "watchmen.html", "westworld.html", "when-they-see-us.html"
    ]
    
    scores = load_scores()
    print(f"Loaded scores for {len(scores)} shows\n")
    
    success = 0
    for filename in files:
        if convert_file(filename, scores):
            success += 1
    
    print(f"\nConverted {success}/{len(files)} files")

if __name__ == "__main__":
    main()
