$path = "public/sitemap.xml"
$raw = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$raw = $raw -replace "<lastmod>2026-10-04</lastmod>", "<lastmod>2026-11-04</lastmod>"
[System.IO.File]::WriteAllText($path, $raw, [System.Text.Encoding]::UTF8)
Write-Host "Updated sitemap.xml lastmod to 2026-11-04"
