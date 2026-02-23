# TV Show HTML Converter Script
# Converts old format to new standardized format with "Why It Ranks" section

$showsDir = "C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked\docs\shows"
$indexPath = "C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked\data\shows\index.json"

# Read index.json for scores
$indexContent = Get-Content -Path $indexPath -Raw | ConvertFrom-Json

# Show scores lookup
$showScores = @{}
foreach ($show in $indexContent.shows) {
    $slug = $show.slug
    $showScores[$slug] = @{
        char = $show.char
        world = $show.world
        cine = $show.cine
        spect = $show.spect
        conc = $show.conc
        drive = $show.drive
        resol = $show.resol
        final = $show.final
    }
}

# Dimension mapping
$dimensions = @(
    @{ key = "char"; label = "Characters"; class = "characters" },
    @{ key = "world"; label = "World Building"; class = "world" },
    @{ key = "cine"; label = "Cinematography"; class = "cinematography" },
    @{ key = "spect"; label = "Visual Spectacle"; class = "spectacle" },
    @{ key = "conc"; label = "Conceptual Density"; class = "concept" },
    @{ key = "drive"; label = "Narrative Drive"; class = "narrative" },
    @{ key = "resol"; label = "Resolution"; class = "resolution" }
)

# New CSS to add
$newCss = @"
.rankings-section { margin-bottom: 2rem; }
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
.dimension-content h3 { font-size: 1.4rem; margin-bottom: 0.75rem; }
"@

function Get-DimensionContent($html, $dimKey) {
    # Extract content from existing dimension sections
    $patterns = @{
        "char" = '(?s)(?<=class="dimension characters"|Characters).*?(?=class="dimension world"|World Building|</div>\s*<div class="dimension world")'
        "world" = '(?s)(?<=class="dimension world"|World Building).*?(?=class="dimension cinematography"|Cinematography|</div>\s*<div class="dimension cinematography")'
        "cine" = '(?s)(?<=class="dimension cinematography"|Cinematography).*?(?=class="dimension visual"|Visual Spectacle|</div>\s*<div class="dimension visual")'
        "spect" = '(?s)(?<=class="dimension visual"|Visual Spectacle).*?(?=class="dimension concept"|Conceptual Density|</div>\s*<div class="dimension concept")'
        "conc" = '(?s)(?<=class="dimension concept"|Conceptual Density).*?(?=class="dimension narrative"|Narrative Drive|</div>\s*<div class="dimension narrative")'
        "drive" = '(?s)(?<=class="dimension narrative"|Narrative Drive).*?(?=class="dimension resolution"|Resolution|</div>\s*<div class="dimension resolution")'
        "resol" = '(?s)(?<=class="dimension resolution"|Resolution).*?(?=</section>|</div>\s*</section>)'
    }
    
    if ($patterns.ContainsKey($dimKey)) {
        $match = [regex]::Match($html, $patterns[$dimKey])
        if ($match.Success) {
            $content = $match.Value
            # Extract dimension-content div
            $contentMatch = [regex]::Match($content, '(?s)<div class="dimension-content">(.*?)</div>\s*(?=<div class="strengths"|$)')
            if ($contentMatch.Success) {
                return $contentMatch.Groups[1].Value.Trim()
            }
            # Try alternate pattern
            $contentMatch = [regex]::Match($content, '(?s)<div class="dimension-content">(.*?)<div class="strengths">')
            if ($contentMatch.Success) {
                return $contentMatch.Groups[1].Value.Trim()
            }
        }
    }
    return $null
}

function Convert-File($filename) {
    $filepath = Join-Path $showsDir $filename
    if (-not (Test-Path $filepath)) {
        Write-Host "File not found: $filename" -ForegroundColor Red
        return
    }
    
    $slug = $filename -replace '\.html$', ''
    Write-Host "Processing: $slug" -ForegroundColor Cyan
    
    $html = Get-Content -Path $filepath -Raw
    
    # Get scores from index
    $scores = $showScores[$slug]
    if (-not $scores) {
        Write-Host "  Warning: No scores found for $slug" -ForegroundColor Yellow
        return
    }
    
    # Add CSS if not present
    if (-not $html.Contains(".rankings-section")) {
        # Find </style> and insert before it
        $html = $html -replace '(</style>)', "$newCss`n`$1"
    }
    
    # Find existing dimension content
    $dimensionContents = @{}
    foreach ($dim in $dimensions) {
        $content = Get-DimensionContent $html $dim.key
        if ($content) {
            $dimensionContents[$dim.key] = $content
        }
    }
    
    # Build new rankings section HTML
    $newSection = @"
<section class="rankings-section">
    <div class="rankings-header">
        <h2 class="rankings-title">🏆 Why It Ranks</h2>
        <p class="rankings-subtitle">A detailed breakdown across seven key dimensions</p>
    </div>
    <div class="dimension-grid">
"@
    
    foreach ($dim in $dimensions) {
        $score = $scores[$dim.key]
        $scoreDisplay = if ($score -eq [math]::Floor($score)) { "$score.0" } else { "$score" }
        $content = $dimensionContents[$dim.key]
        if (-not $content) { $content = "<p>Content to be added.</p>" }
        
        $newSection += @"

        <div class="dimension-block">
            <div class="dimension-score">
                <div class="score-circle" style="--score: $score;"><span>$scoreDisplay</span></div>
                <span class="score-label">$($dim.label.ToUpper())</span>
            </div>
            <div class="dimension-content">
                <h3>$($dim.label)</h3>
                $content
            </div>
        </div>
"@
    }
    
    $newSection += @"

    </div>
</section>
"@
    
    # Replace old "Why It Ranks" section
    $patterns = @(
        '(?s)<section class="section">\s*<h2 class="section-title">Why It Ranks</h2>.*?</section>(?=\s*<section class="final-score-block"|\s*</div>\s*</body>)',
        '(?s)<h2 class="section-title">Why It Ranks</h2>.*?(?=<section class="final-score-block">|</div>\s*</body>)',
        '(?s)<section class="section rankings-section">.*?</section>(?=\s*<section class="final-score-block"|\s*</div>\s*</body>)'
    )
    
    $replaced = $false
    foreach ($pattern in $patterns) {
        if ($html -match $pattern) {
            $html = $html -replace $pattern, $newSection
            $replaced = $true
            break
        }
    }
    
    if (-not $replaced) {
        Write-Host "  Warning: Could not find Why It Ranks section to replace" -ForegroundColor Yellow
    }
    
    # Save updated file
    Set-Content -Path $filepath -Value $html -NoNewline
    Write-Host "  ✓ Updated: $filename" -ForegroundColor Green
}

# List of files to process
$files = @(
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
)

Write-Host "=== TV Show HTML Converter ===" -ForegroundColor Magenta
Write-Host "Converting $($files.Count) files to new format`n" -ForegroundColor White

foreach ($file in $files) {
    Convert-File $file
}

Write-Host "`n=== Conversion Complete ===" -ForegroundColor Magenta
