$manifestContent = Get-Content "public/manifest.webmanifest" -Raw | ConvertFrom-Json
Write-Host "Name: $($manifestContent.name)"
Write-Host "Short Name: $($manifestContent.short_name)"
Write-Host "Scope: $($manifestContent.scope)"
Write-Host "Start URL: $($manifestContent.start_url)"

Write-Host "Checking Icons:"
foreach ($icon in $manifestContent.icons) {
    $iconPath = "public/" + $icon.src.TrimStart("/")
    $exists = Test-Path $iconPath
    Write-Host "   $($icon.src) -> Exists: $exists"
}

Write-Host "Checking Shortcuts:"
foreach ($sc in $manifestContent.shortcuts) {
    $url = $sc.url
    $cleanPath = $url.Split("#")[0]
    $scPath = "public/" + $cleanPath.TrimStart("/")
    $exists = Test-Path $scPath
    Write-Host "   $($sc.name) ($url) -> Exists: $exists"
}
