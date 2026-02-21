# Update all JSON files to use 7-dimension rating system
$indexPath = "$PSScriptRoot/data/shows/index.json"
$index = Get-Content $indexPath -Raw | ConvertFrom-Json

# Get all shows from index
$shows = $index.shows

# Track updated files
$updated = 0
$errors = @()

foreach ($show in $shows) {
    $slug = $show.slug
    $jsonPath = "$PSScriptRoot/data/shows/$slug.json"
    
    if (Test-Path $jsonPath) {
        try {
            $content = Get-Content $jsonPath -Raw | ConvertFrom-Json
            
            # Check if using old format
            if ($content.ranking_system -and ($content.ranking_system.narrative_ambition -or $content.ranking_system.character_depth)) {
                # Update to new 7-dimension format
                $content.ranking_system = @{
                    char = $show.char
                    world = $show.world
                    cine = $show.cine
                    spect = $show.spect
                    conc = $show.conc
                    drive = $show.drive
                    resol = $show.resol
                    final = $show.final
                }
                
                # Write back
                $content | ConvertTo-Json -Depth 5 | Set-Content $jsonPath -Encoding UTF8
                $updated++
                Write-Host "Updated: $slug.json" -ForegroundColor Green
            }
        } catch {
            $errors += "$slug - $($_.Exception.Message)"
            Write-Host "Error updating: $slug" -ForegroundColor Red
        }
    }
}

Write-Host "`nUpdated $updated files" -ForegroundColor Cyan
if ($errors.Count -gt 0) {
    Write-Host "`nErrors:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
}
