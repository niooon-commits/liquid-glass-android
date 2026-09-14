/**
 * NIOOON Material Symbols Sync Utility
 * Extracts and maps Google Material Symbols vector XMLs from @expo/material-symbols
 * to Android app res/drawable directory.
 */
const fs = require('fs');
const path = require('path');

const ICON_MAP = [
  'download', 'folder', 'description', 'image', 'movie',
  'music_note', 'android', 'delete', 'share', 'more_vert', 'search',
  'arrow_back', 'check_circle', 'security', 'content_copy', 'close',
  'refresh', 'add', 'tab', 'home', 'info', 'settings', 'filter_list',
  'pause', 'play_arrow'
];

const srcDir = path.resolve(__dirname, '../node_modules/@expo/material-symbols/icons');
const destDir = path.resolve(__dirname, '../android/app/src/main/res/drawable');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

let count = 0;
ICON_MAP.forEach(name => {
  const srcFile = path.join(srcDir, `${name}.xml`);
  const destFile = path.join(destDir, `ic_${name}.xml`);
  if (fs.existsSync(srcFile)) {
    let content = fs.readFileSync(srcFile, 'utf-8');
    // Strip static tint attribute to allow dynamic Compose Icon tinting
    content = content.replace(/\s*android:tint="\?attr\/colorControlNormal"/g, '');
    fs.writeFileSync(destFile, content, 'utf-8');
    count++;
  }
});

console.log(`[material-symbols] Synced ${count} Material Symbols to android/app/src/main/res/drawable/`);
