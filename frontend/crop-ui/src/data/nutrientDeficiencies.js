/**
 * Nutrient Deficiency Data for various crops
 * Structure: crop -> deficiencies with symptoms, causes, and plant locations
 * Images are now loaded from local assets directory
 */

export const NUTRIENT_DEFICIENCIES = {
  potato: [
    {
      id: 1,
      nutrient: "Copper",
      image: "/assets/nutrient-deficiencies/potato/coppor_deficiency.jpg",
      symptoms: ["Wilting", "Discolouration"],
      cause: "Copper",
      locations: ["Leaves, young", "Stem/Trunk"],
      description: "Bluish-green discoloration, wilting of new growth"
    },
    {
      id: 2,
      nutrient: "Iron",
      image: "/assets/nutrient-deficiencies/potato/iron_deficiency.jpg",
      symptoms: ["Chlorosis", "White"],
      cause: "Iron",
      locations: ["Leaves, young", "Complete plant"],
      description: "Interveinal chlorosis on young leaves"
    },
    {
      id: 3,
      nutrient: "Magnesium",
      image: "/assets/nutrient-deficiencies/potato/magnessium_deficiency.jpg",
      symptoms: ["Chlorosis", "Paling"],
      cause: "Magnesium",
      locations: ["Leaves, mature"],
      description: "Interveinal chlorosis on mature leaves"
    },
    {
      id: 4,
      nutrient: "Nitrogen",
      image: "/assets/nutrient-deficiencies/potato/nitrogen_deficiency.jpg",
      symptoms: ["Paling", "Chlorosis", "Growth retardation"],
      cause: "Nitrogen",
      locations: ["Leaves, mature", "Complete plant"],
      description: "Yellowing of mature leaves with normal green color in young leaves"
    },
    {
      id: 5,
      nutrient: "Phosphorus",
      image: "/assets/nutrient-deficiencies/potato/phosphorus_deficiency.jpg",
      symptoms: ["Dark Green Color", "Growth retardation"],
      cause: "Phosphorus",
      locations: ["Leaves, mature", "Stem/Trunk"],
      description: "Dark purple or red discoloration, stunted growth"
    },
    {
      id: 6,
      nutrient: "Phosphorus",
      image: "/assets/nutrient-deficiencies/potato/phosphorus_deficiency1.jpg",
      symptoms: ["Dark Green Color", "Growth retardation"],
      cause: "Phosphorus",
      locations: ["Leaves, mature", "Stem/Trunk"],
      description: "Dark purple or red discoloration, stunted growth"
    },
    {
      id: 7,
      nutrient: "Potassium",
      image: "/assets/nutrient-deficiencies/potato/potassium_deficiency.jpg",
      symptoms: ["Browning", "Necrosis", "Cracking"],
      cause: "Potassium",
      locations: ["Leaves, mature", "Complete plant"],
      description: "Burnt-like edges on leaves, internal browning of tubers"
    },
    {
      id: 8,
      nutrient: "Zinc",
      image: "/assets/nutrient-deficiencies/potato/zinc_deficiency.jpg",
      symptoms: ["Shortening of internodes", "Deformation"],
      cause: "Zinc",
      locations: ["Leaves, young", "Complete plant"],
      description: "Rosette appearance, shortened internodes"
    },
    {
      id: 9,
      nutrient: "Zinc",
      image: "/assets/nutrient-deficiencies/potato/zinc_deficiency1.jpg",
      symptoms: ["Shortening of internodes", "Deformation"],
      cause: "Zinc",
      locations: ["Leaves, young", "Complete plant"],
      description: "Rosette appearance, shortened internodes"
    }
  ],
  tomato: [
    {
      id: 10,
      nutrient: "Boron",
      image: "/assets/nutrient-deficiencies/tomato/boron_deficiency.jpg",
      symptoms: ["Necrosis", "Deformation", "Cracking"],
      cause: "Boron",
      locations: ["Fruits", "Young leaves"],
      description: "Internal browning of fruits, hollow stem, misshapen leaves"
    },
    {
      id: 11,
      nutrient: "Calcium",
      image: "/assets/nutrient-deficiencies/tomato/calcium_deficiency.jpg",
      symptoms: ["Necrosis", "Size reduced"],
      cause: "Calcium",
      locations: ["Fruits", "Young leaves"],
      description: "Blossom end rot on fruits, tip burn on young leaves"
    },
    {
      id: 12,
      nutrient: "Copper",
      image: "/assets/nutrient-deficiencies/tomato/coppor_deficiency.jpg",
      symptoms: ["Wilting", "Discolouration"],
      cause: "Copper",
      locations: ["Leaves, young", "Stem/Trunk"],
      description: "Bluish-green discoloration, wilting of new growth"
    },
    {
      id: 13,
      nutrient: "Iron",
      image: "/assets/nutrient-deficiencies/tomato/iron_deficiency.jpg",
      symptoms: ["Chlorosis", "White"],
      cause: "Iron",
      locations: ["Leaves, young"],
      description: "Severe chlorosis on young leaves in lime soils"
    },
    {
      id: 14,
      nutrient: "Magnesium",
      image: "/assets/nutrient-deficiencies/tomato/magnesium_deficiency.jpg",
      symptoms: ["Chlorosis", "Paling"],
      cause: "Magnesium",
      locations: ["Leaves, mature"],
      description: "Interveinal chlorosis on lower leaves"
    },
    {
      id: 15,
      nutrient: "Nitrogen",
      image: "/assets/nutrient-deficiencies/tomato/nitrogen_deficiency.jpg",
      symptoms: ["Paling", "Growth retardation"],
      cause: "Nitrogen",
      locations: ["Leaves, mature", "Complete plant"],
      description: "Pale green older leaves, stunted growth"
    },
    {
      id: 16,
      nutrient: "Phosphorus",
      image: "/assets/nutrient-deficiencies/tomato/phosphorus_deficiency.jpg",
      symptoms: ["Dark Green Color", "Discolouration"],
      cause: "Phosphorus",
      locations: ["Stem/Trunk", "Leaves, mature"],
      description: "Purple-red discoloration of stems and leaves"
    },
    {
      id: 17,
      nutrient: "Potassium",
      image: "/assets/nutrient-deficiencies/tomato/potassium_deficiency.jpg",
      symptoms: ["Browning", "Necrosis"],
      cause: "Potassium",
      locations: ["Leaves, mature", "Fruits"],
      description: "Marginal scorch on mature leaves, poor fruit setting"
    },
    {
      id: 18,
      nutrient: "Sulphur",
      image: "/assets/nutrient-deficiencies/tomato/sulphur_deficiency.jpg",
      symptoms: ["Paling", "Chlorosis"],
      cause: "Sulphur",
      locations: ["Leaves, young"],
      description: "Pale yellow young leaves"
    },
    {
      id: 19,
      nutrient: "Zinc",
      image: "/assets/nutrient-deficiencies/tomato/zinc_deficiency.jpg",
      symptoms: ["Shortening of internodes", "Chlorosis"],
      cause: "Zinc",
      locations: ["Leaves, young", "Complete plant"],
      description: "Small, chlorotic upper leaves, shortened internodes"
    }
  ],
  wheat: [
    {
      id: 20,
      nutrient: "Boron",
      image: "/assets/nutrient-deficiencies/wheat/boron_deficiency.jpg",
      symptoms: ["Necrosis", "Deformation"],
      cause: "Boron",
      locations: ["Young leaves", "Complete plant"],
      description: "Internal browning, cracks, malformed leaves"
    },
    {
      id: 21,
      nutrient: "Iron",
      image: "/assets/nutrient-deficiencies/wheat/iron_deficiency.jpg",
      symptoms: ["Chlorosis", "White"],
      cause: "Iron",
      locations: ["Leaves, young"],
      description: "Interveinal chlorosis on young leaves"
    },
    {
      id: 22,
      nutrient: "Magnesium",
      image: "/assets/nutrient-deficiencies/wheat/magnessium_deficiency.jpg",
      symptoms: ["Chlorosis", "Paling"],
      cause: "Magnesium",
      locations: ["Leaves, mature"],
      description: "Interveinal chlorosis on mature leaves"
    },
    {
      id: 23,
      nutrient: "Nitrogen",
      image: "/assets/nutrient-deficiencies/wheat/nitrogen_deficiency.jpg",
      symptoms: ["Paling", "Growth retardation"],
      cause: "Nitrogen",
      locations: ["Complete plant", "Leaves, mature"],
      description: "Pale green color throughout the plant"
    },
    {
      id: 24,
      nutrient: "Sulphur",
      image: "/assets/nutrient-deficiencies/wheat/sulphur_deficiency.jpg",
      symptoms: ["Paling", "Chlorosis"],
      cause: "Sulphur",
      locations: ["Leaves, young"],
      description: "Pale yellow young leaves"
    },
    {
      id: 25,
      nutrient: "Zinc",
      image: "/assets/nutrient-deficiencies/wheat/zinc_deficiency.jpg",
      symptoms: ["Chlorosis", "Shortening of internodes"],
      cause: "Zinc",
      locations: ["Leaves, young", "Ear"],
      description: "Small brown spots between veins, shortened internodes"
    },
    {
      id: 26,
      nutrient: "Zinc",
      image: "/assets/nutrient-deficiencies/wheat/zinc_deficiency1.jpg",
      symptoms: ["Chlorosis", "Shortening of internodes"],
      cause: "Zinc",
      locations: ["Leaves, young", "Ear"],
      description: "Small brown spots between veins, shortened internodes"
    }
  ],
  onion: [
    {
      id: 27,
      nutrient: "Boron",
      image: "/assets/nutrient-deficiencies/onion/boron_deficiency.jpg",
      symptoms: ["Necrosis", "Deformation"],
      cause: "Boron",
      locations: ["Young leaves", "Complete plant"],
      description: "Internal browning, cracks, malformed leaves"
    },
    {
      id: 28,
      nutrient: "Boron",
      image: "/assets/nutrient-deficiencies/onion/boron_deficiency1.jpg",
      symptoms: ["Necrosis", "Deformation"],
      cause: "Boron",
      locations: ["Young leaves", "Complete plant"],
      description: "Internal browning, cracks, malformed leaves"
    },
    {
      id: 29,
      nutrient: "Calcium",
      image: "/assets/nutrient-deficiencies/onion/calcium_deficiency.jpg",
      symptoms: ["Necrosis", "Deformation"],
      cause: "Calcium",
      locations: ["Young leaves", "Complete plant"],
      description: "Tip burn on young leaves, deformed leaves"
    },
    {
      id: 30,
      nutrient: "Magnesium",
      image: "/assets/nutrient-deficiencies/onion/magnesium_deficiency.jpg",
      symptoms: ["Chlorosis", "Paling"],
      cause: "Magnesium",
      locations: ["Leaves, mature"],
      description: "Interveinal chlorosis on mature leaves"
    },
    {
      id: 31,
      nutrient: "Nitrogen",
      image: "/assets/nutrient-deficiencies/onion/nitrogen_deficiency.jpg",
      symptoms: ["Paling", "Growth retardation"],
      cause: "Nitrogen",
      locations: ["Complete plant", "Leaves, mature"],
      description: "Pale green foliage, weak plant growth"
    },
    {
      id: 32,
      nutrient: "Phosphorus",
      image: "/assets/nutrient-deficiencies/onion/phosphorus_deficiency.jpg",
      symptoms: ["Discolouration", "Growth retardation"],
      cause: "Phosphorus",
      locations: ["Complete plant"],
      description: "Purple discoloration, slow bulb development"
    },
    {
      id: 33,
      nutrient: "Potassium",
      image: "/assets/nutrient-deficiencies/onion/potasium_deficiency.jpg",
      symptoms: ["Browning", "Size reduced"],
      cause: "Potassium",
      locations: ["Leaves, mature", "Complete plant"],
      description: "Brown leaf tips, smaller bulb size"
    },
    {
      id: 34,
      nutrient: "Zinc",
      image: "/assets/nutrient-deficiencies/onion/zinc_deficiency.jpg",
      symptoms: ["Chlorosis", "Shortening of internodes"],
      cause: "Zinc",
      locations: ["Leaves, young", "Complete plant"],
      description: "Small, chlorotic leaves, shortened internodes"
    }
  ],
  rice: [
    {
      id: 35,
      nutrient: "Boron",
      image: "/assets/nutrient-deficiencies/rice/boron_deficiency.jpg",
      symptoms: ["Necrosis", "Deformation"],
      cause: "Boron",
      locations: ["Young leaves", "Complete plant"],
      description: "Internal browning, cracks, malformed leaves"
    },
    {
      id: 36,
      nutrient: "Magnesium",
      image: "/assets/nutrient-deficiencies/rice/magnesium_deficiency.jpg",
      symptoms: ["Chlorosis", "Paling"],
      cause: "Magnesium",
      locations: ["Leaves, mature"],
      description: "Interveinal chlorosis on mature leaves"
    },
    {
      id: 37,
      nutrient: "Nitrogen",
      image: "/assets/nutrient-deficiencies/rice/nitrogen_deficiency.jpg",
      symptoms: ["Paling", "Growth retardation"],
      cause: "Nitrogen",
      locations: ["Complete plant", "Leaves, mature"],
      description: "Overall pale green color, reduced tillering"
    },
    {
      id: 38,
      nutrient: "Potassium",
      image: "/assets/nutrient-deficiencies/rice/potassium_deficiency.jpg",
      symptoms: ["Browning", "Wilting"],
      cause: "Potassium",
      locations: ["Leaves, mature", "Complete plant"],
      description: "Brown spots on leaves, weak stems"
    },
    {
      id: 39,
      nutrient: "Zinc",
      image: "/assets/nutrient-deficiencies/rice/zinc_deficiency.jpg",
      symptoms: ["Spots", "Browning"],
      cause: "Zinc",
      locations: ["Leaves, young", "Complete plant"],
      description: "Brown or gray spots, bronzing of leaves"
    },
    {
      id: 40,
      nutrient: "Zinc",
      image: "/assets/nutrient-deficiencies/rice/zinc_deficiency1.jpg",
      symptoms: ["Spots", "Browning"],
      cause: "Zinc",
      locations: ["Leaves, young", "Complete plant"],
      description: "Brown or gray spots, bronzing of leaves"
    }
  ],
  banana: [
    {
      id: 41,
      nutrient: "Boron",
      image: "/assets/nutrient-deficiencies/banana/boron%20deficiency%20banana%20crop.jpg",
      symptoms: ["Necrosis", "Deformation"],
      cause: "Boron",
      locations: ["Young leaves", "Complete plant"],
      description: "Internal browning, cracks, malformed leaves"
    },
    {
      id: 42,
      nutrient: "Boron",
      image: "/assets/nutrient-deficiencies/banana/boron%20deficiency%20in%20banana%20crop.jpg",
      symptoms: ["Necrosis", "Deformation"],
      cause: "Boron",
      locations: ["Young leaves", "Complete plant"],
      description: "Internal browning, cracks, malformed leaves"
    },
    {
      id: 43,
      nutrient: "Calcium",
      image: "/assets/nutrient-deficiencies/banana/calcium%20deficiency%20banana%20crop.jpg",
      symptoms: ["Necrosis", "Deformation"],
      cause: "Calcium",
      locations: ["Young leaves", "Complete plant"],
      description: "Tip burn on young leaves, deformed leaves"
    },
    {
      id: 44,
      nutrient: "Copper",
      image: "/assets/nutrient-deficiencies/banana/coppor%20deficiency%20in%20banana%20crop.jpg",
      symptoms: ["Wilting", "Discolouration"],
      cause: "Copper",
      locations: ["Leaves, young", "Stem/Trunk"],
      description: "Bluish-green discoloration, wilting of new growth"
    },
    {
      id: 45,
      nutrient: "Iron",
      image: "/assets/nutrient-deficiencies/banana/iron%20deficiency%20in%20banana%20crop.jpg",
      symptoms: ["Chlorosis", "White"],
      cause: "Iron",
      locations: ["Leaves, young"],
      description: "Yellow interveinal areas on young leaves"
    },
    {
      id: 46,
      nutrient: "Magnesium",
      image: "/assets/nutrient-deficiencies/banana/magnesium%20deficiency%20banana%20crop.jpg",
      symptoms: ["Chlorosis", "Paling"],
      cause: "Magnesium",
      locations: ["Leaves, mature"],
      description: "Interveinal chlorosis on older leaves"
    },
    {
      id: 47,
      nutrient: "Nitrogen",
      image: "/assets/nutrient-deficiencies/banana/nitrogen%20deficiency%20banana%20crop.jpg",
      symptoms: ["Paling", "Growth retardation"],
      cause: "Nitrogen",
      locations: ["Complete plant", "Leaves, mature"],
      description: "Yellowing of older leaves, stunted growth"
    },
    {
      id: 48,
      nutrient: "Phosphorus",
      image: "/assets/nutrient-deficiencies/banana/phosphorus%20deficiency%20banana%20crop.jpg",
      symptoms: ["Dark Green Color", "Growth retardation"],
      cause: "Phosphorus",
      locations: ["Complete plant"],
      description: "Dark green color, stunted growth"
    },
    {
      id: 49,
      nutrient: "Potassium",
      image: "/assets/nutrient-deficiencies/banana/potasium%20deficiency%20banana%20crop.jpg",
      symptoms: ["Browning", "Necrosis"],
      cause: "Potassium",
      locations: ["Leaves, mature", "Leaves, complete plant"],
      description: "Marginal scorch on older leaves, poor fruit quality"
    },
    {
      id: 50,
      nutrient: "Sulphur",
      image: "/assets/nutrient-deficiencies/banana/sulphur%20deficiency%20banana%20crop.jpg",
      symptoms: ["Paling", "Chlorosis"],
      cause: "Sulphur",
      locations: ["Leaves, young"],
      description: "Pale yellow young leaves"
    },
    {
      id: 51,
      nutrient: "Zinc",
      image: "/assets/nutrient-deficiencies/banana/zinc%20deficiency%20in%20banana%20crop.jpg",
      symptoms: ["Chlorosis", "Shortening of internodes"],
      cause: "Zinc",
      locations: ["Leaves, young", "Complete plant"],
      description: "Small, chlorotic leaves, shortened internodes"
    }
  ],
  sugarcane: [
    {
      id: 52,
      nutrient: "Boron",
      image: "/assets/nutrient-deficiencies/sugarcane/boron deficiency in sugarcane.jpg",
      symptoms: ["Necrosis", "Deformation"],
      cause: "Boron",
      locations: ["Young leaves", "Complete plant"],
      description: "Internal browning, cracks, malformed leaves"
    },
    {
      id: 53,
      nutrient: "Calcium",
      image: "/assets/nutrient-deficiencies/sugarcane/calcium deficiency in sugarcane.jpg",
      symptoms: ["Necrosis", "Deformation"],
      cause: "Calcium",
      locations: ["Young leaves", "Complete plant"],
      description: "Tip burn on young leaves, deformed leaves"
    },
    {
      id: 54,
      nutrient: "Copper",
      image: "/assets/nutrient-deficiencies/sugarcane/coppor deficiency in sugarcane.jpg",
      symptoms: ["Wilting", "Discolouration"],
      cause: "Copper",
      locations: ["Leaves, young", "Stem/Trunk"],
      description: "Bluish-green discoloration, wilting of new growth"
    },
    {
      id: 55,
      nutrient: "Iron",
      image: "/assets/nutrient-deficiencies/sugarcane/iron deficiency.jpg",
      symptoms: ["Chlorosis", "White"],
      cause: "Iron",
      locations: ["Leaves, young"],
      description: "Interveinal chlorosis on young leaves"
    },
    {
      id: 56,
      nutrient: "Manganese",
      image: "/assets/nutrient-deficiencies/sugarcane/magnese deficiency in sugarcane.jpg",
      symptoms: ["Spots", "Chlorosis"],
      cause: "Manganese",
      locations: ["Leaves, young"],
      description: "Gray spots with halo on young leaves"
    },
    {
      id: 57,
      nutrient: "Nitrogen",
      image: "/assets/nutrient-deficiencies/sugarcane/nitrogen deficiency in sugarcane.jpg",
      symptoms: ["Paling", "Growth retardation"],
      cause: "Nitrogen",
      locations: ["Complete plant", "Leaves, mature"],
      description: "Pale green foliage, thin stalks, poor growth"
    },
    {
      id: 58,
      nutrient: "Phosphorus",
      image: "/assets/nutrient-deficiencies/sugarcane/phosphorus deficiency in sugarcane.jpg",
      symptoms: ["Discolouration", "Growth retardation"],
      cause: "Phosphorus",
      locations: ["Complete plant"],
      description: "Purple-red discoloration, stunted growth"
    },
    {
      id: 59,
      nutrient: "Phosphorus",
      image: "/assets/nutrient-deficiencies/sugarcane/Phosphorus_deficiency.jpg",
      symptoms: ["Discolouration", "Growth retardation"],
      cause: "Phosphorus",
      locations: ["Complete plant"],
      description: "Purple-red discoloration, stunted growth"
    },
    {
      id: 60,
      nutrient: "Potassium",
      image: "/assets/nutrient-deficiencies/sugarcane/potassium deficiency.jpg",
      symptoms: ["Browning", "Wilting"],
      cause: "Potassium",
      locations: ["Leaves, mature", "Stalks"],
      description: "Brown spots on leaves, weak brittle stalks"
    },
    {
      id: 61,
      nutrient: "Potassium",
      image: "/assets/nutrient-deficiencies/sugarcane/potassium_deficiency in sugarcane.jpg",
      symptoms: ["Browning", "Wilting"],
      cause: "Potassium",
      locations: ["Leaves, mature", "Stalks"],
      description: "Brown spots on leaves, weak brittle stalks"
    },
    {
      id: 62,
      nutrient: "Sulphur",
      image: "/assets/nutrient-deficiencies/sugarcane/sulphur deficiency in sugarcane.jpg",
      symptoms: ["Paling", "Chlorosis"],
      cause: "Sulphur",
      locations: ["Leaves, young"],
      description: "Pale yellow young leaves"
    },
    {
      id: 63,
      nutrient: "Zinc",
      image: "/assets/nutrient-deficiencies/sugarcane/zinc deficiency in sugarcane.jpg",
      symptoms: ["Chlorosis", "Shortening of internodes"],
      cause: "Zinc",
      locations: ["Leaves, young", "Complete plant"],
      description: "Small, chlorotic leaves, shortened internodes"
    }
  ],
  citrus: [
    {
      id: 64,
      nutrient: "Boron",
      image: "/assets/nutrient-deficiencies/citrus/boron deficiency in citrus.jpg",
      symptoms: ["Necrosis", "Deformation"],
      cause: "Boron",
      locations: ["Young leaves", "Complete plant"],
      description: "Internal browning, cracks, malformed leaves"
    },
    {
      id: 65,
      nutrient: "Calcium",
      image: "/assets/nutrient-deficiencies/citrus/calcium deficiency in citrus.jpg",
      symptoms: ["Necrosis", "Size reduced"],
      cause: "Calcium",
      locations: ["Fruits", "Young leaves"],
      description: "Blossom end rot on fruits, tip burn on young leaves"
    },
    {
      id: 66,
      nutrient: "Calcium",
      image: "/assets/nutrient-deficiencies/citrus/calcium_deficiency in citrus.jpg",
      symptoms: ["Necrosis", "Size reduced"],
      cause: "Calcium",
      locations: ["Fruits", "Young leaves"],
      description: "Blossom end rot on fruits, tip burn on young leaves"
    },
    {
      id: 67,
      nutrient: "Copper",
      image: "/assets/nutrient-deficiencies/citrus/coppor deficiency in citrus.jpg",
      symptoms: ["Wilting", "Discolouration"],
      cause: "Copper",
      locations: ["Leaves, young", "Stem/Trunk"],
      description: "Bluish-green discoloration, wilting of new growth"
    },
    {
      id: 68,
      nutrient: "Copper",
      image: "/assets/nutrient-deficiencies/citrus/coppor deficiency.jpg",
      symptoms: ["Wilting", "Discolouration"],
      cause: "Copper",
      locations: ["Leaves, young", "Stem/Trunk"],
      description: "Bluish-green discoloration, wilting of new growth"
    },
    {
      id: 69,
      nutrient: "Iron",
      image: "/assets/nutrient-deficiencies/citrus/iron deficiency.jpg",
      symptoms: ["Chlorosis", "White"],
      cause: "Iron",
      locations: ["Leaves, young"],
      description: "Interveinal chlorosis on new growth"
    },
    {
      id: 70,
      nutrient: "Iron",
      image: "/assets/nutrient-deficiencies/citrus/iron_and_zinc_deficiency in citrus.jpg",
      symptoms: ["Chlorosis", "White"],
      cause: "Iron",
      locations: ["Leaves, young"],
      description: "Interveinal chlorosis on new growth"
    },
    {
      id: 71,
      nutrient: "Magnesium",
      image: "/assets/nutrient-deficiencies/citrus/magnesium deficiency in citrus.jpg",
      symptoms: ["Chlorosis", "Paling"],
      cause: "Magnesium",
      locations: ["Leaves, mature"],
      description: "Defined areas of green between yellowing"
    },
    {
      id: 72,
      nutrient: "Nitrogen",
      image: "/assets/nutrient-deficiencies/citrus/nitrogen deficiency.jpg",
      symptoms: ["Paling", "Growth retardation"],
      cause: "Nitrogen",
      locations: ["Complete plant", "Leaves, mature"],
      description: "Light green to yellow mature leaves"
    },
    {
      id: 73,
      nutrient: "Phosphorus",
      image: "/assets/nutrient-deficiencies/citrus/phosphorus deficiency in citrus.jpg",
      symptoms: ["Dark Green Color", "Growth retardation"],
      cause: "Phosphorus",
      locations: ["Complete plant"],
      description: "Dark green, slow flowering"
    },
    {
      id: 74,
      nutrient: "Potassium",
      image: "/assets/nutrient-deficiencies/citrus/Potassium deficiency citrus crop.jpg",
      symptoms: ["Browning", "Necrosis"],
      cause: "Potassium",
      locations: ["Leaves, mature"],
      description: "Brown necrotic spots on mature leaves"
    },
    {
      id: 75,
      nutrient: "Potassium",
      image: "/assets/nutrient-deficiencies/citrus/potassium deficiency in citrus.jpg",
      symptoms: ["Browning", "Necrosis"],
      cause: "Potassium",
      locations: ["Leaves, mature"],
      description: "Brown necrotic spots on mature leaves"
    },
    {
      id: 76,
      nutrient: "Sulphur",
      image: "/assets/nutrient-deficiencies/citrus/sulphur deficiency in citrus.jpg",
      symptoms: ["Paling", "Chlorosis"],
      cause: "Sulphur",
      locations: ["Leaves, young"],
      description: "Pale yellow young leaves"
    },
    {
      id: 77,
      nutrient: "Zinc",
      image: "/assets/nutrient-deficiencies/citrus/iron_and_zinc_deficiency in citrus.jpg",
      symptoms: ["Chlorosis", "Shortening of internodes"],
      cause: "Zinc",
      locations: ["Leaves, young", "Leaves, complete plant"],
      description: "Small mottled leaves, severe stunting"
    }
  ],
  coffee: [
    {
      id: 78,
      nutrient: "Boron",
      image: "/assets/nutrient-deficiencies/coffee/boron_deficiency.jpg",
      symptoms: ["Necrosis", "Deformation"],
      cause: "Boron",
      locations: ["Young leaves", "Complete plant"],
      description: "Internal browning, cracks, malformed leaves"
    },
    {
      id: 79,
      nutrient: "Boron",
      image: "/assets/nutrient-deficiencies/coffee/boron_deficiency1.jpg",
      symptoms: ["Necrosis", "Deformation"],
      cause: "Boron",
      locations: ["Young leaves", "Complete plant"],
      description: "Internal browning, cracks, malformed leaves"
    },
    {
      id: 80,
      nutrient: "Iron",
      image: "/assets/nutrient-deficiencies/coffee/iron_deficiency.jpg",
      symptoms: ["Chlorosis", "White"],
      cause: "Iron",
      locations: ["Leaves, young"],
      description: "Interveinal chlorosis on young shoots"
    },
    {
      id: 81,
      nutrient: "Magnesium",
      image: "/assets/nutrient-deficiencies/coffee/magnesium_deficiency.jpg",
      symptoms: ["Chlorosis", "Paling"],
      cause: "Magnesium",
      locations: ["Leaves, mature"],
      description: "Interveinal chlorosis on mature leaves"
    },
    {
      id: 82,
      nutrient: "Nitrogen",
      image: "/assets/nutrient-deficiencies/coffee/nitrogen_deficiency.jpg",
      symptoms: ["Paling", "Growth retardation"],
      cause: "Nitrogen",
      locations: ["Complete plant", "Leaves, mature"],
      description: "Pale leaves, poor growth and flowering"
    },
    {
      id: 83,
      nutrient: "Phosphorus",
      image: "/assets/nutrient-deficiencies/coffee/phosphorus_deficiency.jpg",
      symptoms: ["Dark Green Color", "Growth retardation"],
      cause: "Phosphorus",
      locations: ["Complete plant"],
      description: "Dark green, slow growth"
    },
    {
      id: 84,
      nutrient: "Potassium",
      image: "/assets/nutrient-deficiencies/coffee/potassium_deficiency.jpg",
      symptoms: ["Browning", "Necrosis"],
      cause: "Potassium",
      locations: ["Leaves, mature"],
      description: "Brown necrotic spots on mature leaves"
    },
    {
      id: 85,
      nutrient: "Zinc",
      image: "/assets/nutrient-deficiencies/coffee/zinc_deficiency.jpg",
      symptoms: ["Chlorosis", "Shortening of internodes"],
      cause: "Zinc",
      locations: ["Leaves, young", "Complete plant"],
      description: "Small, chlorotic leaves, shortened internodes"
    }
  ],
  maize: [
    {
      id: 86,
      nutrient: "Boron",
      image: "/assets/nutrient-deficiencies/maize/boron_deficiency.jpg",
      symptoms: ["Necrosis", "Deformation"],
      cause: "Boron",
      locations: ["Young leaves", "Complete plant"],
      description: "Internal browning, cracks, malformed leaves"
    },
    {
      id: 87,
      nutrient: "Calcium",
      image: "/assets/nutrient-deficiencies/maize/calcium_deficiency.jpg",
      symptoms: ["Necrosis", "Deformation"],
      cause: "Calcium",
      locations: ["Young leaves", "Complete plant"],
      description: "Tip burn on young leaves, deformed leaves"
    },
    {
      id: 88,
      nutrient: "Copper",
      image: "/assets/nutrient-deficiencies/maize/coppor_deficiency.jpg",
      symptoms: ["Wilting", "Discolouration"],
      cause: "Copper",
      locations: ["Leaves, young", "Stem/Trunk"],
      description: "Bluish-green discoloration, wilting of new growth"
    },
    {
      id: 89,
      nutrient: "Iron",
      image: "/assets/nutrient-deficiencies/maize/iron_deficiency.jpg",
      symptoms: ["Chlorosis", "White"],
      cause: "Iron",
      locations: ["Leaves, young"],
      description: "Interveinal chlorosis on youngest leaves in calcareous soils"
    },
    {
      id: 90,
      nutrient: "Magnesium",
      image: "/assets/nutrient-deficiencies/maize/magnessium_deficiency.jpg",
      symptoms: ["Chlorosis", "Paling"],
      cause: "Magnesium",
      locations: ["Leaves, mature"],
      description: "Interveinal chlorosis on mature leaves, remaining green at veins"
    },
    {
      id: 91,
      nutrient: "Nitrogen",
      image: "/assets/nutrient-deficiencies/maize/nitrogen.jpg",
      symptoms: ["Paling", "Growth retardation"],
      cause: "Nitrogen",
      locations: ["Leaves, mature", "Complete plant"],
      description: "Yellowing of lower leaves, stunted growth, reduced cob development"
    },
    {
      id: 92,
      nutrient: "Phosphorus",
      image: "/assets/nutrient-deficiencies/maize/phosphorus_deficiency.jpg",
      symptoms: ["Dark Green Color", "Growth retardation"],
      cause: "Phosphorus",
      locations: ["Complete plant", "Leaves, mature"],
      description: "Dark purple coloration, poor root development, late maturity"
    },
    {
      id: 93,
      nutrient: "Potassium",
      image: "/assets/nutrient-deficiencies/maize/potassium_deficiency.jpg",
      symptoms: ["Browning", "Necrosis"],
      cause: "Potassium",
      locations: ["Leaves, mature", "Complete plant"],
      description: "Brown scorch at leaf margins, weak stalks, poor grain fill"
    },
    {
      id: 94,
      nutrient: "Sulphur",
      image: "/assets/nutrient-deficiencies/maize/sulphur_deficiency.jpg",
      symptoms: ["Paling", "Chlorosis"],
      cause: "Sulphur",
      locations: ["Leaves, young"],
      description: "Pale yellow young leaves"
    },
    {
      id: 95,
      nutrient: "Zinc",
      image: "/assets/nutrient-deficiencies/maize/zinc_deficiency.jpg",
      symptoms: ["Chlorosis", "Shortening of internodes"],
      cause: "Zinc",
      locations: ["Leaves, young", "Complete plant"],
      description: "White bands between leaf veins, stunted growth, delayed tasseling"
    }
  ]
};

