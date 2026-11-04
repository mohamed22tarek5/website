Write-Host "=== 1. CHECKING FOR CONSOLE.LOG IN PUBLIC JS ==="
Get-ChildItem -Path "public" -Include "*.js" -Recurse | ForEach-Object {
    $matches = Select-String -Path $_.FullName -Pattern "console\.(log|debug|info|dir|table)"
    if ($matches) {
        Write-Host "Found in $($_.Name): $($matches.Count) occurrences"
        $matches | Select-Object -First 3 | ForEach-Object { Write-Host "   Line $($_.LineNumber): $($_.Line.Trim())" }
    }
}

Write-Host "`n=== 2. CHECKING FOR EVAL / NEW FUNCTION ==="
Get-ChildItem -Path "public" -Include "*.js","*.html" -Recurse | ForEach-Object {
    $matches = Select-String -Path $_.FullName -Pattern "\beval\s*\(|new\s+Function\s*\("
    if ($matches) {
        Write-Host "Found in $($_.Name): $($matches.Count) occurrences"
        $matches | ForEach-Object { Write-Host "   Line $($_.LineNumber): $($_.Line.Trim())" }
    }
}

Write-Host "`n=== 3. CHECKING FOR TARGET=_BLANK WITHOUT REL NOOPENER ==="
$blankWithoutRel = 0
Get-ChildItem -Path "public" -Filter "*.html" -Recurse | ForEach-Object {
    $content = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
    $anchors = [regex]::Matches($content, '<a\s+[^>]*target=["'']_blank["''][^>]*>')
    foreach ($a in $anchors) {
        if ($a.Value -notmatch 'rel=["''][^"'']*noopener') {
            Write-Host "$($_.Name): $($a.Value)"
            $blankWithoutRel++
        }
    }
}
Write-Host "Total links target=_blank missing noopener: $blankWithoutRel"

Write-Host "`n=== 4. CHECKING FOR HARDCODED SECRETS / PRIVATE KEYS ==="
Get-ChildItem -Path "." -Exclude "node_modules",".git",".vercel" -Recurse -File | ForEach-Object {
    $matches = Select-String -Path $_.FullName -Pattern "(api_key|apiKey|secret_key|secretKey|private_key|privateKey|password|bearer\s+[a-zA-Z0-9_\-\.]{20,})\s*[:=]\s*['`"][^'`"]+['`"]"
    if ($matches) {
        Write-Host "Potential secret in $($_.FullName):"
        $matches | ForEach-Object { Write-Host "   Line $($_.LineNumber): $($_.Line.Trim())" }
    }
}
