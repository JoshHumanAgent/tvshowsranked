#!/usr/bin/env python3
import re

filepath = r"C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked\docs\shows\beef.html"

SCORES = {'char': 8, 'world': 6.5, 'cine': 8, 'spect': 5, 'conc': 8, 'drive': 9, 'resol': 9}
DIMS = [('char', 'Characters'), ('world', 'World Building'), ('cine', 'Cinematography'), ('spect', 'Visual Spectacle'), ('conc', 'Conceptual Density'), ('drive', 'Narrative Drive'), ('resol', 'Resolution')]

with open(filepath, 'r', encoding='utf-8') as f:
    html = f.read()

print("File loaded, size:", len(html))

# Add CSS if needed
if '.rankings-section' not in html:
    css = '''.rankings-section { margin-bottom: 2rem; }
.rankings-header { text-align: center; margin-bottom: 2.5rem; }
.rankings-title { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.75rem; }
.rankings-subtitle { color: var(--text-dim); font-size: 1.1rem; }
.dimension-grid { display: grid; gap: 1.5rem; }
.dimension-block { background: rgba(30,30,30,0.8); border-radius: 12px; padding: 2rem; border: 1px solid rgba(255,255,255,0.1); display: grid; grid-template-columns: auto 1fr; gap: 1.5rem; }
.dimension-score { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-width: 100px; }
.score-circle { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem; position: relative; }
.score-circle::before { content: ''; position: absolute; inset: -3px; border-radius: 50%; background: conic-gradient(var(--primary) calc(var(--score) * 10%), var(--dark) 0); z-index: -1; }
.score-circle::after { content: ''; position: absolute; inset: 0; border-radius: 50%; background: rgba(30,30,30,0.8); }
.score-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; }'''
    html = html.replace('</style>', css + '\n\n</style>')
    print("CSS added")

# Extract content from dimension blocks
contents = {}
pattern = r'<div class="dimension ([^"]+)">\s*<div class="dimension-header"[^>]*>.*?</div>\s*<div class="dimension-content"[^>]*>(.*?)</div>'

# Find Why It Ranks section
section_match = re.search(r'(Why It Ranks.*?</h2>).*?<div class="dimension', html, re.DOTALL)
if section_match:
    print("Found Why It Ranks section")
    
    # Find all dimension blocks in the section
    start = section_match.end()
    end_match = re.search(r'</section>\s*<section class="final-score-block"', html[start:])
    if end_match:
        section = html[start:start + end_match.start()]
        print(f"Section size: {len(section)}")
        
        # Extract each dimension
        dim_pattern = r'<div class="dimension ([^"]+)"[^>]*>.*?<div class="dimension-content"[^>]*>(.*?)</div>(?=\s*<div class="strengths"|\s*</div>)'
        matches = list(re.finditer(dim_pattern, section, re.DOTALL))
        print(f"Found {len(matches)} dimension blocks")
        
        for m in matches:
            cls = m.group(1).lower()
            content = m.group(2).strip()
            print(f"  Dimension '{cls}' has {len(content)} chars")
            
            if 'characters' in cls:
                contents['char'] = content
            elif 'world' in cls:
                contents['world'] = content
            elif 'cinematography' in cls:
                contents['cine'] = content
            elif 'visual' in cls:
                contents['spect'] = content
            elif 'concept' in cls:
                contents['conc'] = content
            elif 'narrative' in cls:
                contents['drive'] = content
            elif 'resolution' in cls:
                contents['resol'] = content

# Build new section
sections = ['<section class="rankings-section">', '    <div class="rankings-header">', '        <h2 class="rankings-title">🏆 Why It Ranks</h2>', '        <p class="rankings-subtitle">A detailed breakdown across seven key dimensions</p>', '    </div>', '    <div class="dimension-grid">']

for key, label in DIMS:
    score = SCORES[key]
    content = contents.get(key, '<p>Content to be added.</p>')
    block = f'''
        <div class="dimension-block">
            <div class="dimension-score">
                <div class="score-circle" style="--score: {score};"><span>{score:.1f}</span></div>
                <span class="score-label">{label.upper()}</span>
            </div>
            <div class="dimension-content">
                <h3>{label}</h3>
                {content}
            </div>
        </div>'''
    sections.append(block)

sections.append('    </div>')
sections.append('</section>')
new_html = '\n'.join(sections)

# Replace old section
old_pattern = r'<section class="section">\s*<h2 class="section-title">Why It Ranks</h2>.*?</section>\s*(?=<section class="final-score-block")'
match = re.search(old_pattern, html, re.DOTALL)
if match:
    print(f"Replacing section from {match.start()} to {match.end()}")
    html = html[:match.start()] + new_html + '\n\n' + html[match.end():]
    print("Replacement done")
else:
    print("Could not find old section, trying insertion")
    final_match = re.search(r'<section class="final-score-block"', html)
    if final_match:
        html = html[:final_match.start()] + new_html + '\n\n' + html[final_match.start():]
        print("Insertion done")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(html)

print("File saved")
