param(
    [ValidateRange(1024, 65535)]
    [int]$Port = 4173,
    [switch]$Stop
)

$ErrorActionPreference = 'Stop'
$rankRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$rankUrl = "http://localhost:$Port/"
$rankListeners = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
$rankProcesses = @()

foreach ($rankProcessId in @($rankListeners.OwningProcess | Select-Object -Unique)) {
    $rankProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $rankProcessId"
    $rankCommand = [string]$rankProcess.CommandLine
    if ($rankProcess.Name -notmatch '^python(w)?\.exe$' -or
        -not $rankCommand.Contains('-m http.server') -or
        -not $rankCommand.Contains('--bind 127.0.0.1') -or
        -not $rankCommand.Contains("--directory `"$rankRoot`"")) {
        throw "Port $Port belongs to another application. Choose another port with -Port."
    }
    $rankProcesses += $rankProcess
}

if ($Stop) {
    foreach ($rankProcess in $rankProcesses) {
        Stop-Process -Id $rankProcess.ProcessId -ErrorAction Stop
    }
    Write-Output "Local preview stopped: $rankUrl"
    return
}

$rankStartedProcess = $null
if ($rankProcesses.Count -eq 0) {
    $rankPython = (Get-Command python.exe -ErrorAction Stop).Source
    $rankLogDirectory = Join-Path $env:LOCALAPPDATA 'DynamicRankEngine\preview'
    New-Item -ItemType Directory -Path $rankLogDirectory -Force | Out-Null
    $rankStartedProcess = Start-Process -FilePath $rankPython `
        -ArgumentList "-u -m http.server $Port --bind 127.0.0.1 --directory `"$rankRoot`"" `
        -WorkingDirectory $rankRoot -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $rankLogDirectory "$Port.stdout.log") `
        -RedirectStandardError (Join-Path $rankLogDirectory "$Port.stderr.log")
}

$rankDeadline = [DateTime]::UtcNow.AddSeconds(12)
$rankLastError = 'No HTTP response received.'
do {
    try {
        $rankResponse = Invoke-WebRequest -Uri $rankUrl -UseBasicParsing -TimeoutSec 2
        if ($rankResponse.StatusCode -eq 200 -and
            $rankResponse.Content.Contains('<title>Dynamic Rank Engine')) {
            [pscustomobject]@{
                Status = 'Running'
                Url = $rankUrl
                Project = $rankRoot
                ProcessId = if ($rankStartedProcess) { $rankStartedProcess.Id } else { $rankProcesses[0].ProcessId }
            }
            return
        }
        $rankLastError = 'The HTTP response was not the expected website.'
    } catch {
        $rankLastError = $_.Exception.Message
    }
    if ($rankStartedProcess -and $rankStartedProcess.HasExited) { break }
    Start-Sleep -Milliseconds 200
} while ([DateTime]::UtcNow -lt $rankDeadline)

if ($rankStartedProcess -and -not $rankStartedProcess.HasExited) {
    Stop-Process -Id $rankStartedProcess.Id -ErrorAction SilentlyContinue
}
throw "Local preview did not become ready: $rankLastError"
