// Regenerate out/INDEX.md, the catalog of every rendered video.
//   node scripts/catalog.mjs
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {writeIndex} = require('./output-layout.cjs');

const {file, count} = writeIndex();
console.log(`Catalogued ${count} video(s) -> ${file}`);
