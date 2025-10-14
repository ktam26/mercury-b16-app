#!/usr/bin/env node
/**
 * Build script for Apps SDK React widgets
 * Bundles each widget into a standalone JavaScript file with inline CSS
 */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const widgetsDir = path.join(__dirname, 'widgets');
const distDir = path.join(__dirname, 'dist');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Widget directories to build
const widgets = [
  'next-match',
  'schedule',
  'roster',
  'player-stats'
];

async function buildWidget(widgetName) {
  const entryPoint = path.join(widgetsDir, widgetName, 'index.tsx');
  const outfile = path.join(distDir, `${widgetName}.js`);

  // Check if entry point exists
  if (!fs.existsSync(entryPoint)) {
    console.warn(`⚠️  Skipping ${widgetName}: entry point not found`);
    return;
  }

  try {
    await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      outfile,
      format: 'iife',
      target: 'es2020',
      jsx: 'automatic',
      minify: true,
      loader: {
        '.css': 'text',
        '.svg': 'dataurl'
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      external: []
    });

    console.log(`✅ Built ${widgetName} → ${outfile}`);
  } catch (error) {
    console.error(`❌ Error building ${widgetName}:`, error);
    process.exit(1);
  }
}

async function buildAll() {
  console.log('🔨 Building Apps SDK widgets...\n');

  for (const widget of widgets) {
    await buildWidget(widget);
  }

  console.log('\n✨ Widget build complete!');
}

buildAll().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
