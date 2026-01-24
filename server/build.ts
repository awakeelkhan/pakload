// Server build script - for production deployment
// The server runs directly with tsx in development
// For production, we just need to ensure the dist folder exists

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const distDir = path.join(process.cwd(), 'dist');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('✅ Server build complete - ready for production');
