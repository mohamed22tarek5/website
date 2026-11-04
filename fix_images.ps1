# 1. certificates.html
$c = [System.IO.File]::ReadAllText("public/certificates.html")
$c = $c.Replace('<img id="modal-cert-img" src="/photo.jpg" alt="Certificate preview">', '<img id="modal-cert-img" src="/photo.jpg" alt="Certificate preview" loading="lazy" decoding="async" width="800" height="600">')
[System.IO.File]::WriteAllText("public/certificates.html", $c)

# 2. projects.html
$c = [System.IO.File]::ReadAllText("public/projects.html")
$c = $c.Replace('<img id="modalImg" src="/photo.jpg" alt="Project preview">', '<img id="modalImg" src="/photo.jpg" alt="Project preview" loading="lazy" decoding="async" width="800" height="600">')
$c = $c.Replace('<img src="${project.image}" alt="${project.title}" loading="lazy" onerror="this.style.display=''none''">', '<img src="${project.image}" alt="${project.title}" loading="lazy" decoding="async" width="400" height="250" onerror="this.style.display=''none''">')
[System.IO.File]::WriteAllText("public/projects.html", $c)

# 3. social-media.html
$c = [System.IO.File]::ReadAllText("public/social-media.html")
$c = $c.Replace('<img src="/photo.jpg" alt="Mohamed Tarek Abdelhady - Communication Engineer" class="profile-avatar reveal">', '<img src="/photo.jpg" alt="Mohamed Tarek Abdelhady - Communication Engineer" class="profile-avatar reveal" width="120" height="120" loading="eager" decoding="async">')
$c = [regex]::Replace($c, '<img id="qrcode-image" src="[^"]*" alt="Scan to connect on WhatsApp"[^>]*>', '<img id="qrcode-image" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&amp;data=https://mohamed-tarek-abdelhady.vercel.app/social-media.html" alt="Scan to connect on WhatsApp" width="180" height="180" loading="lazy" decoding="async">')
[System.IO.File]::WriteAllText("public/social-media.html", $c)

# 4. tools.html
$c = [System.IO.File]::ReadAllText("public/tools.html")
$c = $c.Replace('<img src="/photo.jpg" alt="Mohamed Tarek Abdelhady" class="profile-image reveal" width="140" height="140">', '<img src="/photo.jpg" alt="Mohamed Tarek Abdelhady" class="profile-image reveal" width="140" height="140" loading="eager" decoding="async">')
[System.IO.File]::WriteAllText("public/tools.html", $c)

# 5. 3d-car-game.html
$c = [System.IO.File]::ReadAllText("public/sites/3d-car-game.html")
$c = $c.Replace('loading="lazy">', 'loading="lazy" decoding="async">')
[System.IO.File]::WriteAllText("public/sites/3d-car-game.html", $c)

Write-Output "Image optimizations applied successfully!"
