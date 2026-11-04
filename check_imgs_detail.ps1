$c1 = [System.IO.File]::ReadAllText("public/social-media.html")
[regex]::Matches($c1, '<img[^>]+>') | ForEach-Object { Write-Output "social: $($_.Value)" }

$c2 = [System.IO.File]::ReadAllText("public/tools.html")
[regex]::Matches($c2, '<img[^>]+>') | ForEach-Object { Write-Output "tools: $($_.Value)" }

$c3 = [System.IO.File]::ReadAllText("public/index.html")
[regex]::Matches($c3, '<img[^>]+>') | ForEach-Object { Write-Output "index: $($_.Value)" }
