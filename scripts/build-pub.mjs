#!/usr/bin/env node

import { createWriteStream } from 'fs';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

async function build() {
  // Read version from manifest
  const manifest = JSON.parse(
    await readFile(join(rootDir, 'dist', 'manifest.json'), 'utf-8')
  );
  const version = manifest.version;
  const zipName = `hint-${version}.zip`;
  const outputPath = join(rootDir, zipName);

  console.log(`📦 Creating ${zipName}...`);

  const output = createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    const size = (archive.pointer() / 1024).toFixed(2);
    console.log(`✅ Created ${zipName} (${size} KB)`);
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);

  // Add dist directory contents, excluding system files
  archive.glob('**/*', {
    cwd: join(rootDir, 'dist'),
    ignore: ['.DS_Store', 'Thumbs.db', '*.map'],
  });

  await archive.finalize();
}

build().catch((err) => {
  console.error('❌ Build failed:', err.message);
  process.exit(1);
});
