/**
 * Icon Generation Script for PakLoad Mobile App
 * 
 * This script converts SVG icons to PNG format for Android/iOS
 * 
 * Prerequisites:
 * npm install sharp
 * 
 * Usage:
 * node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not installed. Creating placeholder icons...');
  console.log('For high-quality icons, run: npm install sharp && node scripts/generate-icons.js\n');
  
  // Create placeholder PNGs with base64 encoded simple images
  createPlaceholderIcons();
  process.exit(0);
}

const iconSizes = {
  'icon.png': 1024,
  'adaptive-icon.png': 1024,
  'favicon.png': 48,
  'splash.png': 1284,
};

async function generateIcons() {
  console.log('Generating PakLoad icons...\n');
  
  for (const [filename, size] of Object.entries(iconSizes)) {
    const svgFile = filename.replace('.png', '.svg');
    const svgPath = path.join(assetsDir, svgFile);
    const pngPath = path.join(assetsDir, filename);
    
    if (fs.existsSync(svgPath)) {
      try {
        let width = size;
        let height = size;
        
        // Splash screen has different dimensions
        if (filename === 'splash.png') {
          width = 1284;
          height = 2778;
        }
        
        await sharp(svgPath)
          .resize(width, height)
          .png()
          .toFile(pngPath);
        
        console.log(`✓ Generated ${filename} (${width}x${height})`);
      } catch (err) {
        console.error(`✗ Error generating ${filename}:`, err.message);
      }
    } else {
      console.log(`⚠ SVG source not found: ${svgFile}`);
    }
  }
  
  console.log('\nIcon generation complete!');
}

function createPlaceholderIcons() {
  console.log('Creating placeholder icons with embedded graphics...\n');
  
  // Create simple placeholder PNGs using pure Node.js
  // These are minimal valid PNG files
  
  const placeholders = {
    'icon.png': createSimplePNG(1024, 1024, [22, 163, 74]), // Green
    'adaptive-icon.png': createSimplePNG(1024, 1024, [22, 163, 74]),
    'favicon.png': createSimplePNG(48, 48, [22, 163, 74]),
    'splash.png': createSimplePNG(1284, 2778, [22, 163, 74]),
  };
  
  for (const [filename, data] of Object.entries(placeholders)) {
    const pngPath = path.join(assetsDir, filename);
    fs.writeFileSync(pngPath, data);
    console.log(`✓ Created placeholder ${filename}`);
  }
  
  console.log('\nPlaceholder icons created!');
  console.log('For production-quality icons, install sharp and run again:');
  console.log('  npm install sharp');
  console.log('  node scripts/generate-icons.js');
}

// Create a minimal valid PNG (solid color)
function createSimplePNG(width, height, rgb) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);
  
  // IDAT chunk (compressed image data)
  const zlib = require('zlib');
  const rawData = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 3 + 1)] = 0; // filter type
    for (let x = 0; x < width; x++) {
      const offset = y * (width * 3 + 1) + 1 + x * 3;
      rawData[offset] = rgb[0];
      rawData[offset + 1] = rgb[1];
      rawData[offset + 2] = rgb[2];
    }
  }
  const compressed = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressed);
  
  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(data) {
  let crc = 0xffffffff;
  const table = getCRCTable();
  
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  
  return crc ^ 0xffffffff;
}

function getCRCTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  return table;
}

// Run
if (sharp) {
  generateIcons().catch(console.error);
} else {
  createPlaceholderIcons();
}
