#!/usr/bin/env python3
"""
TV Show HTML Converter v2
Handles multiple HTML structures
"""

import json
import re
import os
import html

SHOWS_DIR = r"C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked\docs\shows"
INDEX_PATH = r"C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked\data\shows\index.json"

# New CSS to add
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
    {"key": "char", "label": "Characters"},
    {"key": "world", "label": "World Building"},
    {"key": "cine", "label": "Cinematography"},
    {"key": "spect", "label": "Visual Spectacle"},
    {"key": "conc", "label": "Conceptual Density"},
    {"key": "drive", "label": "Narrative Drive"},
    {"key": "resol", "label": "Resolution"},
]

# Map filenames to index slugs
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
            'final': show.get('final', 0)
        }
    return scores

def extract_dimensions_from_beef_format(html):
    """Extract from beef-style format with <div class="dimension characters"> blocks."""
    content_map = {}
    key_map = {
        'characters': 'char',
        'world': 'world',
        'cinematography': 'cine',
        'visual': 'spect',
        'concept': 'conc',
        'narrative': 'drive',
        'resolution': 'resol'
    }
    
    # Find dimensions in beef format
    pattern = r'<div class="dimension ([^"]+)"[^>]*>.*?<div class="dimension-content"[^>]*>(.*?)</div>\s*(?:<div class="strengths"|</div>\s*<div class="dimension|\s*</section>)'
    matches = re.finditer(pattern, html, re.DOTALL | re.IGNORECASE)
    
    for match in matches:
        dim_class = match.group(1).lower()
        dim_content = match.group(2).strip()
        
        for key, mapped in key_map.items():
            if key in dim_class:
                content_map[mapped] = dim_content
                break
    
    return content_map

def extract_dimensions_from_godless_format(html):
    """Extract from godless-style format with numbered titles."""
    content_map = {}
    
    # Pattern: 1. Characters & Performance, 2. World Building & Setting, etc.
    section_pattern = r'<span class="dimension-title">\d+\.\s*([\w\s&]+)</span>.*?<div class="dimension-content">(.*?)</div>\s*</div>'
    matches = re.finditer(section_pattern, html, re.DOTALL | re.IGNORECASE)
    
    key_map = {
        'characters': 'char',
        'world': 'world',
        'cinematography': 'cine',
        'visual': 'spect',
        'spectacle': 'spect',
        'concept': 'conc',
        'narrative': 'drive',
        'resolution': 'resol'
    }
    
    for match in matches:
        title = match.group(1).lower()
        content = match.group(2).strip()
        
        for key, mapped in key_map.items():
            if key in title:
                content_map[mapped] = content
                break
    
    return content_map

def extract_dimensions_from_card_format(html):
    """Extract from andor-style format with <h2 class="section-title"> blocks."""
    content_map = {}
    
    # Pattern: <h2 class="section-title">Character Analysis: Score X/10</h2> followed by content
    # Find sections like Character Analysis, World Building, etc.
    section_patterns = [
        (r'Character.*?Analysis.*?Score[:\s]+([\d.]+).*?<div class="card">(.*?)</div>\s*(?=<h2 class="section-title"|<section)', 'char'),
        (r'World.*?Building.*?Score[:\s]+([\d.]+).*?<div class="card">(.*?)</div>\s*(?=<h2 class="section-title"|<section)', 'world'),
        (r'Cinematography.*?Score[:\s]+([\d.]+).*?<div class="card">(.*?)</div>\s*(?=<h2 class="section-title"|<section)', 'cine'),
        (r'Spectacle.*?Score[:\s]+([\d.]+).*?<div class="card">(.*?)</div>\s*(?=<h2 class="section-title"|<section)', 'spect'),
        (r'Concept.*?Themes.*?Score[:\s]+([\d.]+).*?<div class="card">(.*?)</div>\s*(?=<h2 class="section-title"|<section)', 'conc'),
        (r'Narrative.*?Drive.*?Score[:\s]+([\d.]+).*?<div class="card">(.*?)</div>\s*(?=<h2 class="section-title"|<section)', 'drive'),
        (r'Resolution.*?Score[:\s]+([\d.]+).*?<div class="card">(.*?)</div>\s*(?=<h2 class="section-title"|<section)', 'resol'),
    ]
    
    for pattern, key in section_patterns:
        match = re.search(pattern, html, re.DOTALL | re.IGNORECASE)
        if match:
            content_map[key] = match.group(2).strip()
    
    return content_map

def extract_dimensions_from_dimension_card(html):
    """Extract from watchmen-style format with dimension-card classes."""
    content_map = {}
    
    # Pattern: <div class="dimension-card characters">
    key_map = {
        'characters': 'char',
        'world-building': 'world',
        'cinematography': 'cine',
        'visual-spectacle': 'spect',
        'visual': 'spect',
        'conceptual-density': 'conc',
        'concept': 'conc',
        'narrative-drive': 'drive',
        'narrative': 'drive',
        'resolution': 'resol'
    }
    
    pattern = r'<div class="dimension-card ([^"]+)"[^>]*>.*?<div class="dimension-content">(.*?)</div>\s*</div>'
    matches = re.finditer(pattern, html, re.DOTALL | re.IGNORECASE)
    
    for match in matches:
        dim_class = match.group(1).lower().strip()
        content = match.group(2).strip()
        
        for key, mapped in key_map.items():
            if key in dim_class:
                content_map[mapped] = content
                break
    
    return content_map

