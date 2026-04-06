const fs = require('fs');

const cropInfoPath = './src/data/cropInfo.js';
const calendarPath = './src/pages/CropCalendar.jsx';
const predictionPath = './src/pages/PredictionPage.jsx';

const calendarMapping = {
  rice: 'rice.jpg',
  maize: 'maize.webp',
  cotton: 'cotton.jpg',
  jute: 'jute.JPG',
  'mung bean': 'mung-bean.jpg',
  'black gram': 'black gram.jpg',
  'pigeon peas': 'pigeon beans.jpg',
  'moth beans': 'moth beans.JPG',
  chickpea: 'Chickpea_BNC.jpg',
  lentil: 'lentils.png',
  'kidney beans': 'kidney beans.jpg',
  apple: 'apple.jpg',
  watermelon: 'watermelon.jpg',
  muskmelon: 'muskmelon.jpg',
  banana: 'banana.jpg',
  mango: 'mango.jpg',
  coconut: 'coconut.jpg',
  coffee: 'coffee.jpg',
  papaya: 'papaya.jpg',
  grapes: 'grapes.jpg',
  orange: 'orange.jpg',
  pomegranate: 'pomegranate.jpg',
};

// 1. Update cropInfo.js
let cropInfo = fs.readFileSync(cropInfoPath, 'utf8');

// Replace `image: "/images/xyz.jpg"` with `image: "/images/detail/xyz.jpg", calendarImage: "/images/calendar/..."`
for (const [key, calendarFile] of Object.entries(calendarMapping)) {
  const regex = new RegExp(`(\\s+)(${key.includes(' ') ? `"${key}"` : key}):\\s*\\{[\\s]*image:\\s*"/images/([^"]+)"`, 'g');
  cropInfo = cropInfo.replace(regex, (match, p1, p2, oldImage) => {
    return `${p1}${p2}: {\n    image: "/images/detail/${oldImage}",\n    calendarImage: "/images/calendar/${calendarFile}"`;
  });
}
fs.writeFileSync(cropInfoPath, cropInfo);

// 2. Update CropCalendar.jsx
let calendarFileContent = fs.readFileSync(calendarPath, 'utf8');

// Replace `/images/xyz.jpg` with `/images/calendar/...`
for (const [key, calendarFile] of Object.entries(calendarMapping)) {
  // e.g. { crop: "Rice", image: "/images/rice.jpg"
  // Match `crop: "Rice"` or `crop: "Mung Bean"` then `image: "/images/... "`
  // We'll just carefully replace the exact strings. Wait, in CropCalendar the keys are capitalized.
  const cropTitle = key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const regex = new RegExp(`crop:\\s*"${cropTitle}",\\s*image:\\s*"/images/[^"]+"`, 'g');
  calendarFileContent = calendarFileContent.replace(regex, `crop: "${cropTitle}",        image: "/images/calendar/${calendarFile}"`);
}
fs.writeFileSync(calendarPath, calendarFileContent);

// 3. Update PredictionPage.jsx to use calendarImage instead of image
let predContent = fs.readFileSync(predictionPath, 'utf8');
predContent = predContent.replace(/getCropInfo\(result\.recommendedCrop\)\?\.image/g, "getCropInfo(result.recommendedCrop)?.calendarImage");
fs.writeFileSync(predictionPath, predContent);

console.log('Update complete!');
