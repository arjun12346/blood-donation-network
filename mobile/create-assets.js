const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Minimal valid 1x1 transparent PNG (base64)
const transparentPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

const imageFiles = ['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png', 'notification-icon.png'];
imageFiles.forEach(file => {
  const filePath = path.join(assetsDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, transparentPng);
    console.log(`Created: ${file}`);
  } else {
    console.log(`Exists: ${file}`);
  }
});

// Minimal valid WAV header (silent)
const wavHeader = Buffer.from([0x52,0x49,0x46,0x46,0x24,0x00,0x00,0x00,0x57,0x41,0x56,0x45,0x66,0x6D,0x74,0x20,0x10,0x00,0x00,0x00,0x01,0x00,0x01,0x00,0x44,0xAC,0x00,0x00,0x88,0x58,0x01,0x00,0x02,0x00,0x10,0x00,0x64,0x61,0x74,0x61,0x00,0x00,0x00,0x00]);
const wavPath = path.join(assetsDir, 'notification-sound.wav');
if (!fs.existsSync(wavPath)) {
  fs.writeFileSync(wavPath, wavHeader);
  console.log('Created: notification-sound.wav');
} else {
  console.log('Exists: notification-sound.wav');
}

console.log('All placeholder assets ready!');

