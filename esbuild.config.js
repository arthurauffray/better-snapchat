const ESBuild = require('esbuild');
const EsbuildPluginImportGlob = require('esbuild-plugin-import-glob');
const CSSModulesPlugin = require('esbuild-css-modules-plugin');
const package = require('./package.json');
const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const isDev = process.env.NODE_ENV === 'development';

function getEntry(name) {
  return [`./src/${name}`, ...(isDev ? [`mv3-hot-reload/${name}`] : [])];
}

(async () => {
  console.log('Building: Extension');

  await ESBuild.build({
    entryPoints: [...getEntry('background'), ...getEntry('content')],
    bundle: true,
    minify: true,
    sourcemap: false,
    outdir: './public/build/',
    plugins: [EsbuildPluginImportGlob.default(), CSSModulesPlugin()],
    logLevel: 'info',
    entryNames: '[dir]/[name]',
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.MV3_HOT_RELOAD_PORT': JSON.stringify(process.env.MV3_HOT_RELOAD_PORT),
    },
  });

  const manifest = {
    manifest_version: 3,
    name: package.name,
    description: package.description,
    version: package.version,
    icons: {
      32: 'logo32.png',
      48: 'logo48.png',
      96: 'logo96.png',
      128: 'logo128.png',
    },
    content_scripts: [
      {
        matches: ['https://web.snapchat.com/*'],
        js: ['./build/src/content.js'],
        run_at: 'document_start',
      },
    ],
    background: {
      service_worker: './build/src/background.js',
    },
  };

  await fs.writeFile('./public/manifest.json', JSON.stringify(manifest, null, 2));
})();
