import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const PUBLIC_DIR = path.resolve('public');
const SPLASH_DIR = path.join(PUBLIC_DIR, 'splash');
const SCREENSHOTS_DIR = path.join(PUBLIC_DIR, 'screenshots');
const SITES_DIR = path.join(PUBLIC_DIR, 'sites');

if (!fs.existsSync(SPLASH_DIR)) fs.mkdirSync(SPLASH_DIR, { recursive: true });
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

// CRC32 table
const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  table[i] = c;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  return ~c;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgbaBuffer) {
  const lineSize = 1 + width * 4;
  const raw = Buffer.alloc(lineSize * height);
  for (let y = 0; y < height; y++) {
    raw[y * lineSize] = 0; // Filter: None
    const rowSrc = y * width * 4;
    const rowDst = y * lineSize + 1;
    rgbaBuffer.copy(raw, rowDst, rowSrc, rowSrc + width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

function decodePng(buffer) {
  let offset = 8;
  let width = 0, height = 0, depth = 0, colorType = 0;
  let palette = null, trns = null;
  const idats = [];
  while (offset < buffer.length) {
    const len = buffer.readUInt32BE(offset);
    const type = buffer.slice(offset + 4, offset + 8).toString('ascii');
    const data = buffer.slice(offset + 8, offset + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      depth = data[8];
      colorType = data[9];
    } else if (type === 'PLTE') {
      palette = data;
    } else if (type === 'tRNS') {
      trns = data;
    } else if (type === 'IDAT') {
      idats.push(data);
    }
    offset += 12 + len;
  }

  const decompressed = zlib.inflateSync(Buffer.concat(idats));
  const rgba = Buffer.alloc(width * height * 4);

  if (colorType === 3) {
    const lineSize = 1 + width;
    const raw = Buffer.alloc(width * height);
    for (let y = 0; y < height; y++) {
      const filter = decompressed[y * lineSize];
      for (let x = 0; x < width; x++) {
        const val = decompressed[y * lineSize + 1 + x];
        let prev = 0;
        if (filter === 0) raw[y * width + x] = val;
        else if (filter === 1) {
          prev = x > 0 ? raw[y * width + x - 1] : 0;
          raw[y * width + x] = (val + prev) & 0xff;
        } else if (filter === 2) {
          prev = y > 0 ? raw[(y - 1) * width + x] : 0;
          raw[y * width + x] = (val + prev) & 0xff;
        } else if (filter === 3) {
          const a = x > 0 ? raw[y * width + x - 1] : 0;
          const b = y > 0 ? raw[(y - 1) * width + x] : 0;
          raw[y * width + x] = (val + Math.floor((a + b) / 2)) & 0xff;
        } else if (filter === 4) {
          const a = x > 0 ? raw[y * width + x - 1] : 0;
          const b = y > 0 ? raw[(y - 1) * width + x] : 0;
          const c = (x > 0 && y > 0) ? raw[(y - 1) * width + x - 1] : 0;
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          let pr = c;
          if (pa <= pb && pa <= pc) pr = a;
          else if (pb <= pc) pr = b;
          raw[y * width + x] = (val + pr) & 0xff;
        }
      }
    }
    for (let i = 0; i < width * height; i++) {
      const palIdx = raw[i];
      rgba[i * 4] = palette[palIdx * 3];
      rgba[i * 4 + 1] = palette[palIdx * 3 + 1];
      rgba[i * 4 + 2] = palette[palIdx * 3 + 2];
      rgba[i * 4 + 3] = trns && palIdx < trns.length ? trns[palIdx] : 255;
    }
  } else if (colorType === 6) {
    const lineSize = 1 + width * 4;
    for (let y = 0; y < height; y++) {
      const filter = decompressed[y * lineSize];
      for (let x = 0; x < width * 4; x++) {
        const val = decompressed[y * lineSize + 1 + x];
        let prev = 0;
        const bpp = 4;
        const idx = y * width * 4 + x;
        if (filter === 0) rgba[idx] = val;
        else if (filter === 1) {
          prev = x >= bpp ? rgba[y * width * 4 + x - bpp] : 0;
          rgba[idx] = (val + prev) & 0xff;
        } else if (filter === 2) {
          prev = y > 0 ? rgba[(y - 1) * width * 4 + x] : 0;
          rgba[idx] = (val + prev) & 0xff;
        } else if (filter === 3) {
          const a = x >= bpp ? rgba[y * width * 4 + x - bpp] : 0;
          const b = y > 0 ? rgba[(y - 1) * width * 4 + x] : 0;
          rgba[idx] = (val + Math.floor((a + b) / 2)) & 0xff;
        } else if (filter === 4) {
          const a = x >= bpp ? rgba[y * width * 4 + x - bpp] : 0;
          const b = y > 0 ? rgba[(y - 1) * width * 4 + x] : 0;
          const c = (x >= bpp && y > 0) ? rgba[(y - 1) * width * 4 + x - bpp] : 0;
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          let pr = c;
          if (pa <= pb && pa <= pc) pr = a;
          else if (pb <= pc) pr = b;
          rgba[idx] = (val + pr) & 0xff;
        }
      }
    }
  }
  return { width, height, rgba };
}

// Bilinear scaling
function resizeRgba(src, srcW, srcH, dstW, dstH) {
  const dst = Buffer.alloc(dstW * dstH * 4);
  const xRatio = (srcW - 1) / Math.max(1, dstW - 1);
  const yRatio = (srcH - 1) / Math.max(1, dstH - 1);

  for (let y = 0; y < dstH; y++) {
    const srcY = y * yRatio;
    const yFloor = Math.floor(srcY);
    const yCeil = Math.min(srcH - 1, yFloor + 1);
    const yWeight = srcY - yFloor;

    for (let x = 0; x < dstW; x++) {
      const srcX = x * xRatio;
      const xFloor = Math.floor(srcX);
      const xCeil = Math.min(srcW - 1, xFloor + 1);
      const xWeight = srcX - xFloor;

      const idx00 = (yFloor * srcW + xFloor) * 4;
      const idx10 = (yFloor * srcW + xCeil) * 4;
      const idx01 = (yCeil * srcW + xFloor) * 4;
      const idx11 = (yCeil * srcW + xCeil) * 4;

      const dstIdx = (y * dstW + x) * 4;

      for (let c = 0; c < 4; c++) {
        const top = src[idx00 + c] * (1 - xWeight) + src[idx10 + c] * xWeight;
        const btm = src[idx01 + c] * (1 - xWeight) + src[idx11 + c] * xWeight;
        dst[dstIdx + c] = Math.round(top * (1 - yWeight) + btm * yWeight);
      }
    }
  }
  return dst;
}

// Maskable icon: centered inside safe zone (approx 72% of dimension) with dark background (#0a0e1a)
function createMaskableIcon(src, srcW, srcH, size) {
  const dst = Buffer.alloc(size * size * 4);
  // Fill background with #0a0e1a
  for (let i = 0; i < size * size; i++) {
    dst[i * 4] = 10;
    dst[i * 4 + 1] = 14;
    dst[i * 4 + 2] = 26;
    dst[i * 4 + 3] = 255;
  }

  // Draw subtle circular glow in center
  const center = size / 2;
  const radius = size * 0.44;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < radius) {
        const factor = 1 - (dist / radius);
        const idx = (y * size + x) * 4;
        // Blend in a subtle cyan-blue ambient tint
        dst[idx] = Math.min(255, dst[idx] + Math.round(18 * factor));
        dst[idx + 1] = Math.min(255, dst[idx + 1] + Math.round(40 * factor));
        dst[idx + 2] = Math.min(255, dst[idx + 2] + Math.round(70 * factor));
      }
    }
  }

  // Content safe area: 72% of total size
  const contentSize = Math.round(size * 0.72);
  const resizedContent = resizeRgba(src, srcW, srcH, contentSize, contentSize);
  const startOffset = Math.round((size - contentSize) / 2);

  // Alpha blend
  for (let y = 0; y < contentSize; y++) {
    for (let x = 0; x < contentSize; x++) {
      const srcIdx = (y * contentSize + x) * 4;
      const dstIdx = ((y + startOffset) * size + (x + startOffset)) * 4;
      const alpha = resizedContent[srcIdx + 3] / 255;

      if (alpha > 0) {
        dst[dstIdx] = Math.round(resizedContent[srcIdx] * alpha + dst[dstIdx] * (1 - alpha));
        dst[dstIdx + 1] = Math.round(resizedContent[srcIdx + 1] * alpha + dst[dstIdx + 1] * (1 - alpha));
        dst[dstIdx + 2] = Math.round(resizedContent[srcIdx + 2] * alpha + dst[dstIdx + 2] * (1 - alpha));
        dst[dstIdx + 3] = 255;
      }
    }
  }
  return dst;
}

