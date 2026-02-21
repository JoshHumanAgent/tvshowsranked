#!/usr/bin/env python3
"""Specific fix for andor.html structure."""

import re

filepath = r"C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked\docs\shows\andor.html"

SCORES = {
    'char': 7.5,
    'world': 9.0,
    'cine': 8.0,
    'spect': 9.0,
    'conc': 8.0,
    'drive': 7.5,
    'resol': 8.0
}

DIMENSIONS = [
    {"key": "char", "label": "Characters"},
    {"key": "world", "label": "World Building"},
    {"key": "cine", "label": "Cinematography"},
    {"key": "spect", "label": "Visual Spectacle"},
    {"key": "conc", "label": "Conceptual Density"},
    {"key": "drive", "label": "Narrative Drive"},
    {"key": "resol", "label": "Resolution"},
]

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

with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

# Add CSS if not present
if '.rankings-section' not in html:
    html = html.replace('</style>', NEW_CSS + '\n</style>')

# Extract the section-title cards for each dimension
content_map = {}

# Pattern to match each <h2 class="section-title">...Score X/10</h2> followed by <div class="card">...content...</div>
dim_patterns = [
    (r'Character Analysis.*?Score[:\s]+([\d.]+)(/10)?.*?<div class="card"[^>]*>(.*?</div>)\s*(?=<h2 class="section-title"|<div class="sidebar")', 'char'),
    (r'World-Building.*?Score[:\s]+([\d.]+)(/10)?.*?<div class="card"[^>]*>(.*?</div>)\s*(?=<h2 class="section-title"|<div class="sidebar")', 'world'),
    (r'Cinematography.*?Score[:\s]+([\d.]+)(/10)?.*?<div class="card"[^>]*>(.*?</div>)\s*(?=<h2 class="section-title"|<div class="sidebar")', 'cine'),
    (r'Spectacle.*?Score[:\s]+([\d.]+)(/10)?.*?<div class="card"[^>]*>(.*?</div>)\s*(?=<h2 class="section-title"|<div class="sidebar")', 'spect'),
    (r'Concept.*?Themes.*?Score[:\s]+([\d.]+)(/10)?.*?<div class="card"[^>]*>(.*?</div>)\s*(?=<h2 class="section-title"|<div class="sidebar")', 'conc'),
    (r'Narrative.*?Drive.*?Score[:\s]+([\d.]+)(/10)?.*?<div class="card"[^>]*>(.*?</div>)\s*(?=<h2 class="section-title"|<div class="sidebar")', 'drive'),
    (r'Resolution.*?Payoff.*?Score[:\s]+([\d.]+)(/10)?.*?<div class="card"[^>]*>(.*?</div>)\s*(?=<h2 class="section-title"|<div class="sidebar")', 'resol'),
]

for pattern, key in dim_patterns:
    match = re.search(pattern, html, re.DOTALL | re.IGNORECASE)
    if match:
        content_map[key] = match.group(3).strip()
        print(f"  Found {key}: {len(match.group(3))} chars")

print(f"Extracted {len(content_map)} dimensions")

# Build new rankings section
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
    score = SCORES[key]
    score_display = f"{score:.1f}"
    content = content_map.get(key, '<p>Details coming soon.</p>')
    
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

new_rankings = '\n'.join(html_parts)

# Find and remove the old section-title cards for the dimensions
# Pattern: from Character Analysis through Resolution, wrapping everything
old_pattern = r'(<h2 class="section-title">Character Analysis.*?Score.*?10</h2><div class="card">.*?</div>.*?<h2 class="section-title">Resolution.*?Payoff.*?Score.*?10</h2><div class="card">.*?</div>)'

match = re.search(old_pattern, html, re.DOTALL | re.IGNORECASE)
if match:
    # Replace the old content with new rankings section
    new_html = html[:match.start()] + new_rankings + '\n\n' + html[match.end():]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_html)
    print("[OK] Successfully converted andor.html")
else:
    print("Warning: Could not find old pattern")
    # Try simpler approach - insert before sidebar
    sidebar_match = re.search(r'(<div class="sidebar">)', html)
    if sidebar_match:
        # Find Character Analysis section
        char_match = re.search(r'(<h2 class="section-title">Character Analysis)', html)
        if char_match:
            # Remove all the section-title cards for dimensions and insert new rankings
            # Find end of Resolution section
            res_end = re.search(r'Resolution.*?Payoff.*?Score.*?10.*?(</div>.*?)(?=<h2 class="section-title"|</div>\s*</div class="sidebar")', html, re.DOTALL | re.IGNORECASE)
            if res_end:
                end_pos = res_end.end(1)
                new_html = html[:char_match.start()] + new_rankings + '\n\n' + html[end_pos:]
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_html)
                print("[OK] Successfully converted andor.html (alt method)")
            else:
                print("Error: Could not find Resolution section end")
        else:
            print("Error: Could not find Character Analysis section")
    else:
        print("Error: Could not find sidebar")
