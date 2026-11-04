$mainPages = Get-ChildItem -Path "public" -Filter "*.html" -File
foreach ($p in $mainPages) {
    $raw = [System.IO.File]::ReadAllText($p.FullName, [System.Text.Encoding]::UTF8)
    $hasCommonCss = $raw.Contains("common.css")
    $hasCommonJs = $raw.Contains("common.js")
    $hasLlms = $raw.Contains("llms.txt")
    $hasCanonical = $raw -match '<link\s+rel=["'']canonical["'']'
    $hasJsonLd = $raw.Contains('application/ld+json')
    $inlineStyleLength = 0
    if ($raw -match '(?s)<style>(.*?)</style>') {
        $inlineStyleLength = $matches[1].Length
    }
    Write-Host "$($p.Name) -> Lines: $((Get-Content $p.FullName).Length) | common.css: $hasCommonCss | common.js: $hasCommonJs | llms.txt: $hasLlms | Canonical: $hasCanonical | JSON-LD: $hasJsonLd | Inline CSS bytes: $inlineStyleLength"
}
