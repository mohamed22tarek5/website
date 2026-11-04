param([string]$file = "public/about.html")
$content = [System.IO.File]::ReadAllText($file)
$lines = $content -split "`r?`n"
for ($i=0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '<style>' -or $lines[$i] -match '</style>' -or $lines[$i] -match '<script' -or $lines[$i] -match '</script>') {
        Write-Output "$($i+1): $($lines[$i].Trim())"
    }
}