// Background/Healthy Crop Images
export const BACKGROUND_IMAGES = {
  wheat: "/assets/nutrient-deficiencies/wheat/healthy_wheat.jpg",
  sugarcane: "/assets/nutrient-deficiencies/sugarcane/healthy_sugarcane.jpg",
  coffee: "/assets/nutrient-deficiencies/coffee/healthy_coffee.jpg",
  citrus: "/assets/nutrient-deficiencies/citrus/healthy_ citcus_backgroud image.jpg"
};

// All possible symptoms
export const SYMPTOMS = [
  "Browning",
  "Chlorosis",
  "Cracking",
  "Dark Green Color",
  "Deformation",
  "Discolouration",
  "Growth retardation",
  "Necrosis",
  "Number reduced",
  "Paling",
  "Shortening of internodes",
  "Size reduced",
  "Spots",
  "White",
  "Wilting"
];

// All possible causes (nutrients)
export const CAUSES = [
  "Boron",
  "Calcium",
  "Copper",
  "Iron",
  "Magnesium",
  "Manganese",
  "Molybdenum",
  "Nitrogen",
  "Phosphorus",
  "Potassium",
  "Sulphur",
  "Zinc"
];

// All possible plant locations
export const LOCATIONS = [
  "Complete plant",
  "Ear",
  "Fruits",
  "Leaves, complete plant",
  "Leaves, mature",
  "Leaves, young",
  "Seeds",
  "Stalks",
  "Stem/Trunk"
];

