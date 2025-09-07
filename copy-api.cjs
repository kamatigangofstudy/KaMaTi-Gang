// This script copies the src/app/api directory to build/server/src/app/api after build
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'app', 'api');
const destDir = path.join(__dirname, 'build', 'server', 'src', 'app', 'api');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  fs.readdirSync(src).forEach((item) => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

if (fs.existsSync(srcDir)) {
  copyDir(srcDir, destDir);
  console.log('API directory copied to build/server/src/app/api');
} else {
  console.error('Source API directory does not exist:', srcDir);
  process.exit(1);
}
