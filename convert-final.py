#!/usr/bin/env python3
"""Convert TV show HTML files to new format."""
import re
import json
import os

SHOWS_DIR = r"C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked\docs\shows"
INDEX_PATH = r"C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked\data\shows\index.json"

# Mapping of dimension keys to labels
DIMS = {
    'char': 'Characters',
    'world': 'World Building', 
    'cine': 'Cinematography',
    'spect': 'Visual Spectacle',
    'conc': 'Conceptual Density',
    'drive': 'Narrative Drive',
    'resol': 'Resolution'
}

# New CSS to add
CSS = '''.rankings-section { margin-bottom: 2rem; }
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
.dimension-content h3 { font-size: 1.4rem; margin-bottom: 0.75rem; }'''

def load_scores():
    with open(INDEX_PATH) as f:
        data = json.load(f)
    scores = {}
    for show in data['shows']:
        scores[show['slug']] = {k: show.get(k, 0) for k in DIMS.keys()}
    return scores

def extract_beef_dimensions(html):
    """Extract content from beef-style HTML."""
    contents = {}
    
    # Find the Why It Ranks section
    section_match = re.search(r'Why It Ranks.*?</h2>(.*?)<section class="final-score-block"', html, re.DOTALL | re.I)
    if not section_match:
        return contents
    
    section = section_match.group(1)
    
    # Extract each dimension block
    # Pattern: <div class="dimension characters">...<div class="dimension-content">CONTENT</div>
    dim_map = {
        'characters': 'char',
        'world': 'world',
        'cinematography': 'cine',
        'visual': 'spect',
        'concept': 'conc',
        'narrative': 'drive',
        'resolution': 'resol'
    }
    
    # Find each dimension block
    for dim_class, key in dim_map.items():
        pattern = rf'<div class="dimension {dim_class}"[^>]*>.*?<div class="dimension-content"[^>]*>(.*?)</div>\s*(?:<div class="strengths"|</div>\s*<div class="dimension |</div>\s*</section>)'
        match = re.search(pattern, section, re.DOTALL | re.I)
        if match:
            contents[key] = match.group(1).strip()
    
    return contents

def build_new_section(scores, contents):
    """Build new rankings section."""
    lines = [
        '<section class="rankings-section">',
        '    <div class="rankings-header">',
        '        <h2 class="rankings-title">🏆 Why It Ranks</h2>',
        '        <p class="rankings-subtitle">A detailed breakdown across seven key dimensions</p>',
        '    </div>',
        '    <div class="dimension-grid">'
    ]
    
    for key, label in DIMS.items():
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
    
    # Add CSS before closing </style>
    if '.rankings-section' not in html and 'rankings-title' not in html:
        # Find last </style> and insert before it
        last_style = html.rfind('</style>')
        if last_style != -1:
            html = html[:last_style] + CSS + '\n\n' + html[last_style:]
            print("  Added CSS")
    
    # Extract content
    contents = extract_beef_dimensions(html)
    print(f"  Extracted {len(contents)} dimensions")
    
    # Build new section
    new_section = build_new_section(scores[slug], contents)
    
    # Replace old section
    old_pattern = r'<section class="section">\s*<h2 class="section-title">Why It Ranks</h2>.*?</section>\s*(?=<section class="final-score-block")'
    match = re.search(old_pattern, html, re.DOTALL | re.I)
    
    if match:
        html = html[:match.start()] + new_section + '\n\n' + html[match.end():]
        print("  Replaced section")
    else:
        print("  Could not find section to replace")
        return False
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    
    print("  [DONE]")
    return True

def main():
    scores = load_scores()
    print(f"Loaded scores for {len(scores)} shows\n")
    
    files = [
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
        "westworld.html",
        "when-they-see-us.html",
    ]
    
    success = 0
    for f in files:
        if convert_file(f, scores):
            success += 1
    
    print(f"\n=== Converted {success}/{len(files)} files ===")

if __name__ == "__main__":
    main()
