$files = Get-ChildItem -Path public -Filter *.html -Recurse
foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $hasCanonical = $content -match '<link\s+rel=["'']canonical["'']'
    $hasLLMs = $content -match 'llms\.txt'
    $hasSchema = $content -match 'application/ld\+json'
    $hasConsoleLog = $content -match 'console\.log\('
    $hasOldLinks = ($content -match 'Mohamed%20-') -or ($content -match 'Mohamed - ')
    Write-Output "$($f.Name) | Canonical: $hasCanonical | LLMs: $hasLLMs | Schema: $hasSchema | Log: $hasConsoleLog | OldLinks: $hasOldLinks"
}
