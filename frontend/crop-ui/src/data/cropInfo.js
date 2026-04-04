/**
 * Crop info cards — growing tips, season, water needs, ideal pH, duration.
 * Keys are lowercase crop names matching ML model output.
 */
export const CROP_INFO = {
  rice:         { emoji: "🌾", season: "Kharif",  water: "High",   ph: "5.5–7.0", days: "90–150",  tip: "Needs flooded or waterlogged soil. Transplant seedlings 25–30 days after sowing." },
  wheat:        { emoji: "🌿", season: "Rabi",    water: "Medium", ph: "6.0–7.5", days: "100–150", tip: "Sow in cool weather. Avoid waterlogging. Top-dress with nitrogen at tillering stage." },
  maize:        { emoji: "🌽", season: "Kharif",  water: "Medium", ph: "5.8–7.0", days: "80–110",  tip: "Needs well-drained soil. Apply zinc sulfate if deficiency is observed." },
  chickpea:     { emoji: "🫘", season: "Rabi",    water: "Low",    ph: "6.0–8.0", days: "90–120",  tip: "Drought-tolerant. Avoid excess nitrogen — it fixes its own. Good for dry regions." },
  "kidney beans":{ emoji: "🫘", season: "Kharif", water: "Medium", ph: "6.0–7.5", days: "80–100",  tip: "Sensitive to frost. Needs well-drained loamy soil. Avoid over-irrigation." },
  "pigeon peas":{ emoji: "🌱", season: "Kharif",  water: "Low",    ph: "5.0–7.5", days: "120–180", tip: "Drought-resistant. Deep taproot. Excellent for intercropping with cereals." },
  "moth beans": { emoji: "🫘", season: "Kharif",  water: "Low",    ph: "7.0–8.5", days: "60–90",   tip: "Extremely drought-tolerant. Ideal for arid and semi-arid regions." },
  "mung bean":  { emoji: "🫘", season: "Kharif",  water: "Low",    ph: "6.2–7.2", days: "60–90",   tip: "Short duration crop. Good for soil health. Harvest when pods turn black." },
  "black gram": { emoji: "🫘", season: "Kharif",  water: "Low",    ph: "6.0–7.5", days: "70–90",   tip: "Tolerates light shade. Avoid waterlogging. Rich in protein — high market value." },
  lentil:       { emoji: "🫘", season: "Rabi",    water: "Low",    ph: "6.0–8.0", days: "80–110",  tip: "Cool-season crop. Sensitive to salinity. Inoculate seeds with Rhizobium." },
  pomegranate:  { emoji: "🍎", season: "Perennial",water: "Low",   ph: "5.5–7.5", days: "150–180", tip: "Drought-tolerant once established. Prune after harvest for better fruiting." },
  banana:       { emoji: "🍌", season: "Perennial",water: "High",  ph: "5.5–7.0", days: "270–365", tip: "Needs warm humid climate. Mulch heavily. Remove suckers to maintain one per plant." },
  mango:        { emoji: "🥭", season: "Perennial",water: "Low",   ph: "5.5–7.5", days: "90–120",  tip: "Needs dry spell before flowering. Avoid nitrogen excess — it delays fruiting." },
  watermelon:   { emoji: "🍉", season: "Zaid",    water: "Medium", ph: "6.0–7.0", days: "70–90",   tip: "Needs warm soil. Space plants 2m apart. Reduce watering as fruits mature for sweetness." },
  muskmelon:    { emoji: "🍈", season: "Zaid",    water: "Medium", ph: "6.0–7.0", days: "70–90",   tip: "Similar to watermelon. Stop irrigation 10 days before harvest for better flavor." },
  apple:        { emoji: "🍎", season: "Rabi",    water: "Medium", ph: "5.5–6.5", days: "150–180", tip: "Needs chilling hours in winter. Thin fruits early for larger size. Spray for scab." },
  orange:       { emoji: "🍊", season: "Perennial",water: "Medium",ph: "6.0–7.5", days: "180–240", tip: "Needs well-drained soil. Avoid overwatering. Foliar spray micronutrients annually." },
  papaya:       { emoji: "🍈", season: "Perennial",water: "Medium",ph: "6.0–7.0", days: "180–270", tip: "Fast-growing. Sensitive to waterlogging. Plant on raised beds in heavy soils." },
  coconut:      { emoji: "🥥", season: "Perennial",water: "High",  ph: "5.5–8.0", days: "365+",    tip: "Needs coastal humid climate. Apply potassium-rich fertilizer for better nut yield." },
  cotton:       { emoji: "🌿", season: "Kharif",  water: "Medium", ph: "5.8–8.0", days: "150–180", tip: "Needs long frost-free season. Monitor for bollworm. Avoid excess nitrogen early." },
  jute:         { emoji: "🌿", season: "Kharif",  water: "High",   ph: "6.0–7.5", days: "100–120", tip: "Needs warm humid climate and alluvial soil. Harvest before flowering for best fiber." },
  coffee:       { emoji: "☕", season: "Perennial",water: "Medium", ph: "6.0–6.5", days: "365+",    tip: "Needs shade and cool temperatures. Mulch heavily. Prune after harvest." },
};

export function getCropInfo(cropName) {
  if (!cropName) return null;
  return CROP_INFO[cropName.toLowerCase().trim()] || null;
}