/**
 * Get deficiencies for a specific crop
 */
export function getBackgroundImage(cropName) {
  if (!cropName) return null;
  const crop = cropName.toLowerCase().trim();
  return BACKGROUND_IMAGES[crop] || null;
}

/**
 * Get deficiencies for a specific crop
 */
const defaultNutrientImages = {
  Nitrogen: "https://upload.wikimedia.org/wikipedia/commons/6/66/Corn_leaf_with_nitrogen_deficiency.jpg",
  Phosphorus: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Phosphorus_deficiency.jpg",
  Potassium: "https://upload.wikimedia.org/wikipedia/commons/5/5e/K_Deficiency.jpg",
  Calcium: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Calcium_deficiency.jpg",
  Magnesium: "https://upload.wikimedia.org/wikipedia/commons/5/51/Magnesium_deficiency.jpg",
  Iron: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Iron_deficiency.jpg",
  Manganese: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Manganese_deficiency.jpg",
  Zinc: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Zinc_deficiency.jpg",
  Copper: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Copper_deficiency.jpg",
  Boron: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Boron_deficiency.jpg",
  Sulphur: "https://upload.wikimedia.org/wikipedia/commons/8/82/Sulfur_deficiency.jpg",
  Molybdenum: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Molybdenum_deficiency.jpg",
};

