const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../client/dist');
const dest = path.resolve(__dirname, '../dist');

if (fs.existsSync(src)) {
  fs.cpSync(src, dest, { recursive: true });
  console.log(`[Hostinger Build] Synced ${src} -> ${dest}`);
}
