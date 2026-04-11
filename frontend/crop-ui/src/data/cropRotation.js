/**
 * cropRotation.js
 * Crop rotation suggestions based on soil science and Indian farming practices.
 * Sources: ICAR guidelines, TNAU crop rotation recommendations.
 */

export const ROTATION_MAP = {
  // Kharif cereals → Rabi pulses/oilseeds (classic rotation)
  rice:          { next: ["wheat", "chickpea", "lentil", "mustard"], reason: "Rice depletes N and P. Wheat or pulses restore balance. Pulses fix nitrogen naturally." },
  maize:         { next: ["chickpea", "wheat", "mustard", "lentil"], reason: "Maize is a heavy feeder. Follow with nitrogen-fixing legumes or Rabi cereals." },
  jute:          { next: ["rice", "wheat", "mustard"],               reason: "Jute improves soil structure. Follow with cereals that benefit from improved tilth." },
  cotton:        { next: ["wheat", "chickpea", "groundnut", "soybean"], reason: "Cotton exhausts K. Legumes restore N and improve soil organic matter." },

  // Rabi cereals → Kharif pulses/oilseeds
  wheat:         { next: ["rice", "maize", "mung bean", "black gram", "soybean"], reason: "Wheat depletes N. Short-duration Kharif pulses restore nitrogen before next Rabi." },

  // Legumes → Cereals (classic nitrogen benefit)
  chickpea:      { next: ["wheat", "maize", "rice", "cotton"],       reason: "Chickpea fixes 40–80 kg N/ha. Follow with a heavy nitrogen-demanding cereal." },
  lentil:        { next: ["wheat", "maize", "rice"],                  reason: "Lentil fixes nitrogen. Cereals benefit from the residual N in the soil." },
  "kidney beans":{ next: ["maize", "wheat", "rice"],                  reason: "Kidney beans fix N. Cereals following legumes show 15–20% yield improvement." },
  "pigeon peas": { next: ["wheat", "maize", "cotton", "sorghum"],     reason: "Pigeon peas fix N and have deep roots that break hardpan. Ideal before cereals." },
  "moth beans":  { next: ["wheat", "maize", "mustard"],               reason: "Moth beans improve arid soil structure. Follow with Rabi crops." },
  "mung bean":   { next: ["wheat", "maize", "rice", "cotton"],        reason: "Short-duration mung bean fixes N and fits as a catch crop between main seasons." },
  "black gram":  { next: ["wheat", "maize", "rice"],                  reason: "Black gram fixes N. Excellent pre-wheat crop in Indo-Gangetic plains." },

  // Fruits/perennials — intercropping suggestions
  banana:        { next: ["legumes as intercrop", "ginger", "turmeric"], reason: "Banana benefits from legume intercrops that fix N and suppress weeds." },
  mango:         { next: ["legumes as intercrop", "vegetables"],      reason: "Young mango orchards benefit from legume intercrops in the inter-row space." },
  coconut:       { next: ["banana as intercrop", "pineapple", "cocoa"], reason: "Coconut canopy allows shade-tolerant intercrops that generate additional income." },
  grapes:        { next: ["cover crops (legumes)", "vegetables"],     reason: "Legume cover crops between vine rows fix N and improve soil organic matter." },
  pomegranate:   { next: ["legumes as intercrop", "vegetables"],      reason: "Intercrop with short-duration legumes during establishment phase." },
  apple:         { next: ["cover crops", "legumes"],                  reason: "Grass-legume cover crops in apple orchards reduce erosion and fix N." },
  orange:        { next: ["legumes as intercrop"],                    reason: "Legume intercrops in young orange orchards improve soil fertility." },
  papaya:        { next: ["legumes", "vegetables"],                   reason: "Short-duration crops between papaya rows maximise land use." },
  watermelon:    { next: ["wheat", "chickpea", "mustard"],            reason: "Watermelon is a heavy feeder. Follow with Rabi legumes to restore soil." },
  muskmelon:     { next: ["wheat", "chickpea", "mustard"],            reason: "Similar to watermelon — follow with nitrogen-fixing Rabi crops." },
  coffee:        { next: ["shade trees", "pepper as intercrop"],      reason: "Coffee benefits from shade trees and pepper intercrops for additional income." },
};

/**
 * Get rotation suggestion for a crop.
 * @param {string} crop - lowercase crop name
 * @returns {{ next: string[], reason: string } | null}
 */
export function getCropRotation(crop) {
  return ROTATION_MAP[crop?.toLowerCase()] || null;
}
