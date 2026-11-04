$path = "public/common.js"
$raw = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
$raw = $raw.Replace(".catch(err=>console.error('SW registration failed:',err))", ".catch(()=>{})")
[System.IO.File]::WriteAllText($path, $raw, [System.Text.Encoding]::UTF8)
Write-Host "Updated common.js"
