const { createCanvas } = require('canvas');
const fs = require('fs');

const sizes = [16, 32, 48, 128];
const bgColor = '#2563eb'; // Hoarder blue
const emoji = '🧠';

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Emoji
  ctx.font = `${size * 0.7}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillText(emoji, size / 2, size / 2 + (size * 0.05));

  const out = fs.createWriteStream(`icons/icon${size}.png`);
  const stream = canvas.createPNGStream();
  stream.pipe(out);
  out.on('finish', () => console.log(`Created icons/icon${size}.png`));
}); 