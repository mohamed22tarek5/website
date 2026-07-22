# AGENTS.md - Portfolio Transformation Plan

## Project Overview
Transform Mohamed Tarek's portfolio website into a premium, modern design comparable to senior engineers at Google, Apple, Microsoft, Tesla, or Stripe.

## Current State Analysis

### Portfolio Structure
- **Main Portfolio**: 8 HTML pages (index.html, CV, Projects, Social Media, Certificates, Services, Personal Information, my-sites)
- **Sites Directory**: 24 standalone tool/game pages (~30,565 total lines)
- **Shared Infrastructure**: sw.js, pwa.js, manifest.webmanifest, offline.html

### Key Issues Identified

#### 1. Massive Code Duplication (~3,000-4,000 lines eliminable)
- Theme toggle CSS/JS duplicated in 20 files
- Footer HTML/CSS duplicated in 18 files
- Toast/notification system duplicated in 16 files
- Tab switching system duplicated in 8 files
- Page header gradient duplicated in 12 files
- Base reset/body styles duplicated in 20 files

#### 2. Incompatible Theme Systems
- **Main Portfolio**: Uses `data-theme="dark"` on `<html>` element
- **Sites Directory**: Uses `data-theme` on `<body>` element OR `body.light` class (index.html only)
- **Problem**: Inconsistent persistence (some save to localStorage, some don't)

#### 3. PWA Infrastructure Disconnected
- sw.js, pwa.js, manifest.webmanifest exist but are NOT linked from HTML files
- No `<link rel="manifest">` in any sites/ HTML file
- No `<script src="pwa.js">` in any sites/ HTML file
- Service worker only registered in offline.html

#### 4. Inconsistent Design Systems
- **Fonts**: 8 different font stacks across files
- **Colors**: 3 different primary color schemes (#4e9eff, #3498db, #3b82f6)
- **Border Radius**: Inconsistent (8px, 12px, 15px, 20px)
- **Shadows**: Different box-shadow values across files

#### 5. Missing Premium Features
- No smooth page transitions
- No loading states
- No skeleton screens
- No gesture support for mobile
- No keyboard navigation
- No ARIA labels (accessibility)
- No Open Graph/Twitter Cards (SEO)
- No JSON-LD structured data
- No performance optimization (preloading, lazy loading)

## Implementation Plan

### Phase 1: Create Shared Infrastructure (Priority: HIGH)
1. Create `sites/common.css` - Extract shared CSS variables, reset, components
2. Create `sites/common.js` - Extract theme toggle, notifications, footer, tabs
3. Standardize theme system to use `data-theme="dark"` on `<html>` (matching main portfolio)
4. Add PWA links (manifest, pwa.js) to all HTML files

### Phase 2: Refactor Calculator Pages (Priority: HIGH)
Target files: 15 calculator pages
- Remove duplicated CSS (theme variables, reset, components)
- Remove duplicated JS (theme toggle, notifications, tabs)
- Link to common.css and common.js
- Standardize fonts to Inter + JetBrains Mono (matching main portfolio)
- Add Open Graph/Twitter Cards
- Add loading states and skeleton screens
- Add keyboard navigation
- Add ARIA labels

### Phase 3: Refactor Tool Pages (Priority: MEDIUM)
Target files: ai-sites-list.html, LCD-Custom-Character-Generator.html, Medication-Reminder.html, to-do-list.html, Mastering Linux Commands.html
- Same refactoring as Phase 2
- Add search/filter functionality improvements
- Add keyboard shortcuts
- Add drag-and-drop where applicable

### Phase 4: Refactor Game Pages (Priority: MEDIUM)
Target files: 3d-car-game.html, dino-game.html, Race-Game.html
- Remove heavy libraries (Three.js, particles.js) or lazy-load them
- Add touch gesture support for mobile
- Add haptic feedback (if available)
- Add score sharing functionality
- Add difficulty settings
- Add sound controls

### Phase 5: Enhance Dashboard (Priority: LOW)
Target file: sites/index.html (dashboard)
- Redesign with premium card layouts
- Add real-time statistics
- Add animated counters
- Add category filtering
- Add recently used tools
- Add favorites/bookmarks

### Phase 6: Add Premium Features (Priority: HIGH)
1. **Performance**
   - Add `<link rel="preload">` for critical resources
   - Add `loading="lazy"` for images
   - Add `defer`/`async` for scripts
   - Minify CSS/JS in production

2. **Accessibility**
   - Add ARIA labels to all interactive elements
   - Add skip navigation links
   - Ensure proper heading hierarchy
   - Add focus indicators
   - Test with screen readers

3. **SEO**
   - Add Open Graph meta tags
   - Add Twitter Card meta tags
   - Add JSON-LD structured data
   - Add canonical URLs
   - Create sitemap.xml

4. **User Experience**
   - Add skeleton screens for loading states
   - Add smooth page transitions
   - Add breadcrumb navigation
   - Add "back to top" button
   - Add scroll progress indicator
   - Add keyboard shortcuts help modal

5. **Mobile Experience**
   - Add touch gestures (swipe, pinch)
   - Add haptic feedback
   - Add app-like transitions
   - Add pull-to-refresh
   - Add bottom navigation bar

### Phase 7: Testing & Optimization (Priority: HIGH)
1. Cross-browser testing (Chrome, Firefox, Safari, Edge)
2. Mobile testing (iOS Safari, Chrome Android)
3. Performance testing (Lighthouse, WebPageTest)
4. Accessibility testing (WAVE, axe)
5. SEO testing (Google Search Console)
6. PWA testing (Lighthouse PWA audit)

## Design System Specification

### Color Palette
```css
:root {
  /* Primary */
  --color-primary: #3b82f6;
  --color-primary-light: #60a5fa;
  --color-primary-dark: #2563eb;
  
  /* Background */
  --color-bg-primary: #0a0e1a;
  --color-bg-secondary: #111827;
  --color-bg-tertiary: #1f2937;
  
  /* Text */
  --color-text-primary: #f9fafb;
  --color-text-secondary: #9ca3af;
  --color-text-muted: #6b7280;
  
  /* Accent */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* Borders */
  --color-border: #374151;
  --color-border-light: #4b5563;
}
```

### Typography
```css
:root {
  /* Font Families */
  --font-display: 'Inter', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Font Sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Spacing
```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
}
```

### Border Radius
```css
:root {
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;
}
```

### Shadows
```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}
```

### Transitions
```css
:root {
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
  --transition-spring: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

## File Structure

### New Shared Files
```
sites/
├── common.css          # Shared CSS variables, reset, components
├── common.js           # Shared JS (theme, notifications, footer, tabs)
├── pwa.js              # PWA manager (already exists, needs updates)
├── sw.js               # Service worker (already exists, needs updates)
├── manifest.webmanifest # PWA manifest (already exists, needs updates)
└── offline.html        # Offline page (already exists, needs updates)
```

### Updated File Structure (per HTML page)
```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title - Mohamed Tarek</title>
  
  <!-- PWA -->
  <link rel="manifest" href="manifest.webmanifest">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="mobile-web-app-capable" content="yes">
  <link rel="apple-touch-icon" href="icon-192.png">
  
  <!-- SEO -->
  <meta name="description" content="...">
  <meta name="keywords" content="...">
  <meta property="og:title" content="...">
  <meta property="og:description" content="...">
  <meta property="og:image" content="...">
  <meta name="twitter:card" content="summary_large_image">
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  
  <!-- Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  
  <!-- Shared CSS -->
  <link rel="stylesheet" href="common.css">
  
  <!-- Page-specific CSS -->
  <style>/* Page-specific styles only */</style>
</head>
<body>
  <!-- Content -->
  
  <!-- Shared JS -->
  <script src="common.js"></script>
  
  <!-- PWA JS -->
  <script src="pwa.js"></script>
  
  <!-- Page-specific JS -->
  <script>/* Page-specific scripts only */</script>
</body>
</html>
```

## Success Metrics

### Performance
- [ ] Lighthouse Performance score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Blocking Time < 300ms
- [ ] Cumulative Layout Shift < 0.1

### Accessibility
- [ ] Lighthouse Accessibility score > 90
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation working
- [ ] Screen reader compatible
- [ ] Proper ARIA labels

### SEO
- [ ] Lighthouse SEO score > 90
- [ ] Open Graph tags present
- [ ] Twitter Cards present
- [ ] JSON-LD structured data
- [ ] Sitemap.xml created

### PWA
- [ ] Lighthouse PWA score > 90
- [ ] Service worker registered
- [ ] Manifest linked
- [ ] Offline support working
- [ ] Install prompt working

### Code Quality
- [ ] CSS duplication reduced by 80%
- [ ] JS duplication reduced by 80%
- [ ] Consistent design system across all pages
- [ ] No console errors
- [ ] No broken links

## Timeline

### Week 1: Infrastructure
- Create common.css and common.js
- Standardize theme system
- Add PWA links to all files

### Week 2: Calculator Pages
- Refactor 15 calculator pages
- Add premium features
- Test cross-browser

### Week 3: Tools & Games
- Refactor 6 tool pages
- Refactor 3 game pages
- Add mobile gestures

### Week 4: Polish & Testing
- Add SEO meta tags
- Add accessibility features
- Performance optimization
- Final testing

## Notes

- Maintain backward compatibility with existing URLs
- Preserve all existing functionality
- Keep all original content and images
- Ensure dark mode is default
- Test on real devices before deployment
