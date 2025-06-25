#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Simple build script for the extension
console.log('Building Hoarder Extension...')

// Check if required files exist
const requiredFiles = [
  'manifest.json',
  'popup.html',
  'popup.css',
  'popup.js',
  'popup.bundle.js',
  'background.js',
  'background.bundle.js',
  'content.js',
  'lib/supabase.js',
  'lib/auth.js',
  'lib/bookmarks.js'
]

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file))

if (missingFiles.length > 0) {
  console.error('❌ Missing required files:')
  missingFiles.forEach(file => console.error(`  - ${file}`))
  process.exit(1)
}

// Check if icons exist
const iconSizes = [16, 32, 48, 128]
const missingIcons = iconSizes.filter(size => {
  const iconPath = `icons/icon${size}.png`
  return !fs.existsSync(iconPath)
})

if (missingIcons.length > 0) {
  console.warn('⚠️  Missing icon files:')
  missingIcons.forEach(size => console.warn(`  - icons/icon${size}.png`))
  console.warn('  Please create these icon files before publishing the extension.')
}

// Check Supabase configuration
const supabaseFile = fs.readFileSync('lib/supabase.js', 'utf8')
if (supabaseFile.includes('YOUR_SUPABASE_URL') || supabaseFile.includes('YOUR_SUPABASE_ANON_KEY')) {
  console.warn('⚠️  Supabase credentials not configured.')
  console.warn('  Please update lib/supabase.js with your actual credentials.')
}

console.log('✅ Extension build check completed!')
console.log('')
console.log('To load the extension in Chrome:')
console.log('1. Open chrome://extensions/')
console.log('2. Enable "Developer mode"')
console.log('3. Click "Load unpacked"')
console.log('4. Select this extension folder')
console.log('')
console.log('To configure keyboard shortcuts:')
console.log('1. Go to chrome://extensions/shortcuts')
console.log('2. Find "Hoarder Bookmark Extension"')
console.log('3. Click the pencil icon to customize shortcuts')
console.log('')
console.log('To rebuild after changes:')
console.log('  npm run build        # Production build (minified)')
console.log('  npm run build:dev    # Development build')
console.log('  npm run watch        # Watch mode for development') 