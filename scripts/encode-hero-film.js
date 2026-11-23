const fs = require('fs');

// Read the clean film binary
const filmBuf = fs.readFileSync('public/hero/pataspace-city-film.mp4');
console.log('film file size:', filmBuf.length);

// Encode to base64 (always ASCII-safe)
const b64 = filmBuf.toString('base64');
console.log('base64 length:', b64.length);

// Validate roundtrip
const re = Buffer.from(b64, 'base64');
const ok = re.length === filmBuf.length && re.toString('hex') === filmBuf.toString('hex');
console.log('roundtrip OK:', ok);
if (!ok) {
  console.error('ERROR: base64 roundtrip failed — aborting write');
  process.exit(1);
}

// Verify MP4 header
console.log('first 32 bytes hex:', filmBuf.slice(0, 32).toString('hex'));
console.log('ftyp:', filmBuf.slice(4, 8).toString('ascii'));

// Write the module as an ES module with a template literal holding the base64
const mod = `export const HERO_FILM_BASE64 = \`
${b64}\`
`;
fs.writeFileSync('src/server/hero-film.ts', mod);
console.log('wrote src/server/hero-film.ts, size:', mod.length);
