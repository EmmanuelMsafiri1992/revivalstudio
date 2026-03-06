const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateFavicon() {
  const inputPath = path.join(__dirname, '../public/logo.jpg');
  const outputDir = path.join(__dirname, '../src/app');
  const publicDir = path.join(__dirname, '../public');

  console.log('Loading logo...');

  // Get image metadata
  const metadata = await sharp(inputPath).metadata();
  console.log(`Original size: ${metadata.width}x${metadata.height}`);

  // Crop to the icon part (top portion with furniture, excluding text)
  // The furniture illustration is roughly in the top 60% of the image
  const cropHeight = Math.floor(metadata.height * 0.55);
  const cropWidth = metadata.width;

  // Create a square crop centered on the furniture illustration
  const squareSize = Math.min(cropWidth, cropHeight);
  const left = Math.floor((metadata.width - squareSize) / 2);
  const top = 0;

  console.log('Cropping and resizing...');

  // Generate different sizes
  const sizes = [16, 32, 48, 64, 128, 180, 192, 512];

  // Create base cropped image
  const croppedBuffer = await sharp(inputPath)
    .extract({
      left: left,
      top: top,
      width: squareSize,
      height: squareSize
    })
    .toBuffer();

  // Generate PNG icons for different sizes
  for (const size of sizes) {
    const outputPath = path.join(publicDir, `icon-${size}.png`);
    await sharp(croppedBuffer)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toFile(outputPath);
    console.log(`Generated: icon-${size}.png`);
  }

  // Generate favicon.ico (32x32)
  const faviconPath = path.join(outputDir, 'favicon.ico');
  await sharp(croppedBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(faviconPath.replace('.ico', '.png'));

  // Also save as ico in public
  await sharp(croppedBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  // Generate apple-touch-icon
  await sharp(croppedBuffer)
    .resize(180, 180, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated: apple-touch-icon.png');

  console.log('\nFavicon generation complete!');
  console.log('Note: The PNG files have been created. For a true .ico file, you may need to use an online converter.');
}

generateFavicon().catch(console.error);
