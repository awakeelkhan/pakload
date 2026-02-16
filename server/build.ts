// Server build script - for production deployment
import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';

const distDir = path.join(process.cwd(), 'dist');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Build the server with esbuild
async function buildServer() {
  try {
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      outfile: 'dist/server.js',
      format: 'esm',
      external: [
        'pg-native',
        'better-sqlite3',
        'mysql2',
        'tedious',
        'oracledb',
        'pg-query-stream',
      ],
      sourcemap: true,
      minify: false,
    });
    console.log('✅ Server build complete - ready for production');
  } catch (error) {
    console.error('❌ Server build failed:', error);
    process.exit(1);
  }
}

buildServer();
