import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a temporary directory for packaging
const tempDir = path.join(__dirname, 'extension-package');
const extensionDir = path.join(__dirname, 'extension');

// Clean up any existing temp directory
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

// Create temp directory
fs.mkdirSync(tempDir, { recursive: true });

// Files to include in the extension package
const filesToInclude = [
  'manifest.json',
  'popup.html',
  'popup.css',
  'popup.bundle.js',
  'background.bundle.js',
  'content.js',
  'icons/icon16.png',
  'icons/icon32.png',
  'icons/icon48.png',
  'icons/icon128.png'
];

console.log('Packaging Chrome extension...');

// Copy files to temp directory
filesToInclude.forEach(file => {
  const sourcePath = path.join(extensionDir, file);
  const destPath = path.join(tempDir, file);
  
  // Create directory structure if needed
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✓ Copied: ${file}`);
  } else {
    console.warn(`⚠ Warning: ${file} not found`);
  }
});

// Create zip file
const zipFileName = 'hoarder-extension.zip';
const zipPath = path.join(__dirname, zipFileName);

try {
  // Remove existing zip if it exists
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  
  // Create zip file (using zip command)
  execSync(`cd "${tempDir}" && zip -r "${zipPath}" .`, { stdio: 'inherit' });
  
  console.log(`\n✅ Extension packaged successfully: ${zipFileName}`);
  console.log(`📁 Package location: ${zipPath}`);
  console.log('\n📋 Files included:');
  filesToInclude.forEach(file => {
    console.log(`   - ${file}`);
  });
  
  // Verify manifest.json is at root
  const zipContent = execSync(`unzip -l "${zipPath}"`, { encoding: 'utf8' });
  if (zipContent.includes('manifest.json')) {
    console.log('\n✅ Verified: manifest.json is at the root of the zip file');
  } else {
    console.error('\n❌ Error: manifest.json not found at root of zip file');
  }
  
} catch (error) {
  console.error('❌ Error creating zip file:', error.message);
  console.log('\n💡 Alternative: You can manually zip the contents of the extension-package directory');
} finally {
  // Clean up temp directory
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('\n🧹 Cleaned up temporary files');
  }
} 