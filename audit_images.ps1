$files = Get-ChildItem -Path public -Filter *.html -Recurse
$allImgs = @()
foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    $matches = [regex]::Matches($content, '<img\s+[^>]*>')
    foreach ($m in $matches) {
        $tag = $m.Value
        $hasAlt = $tag -match 'alt=["''][^"'']*["'']'
        $hasLazyOrEager = $tag -match 'loading=["'']'
        $hasDecoding = $tag -match 'decoding=["'']'
        $hasWidth = $tag -match 'width=["'']'
        $hasHeight = $tag -match 'height=["'']'
        if (-not ($hasAlt -and $hasLazyOrEager -and $hasDecoding)) {
            $allImgs += [PSCustomObject]@{
                File = $f.Name
                Tag = $tag
                Alt = $hasAlt
                Loading = $hasLazyOrEager
                Decoding = $hasDecoding
                Width = $hasWidth
                Height = $hasHeight
            }
        }
    }
}
Write-Output "Found $($allImgs.Count) images with missing attributes."
$allImgs | Select-Object -First 20 | Format-Table -AutoSize
