// Content script for Hoarder extension

// Extract metadata from the current page
function extractPageMetadata() {
  const title = document.title || ''
  const url = window.location.href
  const description = getMetaContent('description') || ''
  const imageUrl = getMetaContent('og:image') || getMetaContent('twitter:image') || ''
  
  // Determine platform based on URL
  let platform = 'web'
  if (url.includes('twitter.com') || url.includes('x.com')) {
    platform = 'twitter'
  } else if (url.includes('linkedin.com')) {
    platform = 'linkedin'
  } else if (url.includes('reddit.com')) {
    platform = 'reddit'
  } else if (url.includes('tiktok.com')) {
    platform = 'tiktok'
  }

  return {
    title,
    url,
    description,
    imageUrl,
    platform
  }
}

// Helper function to get meta content
function getMetaContent(name) {
  const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
  return meta ? meta.getAttribute('content') : ''
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'GET_PAGE_METADATA':
      const metadata = extractPageMetadata()
      sendResponse({ metadata })
      break

    default:
      sendResponse({ error: 'Unknown message type' })
  }
})

// Notify that content script is loaded
console.log('Hoarder extension content script loaded') 