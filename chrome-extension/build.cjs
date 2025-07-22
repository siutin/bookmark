const fs = require('fs');
const path = require('path');

const filesToCopy = [
  { src: 'manifest.json', dest: 'manifest.json' },
  { src: path.join('src', 'background.js'), dest: 'background.js' },
  { src: 'popup.html', dest: 'popup.html' },
  { src: path.join('src', 'popup.js'), dest: 'popup.js' },
  { src: path.join('assets', 'app_16.png'), dest: 'app_16.png' },
  { src: path.join('assets', 'app_32.png'), dest: 'app_32.png' },
  { src: path.join('assets', 'app_48.png'), dest: 'app_48.png' },
  { src: path.join('assets', 'app_128.png'), dest: 'app_128.png' }
];

const outDir = path.join('dist');
const outFull = path.resolve(__dirname, outDir);

// Remove output directory if it exists
if (fs.existsSync(outFull)) {
  fs.rmSync(outFull, { recursive: true, force: true });
}
fs.mkdirSync(outFull, { recursive: true });

for (const file of filesToCopy) {
  const srcPath = path.resolve(__dirname, file.src);
  const destPath = path.resolve(outFull, file.dest);
  if (file.dest === 'background.js') {
    // Inject API_BASE
    let content = fs.readFileSync(srcPath, 'utf8');
    const apiBase = process.env.API_BASE || 'http://localhost:8787';
    content = content.replace(
      /const apiBase = [^;]+;/,
      `const apiBase = '${apiBase}'; // Injected by build.cjs`
    );
    fs.writeFileSync(destPath, content);
    console.log(`Injected API_BASE and copied ${file.src} -> ${path.join(outDir, file.dest)}`);
  } else {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file.src} -> ${path.join(outDir, file.dest)}`);
  }
}

console.log('Tekcop extension bundled in', outDir); 