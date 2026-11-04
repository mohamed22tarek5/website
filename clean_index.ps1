$filePath = "public/index.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Backup first
[System.IO.File]::WriteAllText("$filePath.bak", $content, [System.Text.Encoding]::UTF8)

# 1. Remove duplicate CSS from start of <style> up to HERO SECTION
$styleStartMarker = "<style>`r`n"
if (!$content.Contains($styleStartMarker)) {
    $styleStartMarker = "<style>`n"
}
$heroMarker = "    /* ============================================`r`n       HERO SECTION"
if (!$content.Contains($heroMarker)) {
    $heroMarker = "    /* ============================================`n       HERO SECTION"
}

$startIdx = $content.IndexOf($styleStartMarker)
$heroIdx = $content.IndexOf($heroMarker)

if ($startIdx -ge 0 -and $heroIdx -gt $startIdx) {
    $before = $content.Substring(0, $startIdx + $styleStartMarker.Length)
    $after = $content.Substring($heroIdx)
    $content = $before + "    /* Page-specific styles (shared design system loaded via /common.css) */`r`n" + $after
    Write-Host "1. Removed duplicate design system/reset/header CSS from index.html"
} else {
    Write-Host "Warning: Could not find CSS start or hero markers"
}

# 2. Remove duplicate footer/pwa/reveal/loader CSS from end of <style>
$footerCssMarker = "    /* ============================================`r`n       FOOTER"
if (!$content.Contains($footerCssMarker)) {
    $footerCssMarker = "    /* ============================================`n       FOOTER"
}
$styleEndMarker = "</style>"

$footerCssIdx = $content.IndexOf($footerCssMarker)
$styleEndIdx = $content.IndexOf($styleEndMarker, $footerCssIdx)

if ($footerCssIdx -ge 0 -and $styleEndIdx -gt $footerCssIdx) {
    $before = $content.Substring(0, $footerCssIdx)
    $after = $content.Substring($styleEndIdx)
    $content = $before + $after
    Write-Host "2. Removed duplicate footer/pwa/reveal CSS from index.html"
} else {
    Write-Host "Warning: Could not find footer CSS or </style> markers"
}

# 3. Clean up the inline JavaScript block
$scriptStartMarker = "  <!-- ============================================`r`n       JAVASCRIPT`r`n       ============================================ -->`r`n  <script>"
if (!$content.Contains($scriptStartMarker)) {
    $scriptStartMarker = "  <!-- ============================================`n       JAVASCRIPT`n       ============================================ -->`n  <script>"
}
$scriptEndMarker = "  <script src=`"/common.js`" defer></script>"

$jsStartIdx = $content.IndexOf($scriptStartMarker)
$jsEndIdx = $content.IndexOf($scriptEndMarker, $jsStartIdx)

if ($jsStartIdx -ge 0 -and $jsEndIdx -gt $jsStartIdx) {
    $before = $content.Substring(0, $jsStartIdx)
    $after = $content.Substring($jsEndIdx)

    $cleanJs = @"
  <!-- ============================================
       JAVASCRIPT
       ============================================ -->
  <script>
    (() => {
      'use strict';

      /* ----------------------------------------
         TYPEWRITER EFFECT (Reduced-Motion & Off-Screen Aware)
         ---------------------------------------- */
      const typedEl = document.getElementById('typedText');
      const roles = [
        'Communication Engineer',
        'Electronics Engineer',
        'PCBA',
        'Arduino Expert',
        'PCB Designer',
        'Embedded Systems Engineer',
        'IoT Specialist'
      ];
      let roleIdx = 0, charIdx = 0, isDeleting = false;
      let isPaused = false;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (typedEl) typedEl.textContent = roles[0];
      } else {
        const heroSection = document.querySelector('.hero');
        if (heroSection && 'IntersectionObserver' in window) {
          const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              isPaused = !entry.isIntersecting;
            });
          }, { threshold: 0.1 });
          heroObserver.observe(heroSection);
        }

        const typeStep = () => {
          if (isPaused) {
            setTimeout(typeStep, 400);
            return;
          }
          const current = roles[roleIdx];
          if (isDeleting) {
            charIdx--;
            if (typedEl) typedEl.textContent = current.substring(0, charIdx);
          } else {
            charIdx++;
            if (typedEl) typedEl.textContent = current.substring(0, charIdx);
          }

          let delay = isDeleting ? 40 : 80;

          if (!isDeleting && charIdx === current.length) {
            delay = 2000;
            isDeleting = true;
          } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            roleIdx = (roleIdx + 1) % roles.length;
            delay = 500;
          }

          setTimeout(typeStep, delay);
        };
        setTimeout(typeStep, 1000);
      }

      /* ----------------------------------------
         CONTACT FORM
         ---------------------------------------- */
      const contactForm = document.getElementById('contactForm');
      const formStatus = document.getElementById('formStatus');
      const submitBtn = document.getElementById('submitBtn');

      if (contactForm && formStatus && submitBtn) {
        contactForm.addEventListener('submit', (e) => {
          e.preventDefault();

          const name = document.getElementById('name')?.value.trim() || '';
          const email = document.getElementById('email')?.value.trim() || '';
          const subject = document.getElementById('subject')?.value.trim() || '';
          const message = document.getElementById('message')?.value.trim() || '';

          if (!name || !email || !message) {
            formStatus.textContent = 'Please fill in all required fields.';
            formStatus.className = 'form-status error';
            formStatus.focus();
            return;
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            formStatus.textContent = 'Please enter a valid email address.';
            formStatus.className = 'form-status error';
            formStatus.focus();
            return;
          }

          if (message.length < 10) {
            formStatus.textContent = 'Message must be at least 10 characters.';
            formStatus.className = 'form-status error';
            formStatus.focus();
            return;
          }

          submitBtn.disabled = true;
          submitBtn.innerHTML = '<svg class="fas fa-spinner fa-spin fa-svg" viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z"/></svg> Sending...';

          const mailtoLink = 'mailto:mohammed.tarek.abdelhady.ali@gmail.com'
            + '?subject=' + encodeURIComponent(subject || 'Portfolio Contact from ' + name)
            + '&body=' + encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message);

          setTimeout(() => {
            window.location.href = mailtoLink;
            formStatus.textContent = "Opening your email client... If it didn't open, email me directly at mohammed.tarek.abdelhady.ali@gmail.com";
            formStatus.className = 'form-status success';
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<svg class="fas fa-paper-plane fa-svg" viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"/></svg> <span>Send Message</span>';

            setTimeout(() => {
              formStatus.className = 'form-status';
            }, 8000);
          }, 800);
        });
      }
    })();
  </script>
`r`n
"@

    $content = $before + $cleanJs + $after
    Write-Host "3. Cleaned duplicate JS, kept typewriter & contact form"
} else {
    Write-Host "Warning: Could not find JS start or end markers"
}

[System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
$origLines = [System.IO.File]::ReadAllLines("$filePath.bak").Length
$newLines = [System.IO.File]::ReadAllLines($filePath).Length
Write-Host "Success! Original lines: $origLines -> New lines: $newLines (Saved $($origLines - $newLines) lines of duplication)"
