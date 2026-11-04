$sitePages = Get-ChildItem -Path "public/sites" -Filter "*.html" -File
foreach ($p in $sitePages) {
    $raw = [System.IO.File]::ReadAllText($p.FullName, [System.Text.Encoding]::UTF8)
    $hasCommonCss = $raw.Contains("common.css")
    $hasCommonJs = $raw.Contains("common.js")
    $hasChromeCss = $raw.Contains("mta-chrome.css")
    $hasChromeJs = $raw.Contains("mta-chrome.js")
    $hasCanonical = $raw -match '<link\s+rel=["'']canonical["'']'
    $hasJsonLd = $raw.Contains('application/ld+json')
    Write-Host "$($p.Name) -> Lines: $((Get-Content $p.FullName).Length) | chrome.css: $hasChromeCss | chrome.js: $hasChromeJs | Canonical: $hasCanonical | JSON-LD: $hasJsonLd"
}
