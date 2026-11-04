$files = Get-ChildItem -Path public -Filter *.html
foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $hasCommonCSS = $content -match 'common\.css'
    $hasCommonJS = $content -match 'common\.js'
    Write-Output "$($f.Name) | common.css: $hasCommonCSS | common.js: $hasCommonJS | Lines: $(($content -split "`n").Count)"
}
