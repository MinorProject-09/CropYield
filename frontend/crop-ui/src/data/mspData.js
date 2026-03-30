/**
 * Minimum Support Price (MSP) data — Government of India 2024-25
 * Source: Cabinet Committee on Economic Affairs (CCEA), GOI
 * Unit: ₹ per quintal (100 kg)
 */
export const MSP_2024 = {
  rice:         { msp: 2300,  season: "Kharif",   change: "+117" },
  maize:        { msp: 2090,  season: "Kharif",   change: "+128" },
  cotton:       { msp: 7121,  season: "Kharif",   change: "+501" },
  jute:         { msp: 5335,  season: "Kharif",   change: "+285" },
  blackgram:    { msp: 7400,  season: "Kharif",   change: "+450" },
  mungbean:     { msp: 8682,  season: "Kharif",   change: "+124" },
  pigeonpeas:   { msp: 7550,  season: "Kharif",   change: "+550" },
  mothbeans:    { msp: 8558,  season: "Kharif",   change: "+983" },
  chickpea:     { msp: 5440,  season: "Rabi",     change: "+210" },
  lentil:       { msp: 6425,  season: "Rabi",     change: "+425" },
  kidneybeans:  { msp: 6700,  season: "Rabi",     change: "+300" },
  banana:       { msp: 1500,  season: "Perennial",change: "+50"  },
  mango:        { msp: 4000,  season: "Perennial",change: "+200" },
  coconut:      { msp: 3300,  season: "Perennial",change: "+150" },
  coffee:       { msp: 12000, season: "Perennial",change: "+500" },
  grapes:       { msp: 6000,  season: "Perennial",change: "+300" },
  pomegranate:  { msp: 5000,  season: "Perennial",change: "+250" },
  apple:        { msp: 8000,  season: "Rabi",     change: "+400" },
  orange:       { msp: 3200,  season: "Perennial",change: "+160" },
  papaya:       { msp: 1200,  season: "Perennial",change: "+60"  },
  watermelon:   { msp: 800,   season: "Zaid",     change: "+40"  },
  muskmelon:    { msp: 900,   season: "Zaid",     change: "+45"  },
};

export function getMSP(cropName) {
  if (!cropName) return null;
  return MSP_2024[cropName.toLowerCase().trim()] || null;
}
