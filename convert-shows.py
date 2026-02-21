#!/usr/bin/env python3
"""
TV Show HTML Converter
Converts old format to new standardized format with "Why It Ranks" section
"""

import json
import re
import os

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
    {"key": "char", "label": "Characters", "class": "characters"},
    {"key": "world", "label": "World Building", "class": "world"},
    {"key": "cine", "label": "Cinematography", "class": "cinematography"},
    {"key": "spect", "label": "Visual Spectacle", "class": "spectacle"},
    {"key": "conc", "label": "Conceptual Density", "class": "concept"},
    {"key": "drive", "label": "Narrative Drive", "class": "narrative"},
    {"key": "resol", "label": "Resolution", "class": "resolution"},
]

FILES = [
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

def extract_dimension_content(html, dim_class, next_classes):
    """Extract content from a dimension block."""
    # Try various patterns to find dimension content
    patterns = []
    
    # Pattern 1: Standard dimension with class (like class="dimension characters")
    for next_class in next_classes:
        patterns.append(rf'<div class="dimension {dim_class}"[^>]*>.*?<div class="dimension-content"[^>]*>(.*?)</div>\s*(?:<div class="strengths"|</div>\s*<div class="dimension {next_class}"|</div>)')
    
    # Pattern 2: Look for dimension-header followed by content
    for next_class in next_classes:
        patterns.append(rf'<div class="dimension {dim_class}"[^>]*>.*?<span class="dimension-name">[^<]*</span>.*?<span class="dimension-score[^"]*">[^<]*</span>.*?<div class="dimension-content"[^>]*>(.*?)</div>\s*(?:<div class="strengths"|</div>\s*<div class="[^"]*dimension[^"]*"|<section)')
    
    for pattern in patterns:
        match = re.search(pattern, html, re.DOTALL | re.IGNORECASE)
        if match:
            content = match.group(1).strip()
            # Remove any empty lines at start/end
            content = content.strip()
            if content:
                return content
    
    return None

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
                <span class="score-label">{dim['label'].upper()}</span>
            </div>
            <div class="dimension-content">
                <h3>{dim['label']}</h3>
                {content}
            </div>
        </div>'''
        html_parts.append(dim_html)
    
    html_parts.append('    </div>')
    html_parts.append('</section>')
    
    return '\n'.join(html_parts)

def extract_all_dimensions(html):
    """Extract all dimension contents from HTML."""
    content_map = {}
    
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
    
    # Find all dimension blocks with various patterns
    patterns = [
        # Standard dimension blocks
        (r'<div class="dimension ([^"]+)"[^>]*>.*?<span class="dimension-name">[^<]*</span>.*?<span class="dimension-score[^"]*">[^<]*</span>.*?<div class="dimension-content"[^>]*>(.*?)</div>', re.DOTALL | re.IGNORECASE),
        # Alternate pattern
        (r'<div class="dimension ([^"]+)"[^>]*>.*?<div class="dimension-header"[^>]*>.*?<div class="dimension-content"[^>]*>(.*?)</div>', re.DOTALL | re.IGNORECASE),
    ]
    
    for pattern, flags in patterns:
        matches = re.finditer(pattern, html, flags)
        for match in matches:
            dim_class = match.group(1).lower()
            content = match.group(2).strip()
            
            for key, mapped in key_map.items():
                if key in dim_class:
                    content_map[mapped] = content
                    break
    
    return content_map

def add_css(html):
    """Add the new CSS to the HTML."""
    if '.rankings-section' in html:
        return html  # Already has the CSS
    
    # Find </style> and insert before it
    html = re.sub(r'(</style>)', NEW_CSS + '\n\n$1', html, count=1)
    return html

def replace_why_section(html, new_section):
    """Replace the old Why It Ranks section with new one."""
    # Multiple patterns to try, ordered by specificity
    patterns = [
        # Pattern 1: Full section with why it ranks and all dimension blocks
        (r'<section[^>]*class="[^"]*section[^"]*"[^>]*>\s*<h2[^>]*class="[^"]*section-title[^"]*"[^>]*>[^<]*Why It Ranks[^<]*</h2\s*>.*?(?:</section\s*\u003e)(?=\s*<section class="final-score-block"|\s*<div class="final-score-block")', re.DOTALL | re.IGNORECASE),
        # Pattern 2: Section containing Why It Ranks and dimensions
        (r'<section[^>]*>\s*<h2[^>]*>[^<]*Why It Ranks[^<]*</h2\s*>.*?(?:</div\s*>\s*</div\s*>\s*</section\s*\u003e|\u003c/div\s*>\s*</section\s*\u003e)', re.DOTALL | re.IGNORECASE),
        # Pattern 3: Just the h2 and content until dimension blocks end
        (r'<h2[^>]*class="[^"]*section-title[^"]*"[^>]*>[^<]*Why It Ranks[^<]*</h2\s*>.*?(<div class="dimension[^>]*>.*?){7}', re.DOTALL | re.IGNORECASE),
    ]
    
    for pattern, flags in patterns:
        match = re.search(pattern, html, flags)
        if match:
            return html[:match.start()] + new_section + html[match.end():]
    
    return html

def convert_file(filename, scores):
    """Convert a single HTML file."""
    filepath = os.path.join(SHOWS_DIR, filename)
    slug = filename.replace('.html', '')
    
    print(f"Processing: {slug}")
    
    if slug not in scores:
        print(f"  Warning: No scores found for {slug}")
        return False
    
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Add CSS if needed
    html = add_css(html)
    
    # Extract existing content
    content_map = extract_all_dimensions(html)
    
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
    print("=== TV Show HTML Converter ===")
    print(f"Converting {len(FILES)} files to new format\n")
    
    scores = load_scores()
    print(f"Loaded scores for {len(scores)} shows from index.json\n")
    
    success_count = 0
    for filename in FILES:
        if convert_file(filename, scores):
            success_count += 1
    
    print(f"\n=== Conversion Complete ===")
    print(f"Successfully converted {success_count}/{len(FILES)} files")

if __name__ == "__main__":
    main()