def extract_all_content(html):
    """Try all extraction methods and merge results."""
    content_map = {}
    
    # Try different formats
    methods = [
        extract_dimensions_from_beef_format,
        extract_dimensions_from_godless_format,
        extract_dimensions_from_card_format,
        extract_dimensions_from_dimension_card,
    ]
    
    for method in methods:
        extracted = method(html)
        for key, content in extracted.items():
            if key not in content_map or len(content) > len(content_map[key]):
                content_map[key] = content
    
    return content_map

def build_new_section(scores, content_map):
    """Build the new Why It Ranks section."""
    html_parts = [
        '<section class="rankings-section">',
        '    <div class="rankings-header">',
        '        <h2 class="rankings-title">🏆 Why It Ranks</h2>',
        '        <p class="rankings-subtitle">A detailed breakdown across seven key dimensions</p>',
        '    </div>',
        '    <div class="dimension-grid">'
    ]
    
    for dim in DIMENSIONS:
        key = dim['key']
        score = scores.get(key, 0)
        score_display = f"{score:.1f}"
        content = content_map.get(key, '')
        if not content:
            content = '<p>Details coming soon.</p>'
        
        dim_html = f'''
        <div class="dimension-block">
            <div class="dimension-score">
                <div class="score-circle" style="--score: {score};" data-score="{score}"><span>{score_display}</span></div>
                <span class="score-label">{dim["label"].upper()}</span>
            </div>
            <div class="dimension-content">
                <h3>{dim["label"]}</h3>
                {content}
            </div>
        </div>'''
        html_parts.append(dim_html)
    
    html_parts.append('    </div>')
    html_parts.append('</section>')
    
    return '\n'.join(html_parts)

def add_css(html):
    """Add the new CSS to the HTML."""
    if '.rankings-section' in html:
        return html
    
    # Find </style> and insert before it
    html = re.sub(r'(</style>)', NEW_CSS + '\n\n\\1', html, count=1)
    return html

def replace_why_section(html, new_section):
    """Replace Why It Ranks section."""
    # Try multiple patterns
    patterns = [
        # Pattern 1: section with section-title containing Why It Ranks and dimension blocks
        r'<section[^>]*>\s*<h2[^>]*class="[^"]*section-title[^"]*"[^>]*>[^<]*Why It Ranks[^<]*</h2>\s*.*?</section>\s*(?=<section class="final-score-block"|<div class="final-score-block"|<section class="final-score-section")',
        # Pattern 2: rankings-section class
        r'<section[^>]*class="[^"]*rankings-section[^"]*"[^>]*>.*?</section>\s*(?=<section class="final-score|<div class="final-score|</div>\s*</body>)',
        # Pattern 3: section with h2 Why It Ranks, capturing dimensions
        r'<h2[^>]*>[^<]*Why It Ranks[^<]*</h2>.*?<div class="dimension[^"]*"[^>]*>.*?</div>(?:\s*<div class="dimension[^"]*"[^>]*>.*?</div>){6}',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, html, re.DOTALL | re.IGNORECASE)
        if match:
            # Replace matched section with new section
            return html[:match.start()] + new_section + html[match.end():]
    
    # If no pattern matched, try inserting before final-score section
    final_score_match = re.search(r'(<section class="final-score|<div class="final-score)', html, re.IGNORECASE)
    if final_score_match:
        return html[:final_score_match.start()] + new_section + '\n\n' + html[final_score_match.start():]
    
    return html

def convert_file(filename, scores):
    """Convert a single HTML file."""
    filepath = os.path.join(SHOWS_DIR, filename)
    
    # Get the slug from mapping or filename
    slug = SLUG_MAP.get(filename, filename.replace('.html', ''))
    
    print(f"Processing: {filename} (slug: {slug})")
    
    if slug not in scores:
        print(f"  Warning: No scores found for {slug}")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Add CSS if needed
    html = add_css(html)
    
    # Extract existing content
    content_map = extract_all_content(html)
    print(f"  Extracted {len(content_map)} dimensions")
    
    # Build new section
    new_section = build_new_section(scores[slug], content_map)
    
    # Replace old section
    new_html = replace_why_section(html, new_section)
    
    if new_html == html:
        print(f"  Warning: Could not find Why It Ranks section to replace")
        return False
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_html)
    
    print(f"  [OK] Updated: {filename}")
    return True

def main():
    print("=== TV Show HTML Converter v2 ===\n")
    
    scores = load_scores()
    print(f"Loaded scores for {len(scores)} shows from index.json\n")
    
    # List of files to process
    files = [
        "andor.html",
        "beef.html",
        "big-little-lies.html",
        "broadchurch.html",
        "foundation.html",
        "generation-kill.html",
        "godless.html",
        "narcos.html",
        "pose.html",
        "the-pacific.html",
        "the-wire.html",
        "twin-peaks-the-return.html",
        "watchmen.html",
        "westworld.html",
        "when-they-see-us.html"
    ]
    
    success_count = 0
    failed = []
    for filename in files:
        if convert_file(filename, scores):
            success_count += 1
        else:
            failed.append(filename)
    
    print(f"\n=== Conversion Complete ===")
    print(f"Successfully converted {success_count}/{len(files)} files")
    if failed:
        print(f"Failed: {', '.join(failed)}")

if __name__ == "__main__":
    main()
