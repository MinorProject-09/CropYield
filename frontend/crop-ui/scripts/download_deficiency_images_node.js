console.log('script starting');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const pages = {
  banana: 'https://www.yara.in/crop-nutrition/bananas/nutrient-deficiencies-banana/',
  citrus: 'https://www.yara.in/crop-nutrition/citrus/all-citrus-articles/',
  coffee: 'https://www.yara.in/crop-nutrition/coffee/nutrient-deficiencies-coffee/',
  grapes: 'https://www.yara.in/crop-nutrition/grapes-table/nutrient-deficiencies-table-grape/',
  onion: 'https://www.yara.in/crop-nutrition/onion/nutrient-deficiencies-onions/',
  potato: 'https://www.yara.in/crop-nutrition/potato/nutrient-deficiencies-potatoes/',
  sugarcane: 'https://www.yara.in/crop-nutrition/sugarcane/nutrient-deficiencies-sugarcane/',
  tomato: 'https://www.yara.in/crop-nutrition/tomato/nutrient-deficiencies-tomato/',
  cabbage: 'https://www.yara.in/crop-nutrition/cabbages/nutrient-deficiencies-cabbage/',
  cauliflower: 'https://www.yara.in/crop-nutrition/cauliflower/nutrient-deficiencies-cauliflower/',
  broccoli: 'https://www.yara.in/crop-nutrition/broccoli/nutrient-deficiencies-broccoli/',
  wheat: 'https://www.yara.in/crop-nutrition/wheat/nutrient-deficiencies-wheat/',
};

const outDir = path.join(__dirname, '..', 'public', 'assets', 'nutrient-deficiencies');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function fetchUrl(url, callback) {
  const lib = url.startsWith('https') ? https : http;
  lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return fetchUrl(res.headers.location, callback);
    }
    let data = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => callback(null, data));
  }).on('error', callback);
}

function downloadFile(url, filepath, cb) {
  const lib = url.startsWith('https') ? https : http;
  lib.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return downloadFile(res.headers.location, filepath, cb);
    }
    const file = fs.createWriteStream(filepath);
    res.pipe(file);
    file.on('finish', () => file.close(cb));
    file.on('error', (err) => cb(err));
  }).on('error', cb);
}

function normalizeUrl(src) {
  if (!src) return null;
  if (src.startsWith('//')) return 'https:' + src;
  if (src.startsWith('/')) return 'https://www.yara.in' + src;
  if (!/^https?:\/\//i.test(src)) return null;
  return src;
}

function isLikelyDeficiencyImage(url) {
  return /deficiency|nutrient|leaf|plant|crop|symptom/i.test(url);
}

function processCrop(crop, url, done) {
  console.log('Processing', crop);
  fetchUrl(url, function(err, html) {
    if (err) {
      console.error('Failed to fetch', url, err.message);
      return done();
    }

    const regex = /<img[^>]+src=["']([^"']+)["']/gi;
    const found = new Set();
    let m;
    while ((m = regex.exec(html)) !== null) {
      const src = normalizeUrl(m[1]);
      if (!src) continue;
      if (isLikelyDeficiencyImage(src)) found.add(src);
    }

    const imgs = Array.from(found);
    console.log('  found', imgs.length, 'image URLs');

    let count = 0;
    if (imgs.length === 0) return done();

    imgs.forEach((imgUrl, idx) => {
      const parsed = path.parse(new URL(imgUrl).pathname);
      let ext = parsed.ext.toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) ext = '.jpg';
      const filename = `${crop}_${idx + 1}${ext}`;
      const outPath = path.join(outDir, filename);
      if (fs.existsSync(outPath)) {
        count += 1;
        if (count === imgs.length) done();
        return;
      }
      downloadFile(imgUrl, outPath, (err) => {
        if (err) console.error('  download error', imgUrl, err.message);
        else console.log('  saved', filename);
        count += 1;
        if (count === imgs.length) done();
      });
    });
  });
}

const crops = Object.keys(pages);
let i = 0;

function next() {
  if (i >= crops.length) {
    console.log('All done');
    return;
  }
  const crop = crops[i++];
  processCrop(crop, pages[crop], next);
}

next();
