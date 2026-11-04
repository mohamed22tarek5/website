$target = "<script>if(location.hostname.slice(0,4)==='www.'){location.replace(location.protocol+'//'+location.hostname.slice(4)+location.pathname+location.search+location.hash);}</script>"

$count = 0
Get-ChildItem -Path "public" -Filter "*.html" -Recurse | ForEach-Object {
    $raw = [System.IO.File]::ReadAllText($_.FullName, [System.Text.Encoding]::UTF8)
    if ($raw.Contains($target)) {
        $raw = $raw.Replace($target, "")
        [System.IO.File]::WriteAllText($_.FullName, $raw, [System.Text.Encoding]::UTF8)
        $count++
        Write-Host "Cleaned: $($_.Name)"
    }
}
Write-Host "Total cleaned: $count files"
