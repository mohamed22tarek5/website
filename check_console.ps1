$files = @("public/common.js", "public/sw.js", "public/pwa.js", "public/pwa.min.js")
foreach ($f in $files) {
    $matches = Select-String -Path $f -Pattern "console\."
    if ($matches) {
        Write-Host "Found in $f : $($matches.Count)"
        $matches | ForEach-Object { Write-Host "   $($_.LineNumber): $($_.Line.Trim())" }
    } else {
        Write-Host "Clean: $f"
    }
}
