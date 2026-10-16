const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'public', 'images');
fs.mkdirSync(targetDir, { recursive: true });

function copySafe(src, destName) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(targetDir, destName));
    console.log('Copied:', destName);
  }
}

copySafe('E:\\BonneApetit\\Bonneappetite-Cover.png', 'cover.png');
copySafe('E:\\BonneApetit\\Bonneappetite-profile.png', 'logo.png');
copySafe('E:\\BonneApetit\\BonneApetit\\Box0.png', 'box.png');

const photoDir = 'E:\\BonneApetit\\Photo';
if (fs.existsSync(photoDir)) {
  const files = fs.readdirSync(photoDir);
  for (const file of files) {
    if (/\.(jpg|jpeg|png)$/i.test(file)) {
      copySafe(path.join(photoDir, file), file);
    }
  }
}

console.log('Finished copying images.');