// Generate an iOS splash screen
function createSplashRgba(src, srcW, srcH, width, height) {
  const dst = Buffer.alloc(width * height * 4);
  // Fill background #0a0e1a
  for (let i = 0; i < width * height; i++) {
    dst[i * 4] = 10;
    dst[i * 4 + 1] = 14;
    dst[i * 4 + 2] = 26;
    dst[i * 4 + 3] = 255;
  }

  // Draw subtle dark luxury radial glow behind the emblem
  const cx = width / 2;
  const cy = height * 0.45; // slight upper-center bias like native iOS splash
  const glowRadius = Math.min(width, height) * 0.35;
  for (let y = Math.max(0, Math.floor(cy - glowRadius)); y < Math.min(height, Math.ceil(cy + glowRadius)); y++) {
    for (let x = Math.max(0, Math.floor(cx - glowRadius)); x < Math.min(width, Math.ceil(cx + glowRadius)); x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < glowRadius) {
        const factor = Math.pow(1 - (dist / glowRadius), 2);
        const idx = (y * width + x) * 4;
        dst[idx] = Math.min(255, dst[idx] + Math.round(15 * factor));
        dst[idx + 1] = Math.min(255, dst[idx + 1] + Math.round(45 * factor));
        dst[idx + 2] = Math.min(255, dst[idx + 2] + Math.round(90 * factor));
      }
    }
  }

  // Center emblem size (about 25-30% of screen width, max 256px)
  const emblemSize = Math.min(240, Math.round(width * 0.28));
  const resizedEmblem = resizeRgba(src, srcW, srcH, emblemSize, emblemSize);
  const startX = Math.round(cx - emblemSize / 2);
  const startY = Math.round(cy - emblemSize / 2);

  for (let y = 0; y < emblemSize; y++) {
    for (let x = 0; x < emblemSize; x++) {
      const srcIdx = (y * emblemSize + x) * 4;
      const dstIdx = ((y + startY) * width + (x + startX)) * 4;
      const alpha = resizedEmblem[srcIdx + 3] / 255;
      if (alpha > 0) {
        dst[dstIdx] = Math.round(resizedEmblem[srcIdx] * alpha + dst[dstIdx] * (1 - alpha));
        dst[dstIdx + 1] = Math.round(resizedEmblem[srcIdx + 1] * alpha + dst[dstIdx + 1] * (1 - alpha));
        dst[dstIdx + 2] = Math.round(resizedEmblem[srcIdx + 2] * alpha + dst[dstIdx + 2] * (1 - alpha));
        dst[dstIdx + 3] = 255;
      }
    }
  }
  return dst;
}

