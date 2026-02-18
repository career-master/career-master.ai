const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateFavicon() {
  const logoPath = path.join(__dirname, '..', 'public', 'logo.jpeg');
  const appDir = path.join(__dirname, '..', 'app');
  
  try {
    // Read the original logo
    const image = sharp(logoPath);
    const metadata = await image.metadata();
    
    console.log(`Original image: ${metadata.width}x${metadata.height}`);
    
    // Crop the left portion (icon part) - approximately 40% of width contains the icon
    const iconWidth = Math.floor(metadata.height * 0.9); // Make it roughly square based on height
    
    // Extract the icon portion from the left side
    const iconBuffer = await sharp(logoPath)
      .extract({
        left: 0,
        top: 0,
        width: Math.min(iconWidth, Math.floor(metadata.width * 0.4)),
        height: metadata.height
      })
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toBuffer();
    
    // Save as icon.png in app folder
    const iconPath = path.join(appDir, 'icon.png');
    await sharp(iconBuffer).toFile(iconPath);
    console.log(`✓ Created ${iconPath}`);
    
    // Also create apple-icon.png (180x180)
    const appleIconPath = path.join(appDir, 'apple-icon.png');
    await sharp(iconBuffer)
      .resize(180, 180)
      .toFile(appleIconPath);
    console.log(`✓ Created ${appleIconPath}`);
    
    // Create favicon.ico replacement (32x32 PNG as fallback)
    const favicon32Path = path.join(appDir, 'favicon-32.png');
    await sharp(iconBuffer)
      .resize(32, 32)
      .toFile(favicon32Path);
    console.log(`✓ Created ${favicon32Path}`);
    
    console.log('\n✅ Favicon generation complete!');
    console.log('The icon.png and apple-icon.png files have been created in the app folder.');
    console.log('Next.js will automatically use these as your favicon.');
    
  } catch (error) {
    console.error('Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();
