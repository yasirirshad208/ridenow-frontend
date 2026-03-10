const fs = require('fs');
const path = require('path');

const nextDir = path.join(process.cwd(), '.next');

try {
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('Removed .next cache directory.');
  } else {
    console.log('.next cache directory not found, skipping.');
  }
} catch (error) {
  console.warn('Could not fully clean .next cache:', error.message);
}

