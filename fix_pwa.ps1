@( "public/pwa.js", "public/pwa.min.js" ) | ForEach-Object {
    $c = [System.IO.File]::ReadAllText($_, [System.Text.Encoding]::UTF8)
    $c = $c -replace "console\.log\('SW registration failed:',\s*err\);?", ""
    [System.IO.File]::WriteAllText($_, $c, [System.Text.Encoding]::UTF8)
    Write-Host "Replaced in $_"
}