// Generate PWA preview screenshot (Mock mobile UI / desktop UI)
function createScreenshot(width, height, isMobile, emblemRgba, embW, embH) {
  const dst = Buffer.alloc(width * height * 4);
  // Fill gradient dark background #0a0e1a to #131b2e
  for (let y = 0; y < height; y++) {
    const factor = y / height;
    const r = Math.round(10 + 9 * factor);
    const g = Math.round(14 + 13 * factor);
    const b = Math.round(26 + 20 * factor);
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      dst[idx] = r;
      dst[idx + 1] = g;
      dst[idx + 2] = b;
      dst[idx + 3] = 255;
    }
  }

  // Draw a sleek mock navigation bar at the top
  const navHeight = isMobile ? Math.round(height * 0.08) : Math.round(height * 0.1);
  for (let y = 0; y < navHeight; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      dst[idx] = 16;
      dst[idx + 1] = 24;
      dst[idx + 2] = 42;
      dst[idx + 3] = 255;
    }
  }

  // Draw header accent line
  const lineY = navHeight - 1;
  for (let x = 0; x < width; x++) {
    const idx = (lineY * width + x) * 4;
    dst[idx] = 59;
    dst[idx + 1] = 130;
    dst[idx + 2] = 246; // #3b82f6 accent
    dst[idx + 3] = 255;
  }

  // Place emblem on screen
  const embSize = isMobile ? Math.round(width * 0.28) : Math.round(height * 0.22);
  const resized = resizeRgba(emblemRgba, embW, embH, embSize, embSize);
  const ex = Math.round(width / 2 - embSize / 2);
  const ey = Math.round(navHeight + height * 0.08);

  for (let y = 0; y < embSize; y++) {
    for (let x = 0; x < embSize; x++) {
      const srcIdx = (y * embSize + x) * 4;
      const dstIdx = ((y + ey) * width + (x + ex)) * 4;
      const a = resized[srcIdx + 3] / 255;
      if (a > 0) {
        dst[dstIdx] = Math.round(resized[srcIdx] * a + dst[dstIdx] * (1 - a));
        dst[dstIdx + 1] = Math.round(resized[srcIdx + 1] * a + dst[dstIdx + 1] * (1 - a));
        dst[dstIdx + 2] = Math.round(resized[srcIdx + 2] * a + dst[dstIdx + 2] * (1 - a));
      }
    }
  }

  // Draw mock card containers to represent engineering tools and portfolio sections
  const cardCount = isMobile ? 3 : 4;
  const startCardsY = ey + embSize + Math.round(height * 0.06);
  const cardH = isMobile ? Math.round(height * 0.12) : Math.round(height * 0.35);
  const cardW = isMobile ? Math.round(width * 0.88) : Math.round((width * 0.85) / cardCount);
  const cardGap = isMobile ? Math.round(height * 0.02) : Math.round(width * 0.02);

  for (let i = 0; i < cardCount; i++) {
    const cx = isMobile ? Math.round((width - cardW) / 2) : Math.round(width * 0.075 + i * (cardW + cardGap));
    const cy = isMobile ? startCardsY + i * (cardH + cardGap) : startCardsY;

    if (cy + cardH < height) {
      for (let y = cy; y < cy + cardH; y++) {
        for (let x = cx; x < cx + cardW; x++) {
          const idx = (y * width + x) * 4;
          // Card background with rounded-feel border
          const isBorder = (x === cx || x === cx + cardW - 1 || y === cy || y === cy + cardH - 1);
          if (isBorder) {
            dst[idx] = 40;
            dst[idx + 1] = 55;
            dst[idx + 2] = 85;
          } else {
            dst[idx] = 22;
            dst[idx + 1] = 30;
            dst[idx + 2] = 50;
          }
        }
      }
    }
  }

  return dst;
}

