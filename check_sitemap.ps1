[xml]$xml = Get-Content "public/sitemap.xml"
$baseUrl = "https://mohamed-tarek-abdelhady.vercel.app"

$missing = 0
$total = 0

foreach ($url in $xml.urlset.url) {
    $loc = $url.loc
    $total++
    $path = $loc.Replace($baseUrl, "")
    if ($path -eq "/" -or $path -eq "") {
        $filePath = "public/index.html"
    } elseif ($path.EndsWith("/")) {
        $filePath = "public" + $path + "index.html"
    } else {
        $filePath = "public" + $path
    }
    
    if (-not (Test-Path $filePath)) {
        Write-Host "MISSING FILE for loc: $loc (checked $filePath)"
        $missing++
    }
}

Write-Host "Total sitemap URLs: $total | Missing files: $missing"
