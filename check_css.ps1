$lines = [System.IO.File]::ReadAllLines("public/index.html")
Write-Host "--- SCRIPT START ---"
for ($i = 2840; $i -le 2860; $i++) {
    Write-Host "$($i+1): $($lines[$i])"
}
Write-Host "--- SCRIPT END ---"
for ($i = 3340; $i -lt $lines.Length; $i++) {
    Write-Host "$($i+1): $($lines[$i])"
}