async function main() {
  console.log('--- Generating High-Res PWA Assets (Android, iOS, Desktop) ---');
  const sourceIconPath = path.join(PUBLIC_DIR, 'icon-512.png');
  const srcBuf = fs.readFileSync(sourceIconPath);
  const { width: srcW, height: srcH, rgba: srcRgba } = decodePng(srcBuf);
  console.log(`Loaded source icon: ${srcW}x${srcH}`);

  // 1. Standard icon sizes
  const standardSizes = [48, 72, 96, 128, 144, 152, 180, 192, 384, 512];
  for (const size of standardSizes) {
    const resized = resizeRgba(srcRgba, srcW, srcH, size, size);
    const pngBuf = encodePng(size, size, resized);
    const dest = path.join(PUBLIC_DIR, `icon-${size}.png`);
    fs.writeFileSync(dest, pngBuf);
    console.log(`Generated: icon-${size}.png (${size}x${size}, ${pngBuf.length} bytes)`);

    // Also copy to sites/ for relative paths
    fs.writeFileSync(path.join(SITES_DIR, `icon-${size}.png`), pngBuf);
  }

  // 2. Android Maskable Icons (192 & 512)
  for (const size of [192, 512]) {
    const maskableRgba = createMaskableIcon(srcRgba, srcW, srcH, size);
    const pngBuf = encodePng(size, size, maskableRgba);
    fs.writeFileSync(path.join(PUBLIC_DIR, `icon-maskable-${size}.png`), pngBuf);
    fs.writeFileSync(path.join(SITES_DIR, `icon-maskable-${size}.png`), pngBuf);
    console.log(`Generated: icon-maskable-${size}.png (Android Adaptive safe-zone, ${size}x${size}, ${pngBuf.length} bytes)`);
  }

  // 3. Apple Touch Icons
  const appleSizes = [
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'apple-touch-icon-180x180.png', size: 180 },
    { name: 'apple-touch-icon-167x167.png', size: 167 },
    { name: 'apple-touch-icon-152x152.png', size: 152 },
    { name: 'apple-touch-icon-120x120.png', size: 120 }
  ];
  for (const { name, size } of appleSizes) {
    // Apple touch icon: solid dark background with centered emblem fits iOS home screen aesthetics best
    const maskable = createMaskableIcon(srcRgba, srcW, srcH, size);
    const pngBuf = encodePng(size, size, maskable);
    fs.writeFileSync(path.join(PUBLIC_DIR, name), pngBuf);
    fs.writeFileSync(path.join(SITES_DIR, name), pngBuf);
    console.log(`Generated Apple Touch Icon: ${name} (${size}x${size})`);
  }

  // 4. Windows Tiles
  const mstileSizes = [
    { name: 'mstile-150x150.png', size: 150 },
    { name: 'mstile-310x310.png', size: 310 }
  ];
  for (const { name, size } of mstileSizes) {
    const tileRgba = createMaskableIcon(srcRgba, srcW, srcH, size);
    const pngBuf = encodePng(size, size, tileRgba);
    fs.writeFileSync(path.join(PUBLIC_DIR, name), pngBuf);
    console.log(`Generated Windows Tile: ${name} (${size}x${size})`);
  }

  // 5. iOS Apple Splash Screens (apple-touch-startup-image)
  const splashScreens = [
    { name: 'apple-splash-1290-2796.png', w: 1290, h: 2796, desc: 'iPhone 16 Pro Max / 15 Pro Max' },
    { name: 'apple-splash-1179-2556.png', w: 1179, h: 2556, desc: 'iPhone 16 Pro / 15 Pro / 15 / 14 Pro' },
    { name: 'apple-splash-1284-2778.png', w: 1284, h: 2778, desc: 'iPhone 14 Plus / 13 Pro Max / 12 Pro Max' },
    { name: 'apple-splash-1170-2532.png', w: 1170, h: 2532, desc: 'iPhone 14 / 13 / 13 Pro / 12 / 12 Pro' },
    { name: 'apple-splash-1125-2436.png', w: 1125, h: 2436, desc: 'iPhone 11 Pro / XS / X' },
    { name: 'apple-splash-828-1792.png', w: 828, h: 1792, desc: 'iPhone 11 / XR' },
    { name: 'apple-splash-750-1334.png', w: 750, h: 1334, desc: 'iPhone SE (2nd/3rd gen) / 8' },
    { name: 'apple-splash-2048-2732.png', w: 2048, h: 2732, desc: 'iPad Pro 12.9"' },
    { name: 'apple-splash-1668-2388.png', w: 1668, h: 2388, desc: 'iPad Pro 11"' },
    { name: 'apple-splash-1536-2048.png', w: 1536, h: 2048, desc: 'iPad 9.7" / iPad mini' }
  ];

  for (const splash of splashScreens) {
    const splashRgba = createSplashRgba(srcRgba, srcW, srcH, splash.w, splash.h);
    const pngBuf = encodePng(splash.w, splash.h, splashRgba);
    fs.writeFileSync(path.join(SPLASH_DIR, splash.name), pngBuf);
    console.log(`Generated iOS Splash: ${splash.name} (${splash.desc}, ${splash.w}x${splash.h}, ${(pngBuf.length/1024).toFixed(1)} KB)`);
  }

  // 6. Manifest Screenshots (for Android & Desktop Chrome rich install UI)
  const mobileShot = createScreenshot(750, 1334, true, srcRgba, srcW, srcH);
  const mobileShotBuf = encodePng(750, 1334, mobileShot);
  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'mobile-preview.png'), mobileShotBuf);
  console.log(`Generated Mobile Preview Screenshot: mobile-preview.png (${(mobileShotBuf.length/1024).toFixed(1)} KB)`);

  const desktopShot = createScreenshot(1280, 720, false, srcRgba, srcW, srcH);
  const desktopShotBuf = encodePng(1280, 720, desktopShot);
  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'desktop-preview.png'), desktopShotBuf);
  console.log(`Generated Desktop Preview Screenshot: desktop-preview.png (${(desktopShotBuf.length/1024).toFixed(1)} KB)`);

  // 7. browserconfig.xml for Windows
  const browserConfigXml = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/mstile-150x150.png"/>
      <square310x310logo src="/mstile-310x310.png"/>
      <TileColor>#0a0e1a</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'browserconfig.xml'), browserConfigXml, 'utf8');
  console.log('Generated: browserconfig.xml');

  console.log('All PWA assets generated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
