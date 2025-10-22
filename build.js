import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create popup.html in dist
const popupHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blink</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 350px;
      min-height: 300px;
      background: #0f0f0f;
      color: #e8e8e8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      font-size: 14px;
    }
    #popup-root {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="popup-root"></div>
  <script type="module" src="popup.js"><\/script>
</body>
</html>`;

// Create dashboard.html in dist
const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blink - Dashboard</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      height: 100%;
      background: #0f0f0f;
      color: #e8e8e8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      font-size: 14px;
    }
    #root {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="dashboard.js"><\/script>
</body>
</html>`;

// Create search.html in dist
const searchHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blink Search</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      color: #e8e8e8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      font-size: 14px;
    }
    #search-root {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="search-root"></div>
  <script type="module" src="search.js"><\/script>
</body>
</html>`;

const distDir = path.join(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write popup.html
fs.writeFileSync(path.join(distDir, 'popup.html'), popupHtml);
console.log('✓ Created dist/popup.html');

// Write dashboard.html
fs.writeFileSync(path.join(distDir, 'dashboard.html'), dashboardHtml);
console.log('✓ Created dist/dashboard.html');

// Write search.html
fs.writeFileSync(path.join(distDir, 'search.html'), searchHtml);
console.log('✓ Created dist/search.html');

// Copy manifest.json
const manifestSrc = path.join(__dirname, 'public', 'manifest.json');
const manifestDest = path.join(distDir, 'manifest.json');
fs.copyFileSync(manifestSrc, manifestDest);
console.log('✓ Copied dist/manifest.json');

// Copy icons
const iconsDir = path.join(__dirname, 'public', 'icons');
const iconsDestDir = path.join(distDir, 'icons');
if (fs.existsSync(iconsDir)) {
  if (!fs.existsSync(iconsDestDir)) {
    fs.mkdirSync(iconsDestDir, { recursive: true });
  }
  fs.readdirSync(iconsDir).forEach(file => {
    fs.copyFileSync(path.join(iconsDir, file), path.join(iconsDestDir, file));
  });
  console.log('✓ Copied dist/icons/');
}

console.log('\n✓ Post-build completed!');
