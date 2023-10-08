/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/extensions, import/no-unresolved */
import Logger from './lib/logger';

document.addEventListener('DOMContentLoaded', async () => {
  if (process.env.NODE_ENV === 'development') {
    import('mv3-hot-reload/content');
  }
  // @ts-ignore
  import('./modules/**/index.ts');
  Logger.log('Modules loadeds');
});