export function getCropDeficiencies(cropName) {
  if (!cropName) return [];
  const crop = cropName.toLowerCase().trim();
  const defs = NUTRIENT_DEFICIENCIES[crop] || [];
  return defs.map((def) => {
    const fallbackLocal = `/assets/nutrient-deficiencies/${crop}_${def.nutrient.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    const fallbackRemote = defaultNutrientImages[def.nutrient] || "https://via.placeholder.com/300x200?text=No+Image";

    return {
      ...def,
      crop,
      image:
        def.image && !def.image.includes('via.placeholder')
          ? def.image
          : fallbackLocal,
      fallbackRemote,
    };
  });
}

/**
 * Filter deficiencies by symptoms, causes, and locations
 */
export function filterDeficiencies(deficiencies, selectedSymptoms = [], selectedCauses = [], selectedLocations = []) {
  return deficiencies.filter(def => {
    // If no filters selected, show all
    if (selectedSymptoms.length === 0 && selectedCauses.length === 0 && selectedLocations.length === 0) {
      return true;
    }

    // Check symptoms
    if (selectedSymptoms.length > 0) {
      const hasSymptom = def.symptoms.some(s => selectedSymptoms.includes(s));
      if (!hasSymptom) return false;
    }

    // Check causes
    if (selectedCauses.length > 0) {
      if (!selectedCauses.includes(def.cause)) return false;
    }

    // Check locations
    if (selectedLocations.length > 0) {
      const hasLocation = def.locations.some(l => selectedLocations.includes(l));
      if (!hasLocation) return false;
    }

    return true;
  });
}
