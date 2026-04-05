/**
 * Crop info cards — growing tips, season, water needs, ideal pH, duration.
 * Keys are lowercase crop names matching ML model output.
 */
export const CROP_INFO = {
  rice: {
    image: "/images/cropImages/rice.jpg",
    zoomedImage: "/images/zoomedImages/rice.jpg",
    season: "Kharif",
    water: "High",
    ph: "5.5–7.0",
    days: "90–150",
    tip: "Needs flooded or waterlogged soil. Transplant seedlings 25–30 days after sowing.",
    sow: "Sow nursery beds in June–July, then transplant seedlings after 25–30 days.",
    howToSow: [
      "Prepare nursery beds with fine soil and apply organic manure.",
      "Soak and sprout the seeds before broadcasting.",
      "Broadcast sprouted seeds evenly on the nursery bed.",
      "Maintain shallow water level (2-3 cm) in the nursery.",
      "Transplant seedlings to the main field when 25-30 days old, spacing 20x15 cm."
    ],
    harvest: "Harvest in October–November when grains are firm and straw begins yellowing.",
    howToHarvest: [
      "Monitor the field for grain maturity - grains should be hard and straw yellow.",
      "Cut the plants 2-3 cm above ground using a sickle or combine harvester.",
      "Bundle the cut plants and stack them for sun-drying.",
      "Dry the bundles for 3-4 days until moisture content is 18-20%.",
      "Thresh using a thresher to separate grains from stalks.",
      "Winnow the grains to remove chaff and store in clean containers."
    ],
    seedTypes: ["Hybrid rice seeds", "High-yield inbred varieties", "Resistant short-duration varieties"],
    seedBenefits: "Choose seeds suited to local rainfall and water availability. Hybrid seeds give higher yield and disease resistance.",
    equipment: [
      "Plow or tractor: for preparing puddled fields and creating nursery beds",
      "Rotavator: for tilling and leveling the soil",
      "Seed broadcaster: for even distribution of sprouted seeds",
      "Water pump: for maintaining water levels in nursery and field",
      "Transplanter machine: for efficient planting of seedlings in rows",
      "Sickle or combine harvester: for cutting mature crops",
      "Thresher: for separating grains from stalks",
      "Winnowing fan: for cleaning grains"
    ],
    fertilizers: ["Urea", "DAP", "MOP", "Zinc sulfate"],
    pesticides: ["Neem oil", "Carbofuran for stem borer", "Tricyclazole for blast", "Fipronil for sheath blight"],
    notes: "Monitor water depth during vegetative growth and manage weeds early to protect yield."
  },
  wheat: {
    image: "/images/cropImages/wheat.jpg",
    zoomedImage: "/images/zoomedImages/wheat.jpg",
    season: "Rabi",
    water: "Medium",
    ph: "6.0–7.5",
    days: "100–150",
    tip: "Sow in cool weather. Avoid waterlogging. Top-dress with nitrogen at tillering stage.",
    sow: "Sow in October–December on well-prepared seedbeds.",
    howToSow: [
      "Prepare the field by plowing and harrowing to create a fine seedbed.",
      "Apply basal fertilizers and mix into the soil.",
      "Use a seed drill to sow seeds at 20-25 cm row spacing.",
      "Maintain sowing depth of 4-5 cm.",
      "Roll the field after sowing for better seed-soil contact."
    ],
    harvest: "Harvest in March–April when grains are hard and moisture is around 18–20%.",
    howToHarvest: [
      "Check grain moisture - harvest when moisture is 18-20%.",
      "Use a combine harvester or manual sickle for cutting.",
      "Cut the crop close to ground level.",
      "Thresh immediately if using combine, or dry bundles if manual.",
      "Clean and dry grains thoroughly before storage."
    ],
    seedTypes: ["High-yielding wheat varieties", "Semi-dwarf varieties", "Rust-resistant varieties"],
    seedBenefits: "Select varieties with rust tolerance and suitable maturity for your region.",
    equipment: [
      "Tractor with plow: for initial field preparation",
      "Harrow: for breaking clods and leveling soil",
      "Seed drill: for precise sowing in rows",
      "Fertilizer spreader: for applying basal fertilizers",
      "Roller: for pressing soil after sowing",
      "Combine harvester: for efficient harvesting and threshing",
      "Sickle: for manual cutting if no machinery",
      "Thresher: for separating grains from straw"
    ],
    fertilizers: ["Urea", "DAP", "MOP", "Gypsum"],
    pesticides: ["Chlorpyrifos for aphids", "Hexaconazole for rust", "Triazophos for termites"],
    notes: "Timely irrigation at critical stages like crown root initiation and grain filling is key."
  },
  maize: {
    image: "/images/cropImages/maize.jpg",
    zoomedImage: "/images/zoomedImages/maize.jpg",
    season: "Kharif",
    water: "Medium",
    ph: "5.8–7.0",
    days: "80–110",
    tip: "Needs well-drained soil. Apply zinc sulfate if deficiency is observed.",
    sow: "Sow in June–July when soils warm up.",
    howToSow: [
      "Prepare the field by plowing and harrowing for good drainage.",
      "Make ridges or flat beds depending on soil type.",
      "Sow seeds 4-5 cm deep in rows spaced 60-75 cm apart.",
      "Place 2-3 seeds per hill and thin to one plant later.",
      "Apply pre-emergence herbicide if needed."
    ],
    harvest: "Harvest in September–October when kernels are dry and husks turn brown.",
    howToHarvest: [
      "Harvest when husks are brown and kernels dented.",
      "Cut the stalks at ground level using a sickle or maize harvester.",
      "Remove husks and dry cobs in shade for 2-3 days.",
      "Shell the kernels using a corn sheller.",
      "Dry kernels to 12-14% moisture before storage."
    ],
    seedTypes: ["Hybrid dent maize", "Sweet corn varieties", "Drought-tolerant hybrids"],
    seedBenefits: "Hybrid seeds improve yield and standability. Choose based on grain or green cob use.",
    equipment: [
      "Tractor with plow: for field preparation",
      "Ridger: for making ridges in heavy soils",
      "Seed drill or planter: for sowing seeds in rows",
      "Herbicide sprayer: for weed control",
      "Maize harvester: for cutting and husking",
      "Corn sheller: for removing kernels from cobs",
      "Dryer: for reducing moisture content"
    ],
    fertilizers: ["DAP", "Urea", "MOP", "Zinc sulfate"],
    pesticides: ["Lambda-cyhalothrin for stem borer", "Carbendazim for blight", "Neem cake against soil pests"],
    notes: "Ensure balanced NPK application and stage-wise irrigation during tasseling and grain filling."
  },
  chickpea: {
    image: "/images/chickpea.jpg",
    zoomedImage: "/images/zoomedImages/chickpea.jpg",
    season: "Rabi",
    water: "Low",
    ph: "6.0–8.0",
    days: "90–120",
    tip: "Drought-tolerant. Avoid excess nitrogen — it fixes its own. Good for dry regions.",
    sow: "Sow in October–November on well-drained soils.",
    howToSow: [
      "Prepare fine seedbed by plowing and harrowing.",
      "Inoculate seeds with Rhizobium culture before sowing.",
      "Broadcast or drill seeds at 5-7 cm depth.",
      "Maintain 30-45 cm spacing between rows.",
      "Apply light irrigation after sowing for germination."
    ],
    harvest: "Harvest in February–March when pods turn brown and seeds rattle.",
    howToHarvest: [
      "Harvest when 80-90% pods are brown and dry.",
      "Cut plants at ground level using sickle.",
      "Dry the cut plants in sun for 2-3 days.",
      "Thresh gently using sticks or thresher.",
      "Winnow to separate seeds from chaff."
    ],
    seedTypes: ["Desi chickpea varieties", "Kabuli chickpea varieties", "Short-duration varieties"],
    seedBenefits: "Choose Kabuli for larger grains and Desi for higher market demand; short-duration seeds suit late planting.",
    equipment: [
      "Tractor plow: for field preparation",
      "Seed drill: for row sowing",
      "Inoculation equipment: for treating seeds with Rhizobium",
      "Sickle: for manual harvesting",
      "Thresher: for separating seeds",
      "Winnowing basket: for cleaning seeds"
    ],
    fertilizers: ["Single super phosphate", "MoP", "Rhizobium biofertilizer"],
    pesticides: ["Imidacloprid for pod borer", "Carbendazim for root rot", "Sulphur dust for powdery mildew"],
    notes: "Inoculate seeds with Rhizobium and practice crop rotation to improve soil health."
  },
  "kidney beans": {
    image: "/images/cropImages/kidney beans.jpg",
    zoomedImage: "/images/zoomedImages/kidney beans.jpg",
    season: "Kharif",
    water: "Medium",
    ph: "6.0–7.5",
    days: "80–100",
    tip: "Sensitive to frost. Needs well-drained loamy soil. Avoid over-irrigation.",
    sow: "Sow in June–July after the last frost.",
    howToSow: [
      "Prepare well-drained seedbed with organic matter.",
      "Sow seeds 3-5 cm deep in rows 45-60 cm apart.",
      "Space seeds 10-15 cm within rows.",
      "Provide support stakes for climbing varieties.",
      "Mulch around plants to retain moisture."
    ],
    harvest: "Harvest in September–October when pods are fully developed.",
    howToHarvest: [
      "Harvest when pods are plump but before they dry.",
      "Pick pods by hand or cut entire plants.",
      "For dry beans, allow pods to dry on plant.",
      "Thresh dried pods to extract beans.",
      "Clean and dry beans before storage."
    ],
    seedTypes: ["Lobia varieties", "Bush bean varieties", "Climbing bean varieties"],
    seedBenefits: "Select varieties adapted to local soil and rainfall with good pod quality.",
    equipment: [
      "Plow: for soil preparation",
      "Seeder: for planting in rows",
      "Support stakes: for climbing varieties",
      "Mulching equipment: for moisture retention",
      "Harvesting knife: for cutting pods",
      "Thresher: for dry bean extraction"
    ],
    fertilizers: ["DAP", "MoP", "Compost"],
    pesticides: ["Quinalphos for bean fly", "Neem oil for aphids", "Carbaryl for pod borer"],
    notes: "Provide support for climbing types and avoid waterlogging to prevent root rot."
  },
  "pigeon peas": {
    image: "/image/cropImagess/pigeon peas.jpg",
    zoomedImage: "/images/zoomedImages/pigeon peas.jpg",
    season: "Kharif",
    water: "Low",
    ph: "5.0–7.5",
    days: "120–180",
    tip: "Drought-resistant. Deep taproot. Excellent for intercropping with cereals.",
    sow: "Sow in June–July when monsoon begins.",
    howToSow: [
      "Prepare field with minimum tillage to preserve moisture.",
      "Sow seeds 5-7 cm deep in rows 60-90 cm apart.",
      "Space plants 20-30 cm within rows.",
      "Inoculate seeds with Rhizobium for nitrogen fixation.",
      "Apply light irrigation after sowing."
    ],
    harvest: "Harvest in December–February when pods mature and leaves begin to yellow.",
    howToHarvest: [
      "Harvest when pods are mature but green for vegetable use.",
      "For grain, wait until pods dry and rattle.",
      "Cut stems at ground level.",
      "Dry cut plants in sun for 2-3 days.",
      "Thresh to separate pods from stems.",
      "Further thresh to extract seeds."
    ],
    seedTypes: ["Short-duration varieties", "Medium-duration varieties", "Drought-tolerant lines"],
    seedBenefits: "Use varieties suited for intercropping or rainfed farming to maximize returns.",
    equipment: [
      "Minimum tillage equipment: for soil preparation",
      "Seed drill: for sowing in rows",
      "Rhizobium applicator: for seed treatment",
      "Sickle: for harvesting",
      "Thresher: for pod separation",
      "Seed extractor: for removing seeds from pods"
    ],
    fertilizers: ["DAP", "MoP", "FYM"],
    pesticides: ["Monocrotophos for pod borer", "Carbendazim for wilt", "Neem oil for aphids"],
    notes: "Plant on ridges or raised beds in heavy soils to improve drainage."
  },
  "moth beans": {
    image: "/images/cropImages/moth-beans.jpg",
    zoomedImage: "/images/zoomedImages/moth beans.jpg",
    season: "Kharif",
    water: "Low",
    ph: "7.0–8.5",
    days: "60–90",
    tip: "Extremely drought-tolerant. Ideal for arid and semi-arid regions.",
    sow: "Sow in July–August after first rains.",
    howToSow: [
      "Prepare field with conservation tillage.",
      "Broadcast seeds on leveled fields or sow in rows 30-45 cm apart.",
      "Sow seeds 3-4 cm deep.",
      "Inoculate with Rhizobium for better nodulation.",
      "Apply light irrigation if needed for germination."
    ],
    harvest: "Harvest in September–October when pods are dry and seeds rattle.",
    howToHarvest: [
      "Harvest when plants are completely dry.",
      "Pull entire plants from the ground.",
      "Sun-dry plants for 2-3 days.",
      "Thresh by beating with sticks.",
      "Winnow to separate seeds from debris."
    ],
    seedTypes: ["Drought-tolerant varieties", "Early-maturing varieties"],
    seedBenefits: "Choose low-moisture, early varieties for dry climates and short-season windows.",
    equipment: [
      "Conservation tillage tools: for minimal soil disturbance",
      "Broadcast seeder: for even seed distribution",
      "Rhizobium mixer: for seed treatment",
      "Manual puller: for harvesting",
      "Threshing sticks: for pod breaking",
      "Winnowing tray: for seed cleaning"
    ],
    fertilizers: ["Phosphorus", "Potash", "Gypsum"],
    pesticides: ["Fipronil for pod borer", "Mancozeb for leaf spot", "Neem oil for thrips"],
    notes: "Minimal fertilizer is needed; add phosphorus at sowing for best nodulation."
  },
  "mung bean": {
    image: "/images/cropImages/mung bean.jpg",
    zoomedImage: "/images/zoomedImages/mung bean.jpg",
    season: "Kharif",
    water: "Low",
    ph: "6.2–7.2",
    days: "60–90",
    tip: "Short duration crop. Good for soil health. Harvest when pods turn black.",
    sow: "Sow in June–July or February–March for short-season pulses.",
    howToSow: [
      "Prepare fine tilth soil with plowing and harrowing.",
      "Sow seeds 3-4 cm deep in rows spaced 30-45 cm apart.",
      "Maintain 10-15 cm spacing between plants.",
      "Inoculate seeds with Rhizobium culture.",
      "Irrigate lightly after sowing for quick germination."
    ],
    harvest: "Harvest in September–October when pods mature and pods turn black.",
    howToHarvest: [
      "Harvest when pods are black and dry.",
      "Cut plants at ground level using sickle.",
      "Dry cut plants briefly in shade to avoid shattering.",
      "Thresh gently to separate pods.",
      "Further thresh pods to extract seeds."
    ],
    seedTypes: ["Green gram varieties", "Dual-purpose varieties"],
    seedBenefits: "Select varieties that yield well and suit the intended market (grain or green pods).",
    equipment: [
      "Plow and harrow: for seedbed preparation",
      "Seed drill: for row sowing",
      "Rhizobium applicator: for seed inoculation",
      "Sickle: for harvesting",
      "Threshing machine: for gentle pod separation",
      "Seed cleaner: for final cleaning"
    ],
    fertilizers: ["Single super phosphate", "MoP", "Biofertilizer"],
    pesticides: ["Carbaryl for pod borer", "Copper oxychloride for leaf spot", "Neem oil for aphids"],
    notes: "Good for crop rotation and soil nitrogen improvement with proper inoculation."
  },
  "black gram": {
    image: "/images/cropImages/black gram.jpg",
    zoomedImage: "/images/zoomedImages/black gram.jpg",
    season: "Kharif",
    water: "Low",
    ph: "6.0–7.5",
    days: "70–90",
    tip: "Tolerates light shade. Avoid waterlogging. Rich in protein — high market value.",
    sow: "Sow in June–July when monsoon begins.",
    howToSow: [
      "Prepare well-drained seedbed.",
      "Sow seeds 3-4 cm deep in rows spaced 30-45 cm apart.",
      "Maintain 10-15 cm plant spacing.",
      "Treat seeds with Rhizobium for nitrogen fixation.",
      "Apply light irrigation after sowing."
    ],
    harvest: "Harvest in September–October when pods dry and seeds are uniform.",
    howToHarvest: [
      "Harvest when pods are dry and black.",
      "Cut plants at base with sickle.",
      "Dry plants in sun for a day to avoid damage.",
      "Thresh gently using sticks or machine.",
      "Winnow to separate clean seeds."
    ],
    seedTypes: ["Drought-tolerant varieties", "High-protein varieties"],
    seedBenefits: "Choose types that suit your rainfall regime and market preference.",
    equipment: [
      "Plow: for soil preparation",
      "Seed drill: for sowing",
      "Rhizobium mixer: for seed treatment",
      "Sickle: for cutting plants",
      "Threshing equipment: for seed separation",
      "Winnowing fan: for cleaning"
    ],
    fertilizers: ["Phosphorus", "Potash", "Biofertilizer"],
    pesticides: ["Imidacloprid for pod borer", "Mancozeb for leaf spot", "Sulphur dust for powdery mildew"],
    notes: "Use timely weed management and maintain light irrigation only when necessary."
  },
  lentil: {
    image: "/images/cropImages/lentil.jpg",
    zoomedImage: "/images/zoomedImages/lentil.jpg",
    season: "Rabi",
    water: "Low",
    ph: "6.0–8.0",
    days: "80–110",
    tip: "Cool-season crop. Sensitive to salinity. Inoculate seeds with Rhizobium.",
    sow: "Sow in October–November when soils cool.",
    howToSow: [
      "Prepare fine seedbed with plowing and leveling.",
      "Drill seeds 4-5 cm deep in rows spaced 20-25 cm apart.",
      "Maintain 5-8 cm spacing between seeds.",
      "Inoculate with Rhizobium culture.",
      "Roll the field for good seed-soil contact."
    ],
    harvest: "Harvest in February–March once pods turn brown.",
    howToHarvest: [
      "Harvest when pods are brown and dry.",
      "Cut plants and sun-dry for 2-3 days.",
      "Thresh gently to avoid seed damage.",
      "Winnow to remove chaff.",
      "Store in cool, dry place."
    ],
    seedTypes: ["Medium-duration varieties", "High-protein types"],
    seedBenefits: "Select types that match your soil and terminal heat tolerance.",
    equipment: [
      "Plow and leveler: for seedbed preparation",
      "Seed drill: for precise sowing",
      "Rhizobium applicator: for seed treatment",
      "Roller: for soil compaction",
      "Sickle: for harvesting",
      "Gentle thresher: for seed extraction"
    ],
    fertilizers: ["Super phosphate", "MoP", "Rhizobium inoculant"],
    pesticides: ["Trifloxystrobin for blight", "Chlorpyrifos for aphids", "Copper hydroxide for leaf spot"],
    notes: "Avoid excess irrigation; lentil performs well on residual soil moisture."
  },
  pomegranate: {
    image: "/images/cropImages/pomegranate.jpg",
    zoomedImage: "/images/zoomedImages/pomegranate.jpg",
    season: "Perennial",
    water: "Low",
    ph: "5.5–7.5",
    days: "150–180",
    tip: "Drought-tolerant once established. Prune after harvest for better fruiting.",
    sow: "Use grafted plants or setts in June–July or November–December.",
    howToSow: [
      "Prepare pits 1m x 1m x 1m filled with soil and compost.",
      "Plant grafted saplings 4-5 m apart.",
      "Ensure graft union is above soil level.",
      "Water thoroughly after planting.",
      "Mulch around the base to retain moisture."
    ],
    harvest: "Harvest from September to February when fruits develop glossy ruby skin.",
    howToHarvest: [
      "Harvest when fruits are fully colored and firm.",
      "Pick fruits carefully by hand to avoid bruising.",
      "Use pruning shears for hard-to-reach fruits.",
      "Handle gently during transport.",
      "Store in cool, dry place."
    ],
    seedTypes: ["Grafted pomegranate saplings", "Bhagwa", "Ganesh"],
    seedBenefits: "Grafted plants establish faster and produce uniform fruit quality.",
    equipment: [
      "Pit digger: for preparing planting pits",
      "Grafting tools: for plant propagation",
      "Pruning shears: for harvesting and maintenance",
      "Mulching equipment: for moisture retention",
      "Hand tools: for careful fruit picking"
    ],
    fertilizers: ["NPK", "Organic manure", "Neem cake"],
    pesticides: ["Deltamethrin for mealybugs", "Mancozeb for blight", "Emamectin benzoate for fruit borer"],
    notes: "Manage irrigation carefully; excess moisture can reduce fruit quality."
  },
  banana: {
    image: "/images/cropImages/banana.jpg",
    zoomedImage: "/images/zoomedImages/banana.jpg",
    season: "Perennial",
    water: "High",
    ph: "5.5–7.0",
    days: "270–365",
    tip: "Needs warm humid climate. Mulch heavily. Remove suckers to maintain one per plant.",
    sow: "Plant tissue-cultured or suckers during the rainy season.",
    howToSow: [
      "Prepare pits 60cm x 60cm x 60cm filled with compost.",
      "Plant suckers with bud facing upwards.",
      "Space plants 2-3 m apart in rows.",
      "Water immediately after planting.",
      "Apply mulch around the base."
    ],
    harvest: "Harvest when fingers are plump and start to color.",
    howToHarvest: [
      "Harvest when 75% of fingers are mature.",
      "Cut the bunch with a sharp knife.",
      "Handle carefully to avoid bruising.",
      "Transport in padded containers.",
      "Store at 13-15°C for ripening."
    ],
    seedTypes: ["Cavendish", "Nendran", "Rasthali"],
    seedBenefits: "Choose varieties based on market demand and local climate.",
    equipment: [
      "Pit digger: for planting hole preparation",
      "Mulching machine: for applying organic mulch",
      "Sharp knife: for harvesting bunches",
      "Padded transport containers: for safe handling",
      "Sucker removal tools: for plant management"
    ],
    fertilizers: ["NPK", "Potash", "Magnesium sulfate"],
    pesticides: ["Benzothiadiazole for Panama disease", "Imidacloprid for aphids", "Captan for fungal rot"],
    notes: "Maintain frequent irrigation and mulching to keep moisture levels stable."
  },
  mango: {
    image: "/images/cropImages/mango.jpg",
    zoomedImage: "/images/zoomedImages/mango.jpg",
    season: "Perennial",
    water: "Low",
    ph: "5.5–7.5",
    days: "90–120",
    tip: "Needs dry spell before flowering. Avoid nitrogen excess — it delays fruiting.",
    sow: "Plant grafted saplings in June–July or September–October.",
    howToSow: [
      "Dig pits 1m x 1m x 1m and fill with fertile soil.",
      "Plant grafted saplings ensuring graft union is above ground.",
      "Space trees 8-10 m apart.",
      "Stake young plants for support.",
      "Apply mulch and water regularly."
    ],
    harvest: "Harvest in April–June when fruits are mature and aromatic.",
    howToHarvest: [
      "Harvest when fruits are mature but firm.",
      "Twist fruit gently from the stem without pulling.",
      "Use ladders for tall trees.",
      "Handle carefully to avoid skin damage.",
      "Grade and pack for market."
    ],
    seedTypes: ["Alphonso", "Kesar", "Dasheri", "Banganapalli"],
    seedBenefits: "Grafted varieties ensure consistent fruit quality and yield.",
    equipment: [
      "Pit digger: for planting preparation",
      "Staking materials: for young plant support",
      "Ladders: for harvesting from tall trees",
      "Fruit picking tools: for careful harvesting",
      "Grading and packing equipment: for post-harvest"
    ],
    fertilizers: ["NPK", "Potassium nitrate", "Organic compost"],
    pesticides: ["Carbaryl for fruit fly", "Mancozeb for anthracnose", "Copper oxychloride for bacterial spots"],
    notes: "Prune after harvest and manage irrigation to avoid alternate bearing."
  },
  grapes: {
    image: "/images/cropImages/grapes.jpg",
    zoomedImage: "/images/zoomedImages/grapes.jpg",
    season: "Perennial",
    water: "Medium",
    ph: "6.0–7.5",
    days: "150–180",
    tip: "Prune annually. Train on trellis. Needs good air circulation to prevent fungal disease.",
    sow: "Plant rooted cuttings or saplings in June–July.",
    howToSow: [
      "Prepare trenches or pits for planting.",
      "Plant cuttings 1.8-2.4 m apart on trellis rows.",
      "Ensure buds face upwards.",
      "Install trellis system before planting.",
      "Water thoroughly after planting."
    ],
    harvest: "Harvest in March–May when bunches are fully colored and sweet.",
    howToHarvest: [
      "Harvest when berries are fully colored.",
      "Cut bunches carefully with pruning shears.",
      "Leave a short stalk attached.",
      "Handle gently to avoid bruising.",
      "Cool immediately after harvest."
    ],
    seedTypes: ["Thompson Seedless", "Perlette", "Anab-e-Shahi"],
    seedBenefits: "Seedless varieties fetch better market prices for table grapes.",
    equipment: [
      "Trellis system: for vine support",
      "Pruning shears: for harvesting and training",
      "Tractor: for soil preparation",
      "Irrigation system: for water management",
      "Cooling facilities: for post-harvest"
    ],
    fertilizers: ["Balanced NPK", "Boron", "Molybdenum"],
    pesticides: ["Sulfur for powdery mildew", "Copper oxychloride for downy mildew", "Spinosad for thrips"],
    notes: "Train vines carefully to manage canopy and improve sunlight penetration."
  },
  watermelon: {
    image: "/images/cropImages/watermelon.jpg",
    zoomedImage: "/images/zoomedImages/watermelon.jpg",
    season: "Zaid",
    water: "Medium",
    ph: "6.0–7.0",
    days: "70–90",
    tip: "Needs warm soil. Space plants 2m apart. Reduce watering as fruits mature for sweetness.",
    sow: "Sow in February–March on raised beds.",
    howToSow: [
      "Prepare raised beds 20-30 cm high.",
      "Sow seeds in hills 2m apart.",
      "Place 4-5 seeds per hill, 2-3 cm deep.",
      "Thin to 2-3 plants per hill after germination.",
      "Apply mulch to conserve moisture."
    ],
    harvest: "Harvest in May–June when the fruit surface turns dull and the tendril dries.",
    howToHarvest: [
      "Harvest when tendril near fruit dries.",
      "Cut fruit close to the stem with a knife.",
      "Handle carefully to avoid bruising.",
      "Transport in padded containers.",
      "Store in cool place."
    ],
    seedTypes: ["Sugar Baby", "Arka Manik", "Crimson Sweet"],
    seedBenefits: "Choose sugar-rich, disease-resistant hybrids for good market value.",
    equipment: [
      "Bed former: for raised bed preparation",
      "Seeder: for hill sowing",
      "Mulching equipment: for moisture retention",
      "Sharp knife: for harvesting",
      "Padded transport: for safe handling"
    ],
    fertilizers: ["NPK", "Gypsum", "Organic manure"],
    pesticides: ["Emamectin against fruit borer", "Mancozeb for leaf spot", "Neem oil for aphids"],
    notes: "Reduce irrigation 10 days before harvest to concentrate sugars."
  },
  muskmelon: {
    image: "/images/cropImages/muskmelon.jpg",
    zoomedImage: "/images/zoomedImages/muskmelon.jpg",
    season: "Zaid",
    water: "Medium",
    ph: "6.0–7.0",
    days: "70–90",
    tip: "Similar to watermelon. Stop irrigation 10 days before harvest for better flavor.",
    sow: "Sow in February–March in warm, well-drained soil.",
    howToSow: [
      "Prepare raised beds for good drainage.",
      "Sow seeds in hills 1.5-2 m apart.",
      "Place 3-4 seeds per hill, 2 cm deep.",
      "Thin to 2 plants per hill after emergence.",
      "Provide trellis for vine support."
    ],
    harvest: "Harvest in May–June when the skin turns netted and aromatic.",
    howToHarvest: [
      "Harvest when fruit develops aroma.",
      "Cut fruit with a small stem segment.",
      "Handle gently to avoid damage.",
      "Cool immediately after picking.",
      "Store at 7-10°C."
    ],
    seedTypes: ["Arka Shirish", "Honeydew", "Pusa Madhuras"],
    seedBenefits: "Choose aromatic, high-Brix varieties for best flavour and price.",
    equipment: [
      "Bed shaper: for raised bed preparation",
      "Seeder: for hill planting",
      "Trellis: for vine support",
      "Knife: for harvesting",
      "Cooling storage: for post-harvest"
    ],
    fertilizers: ["NPK", "Potash", "Organic manure"],
    pesticides: ["Carbendazim for powdery mildew", "Imidacloprid for aphids", "Sulfur for rust"],
    notes: "Keep vines well-trained and harvest promptly when fruit ripens."
  },
  apple: {
    image: "/images/cropImages/apple.jpg",
    zoomedImage: "/images/zoomedImages/apple.jpg",
    season: "Rabi",
    water: "Medium",
    ph: "5.5–6.5",
    days: "150–180",
    tip: "Needs chilling hours in winter. Thin fruits early for larger size. Spray for scab.",
    sow: "Plant grafted saplings in winter in cool hill regions.",
    howToSow: [
      "Prepare well-drained soil in hilly areas.",
      "Plant saplings in pits with organic matter.",
      "Space trees 5-6 m apart.",
      "Ensure proper root establishment.",
      "Mulch and stake young trees."
    ],
    harvest: "Harvest in August–October when skin color and flavor develop.",
    howToHarvest: [
      "Harvest when fruits are fully colored.",
      "Pick fruits by hand, avoiding bud damage.",
      "Use ladders for higher branches.",
      "Handle gently to prevent bruising.",
      "Store in cold storage."
    ],
    seedTypes: ["Red Delicious", "Royal Gala", "Shimla Apple"],
    seedBenefits: "Grafted varieties provide predictable quality and earlier bearing.",
    equipment: [
      "Pit digger: for planting preparation",
      "Staking materials: for tree support",
      "Ladders: for harvesting",
      "Fruit thinning tools: for size management",
      "Cold storage: for post-harvest"
    ],
    fertilizers: ["NPK", "Calcium nitrate", "Organic manure"],
    pesticides: ["Mancozeb for scab", "Carbaryl for codling moth", "Sulfur for powdery mildew"],
    notes: "Manage irrigation and apply protective sprays during blossom and fruit development."
  },
  orange: {
    image: "/images/cropImages/orange.jpg",
    zoomedImage: "/images/zoomedImages/orange.jpg",
    season: "Perennial",
    water: "Medium",
    ph: "6.0–7.5",
    days: "180–240",
    tip: "Needs well-drained soil. Avoid overwatering. Foliar spray micronutrients annually.",
    sow: "Plant grafted saplings in June–July or September–October.",
    howToSow: [
      "Dig pits 1m x 1m x 1m filled with compost.",
      "Plant grafted saplings 6-8 m apart.",
      "Ensure graft union is above soil.",
      "Water thoroughly and mulch.",
      "Stake young trees for wind protection."
    ],
    harvest: "Harvest in November–February when fruits are fully colored.",
    howToHarvest: [
      "Harvest when fruits are fully ripe.",
      "Pick fruits gently by hand.",
      "Leave a short stem attached.",
      "Handle carefully to avoid oil gland damage.",
      "Grade and pack immediately."
    ],
    seedTypes: ["Nagpur orange", "Mosambi", "Kinnow"],
    seedBenefits: "Choose seedless or sweet varieties for better consumer demand.",
    equipment: [
      "Pit digger: for planting pits",
      "Staking poles: for young tree support",
      "Hand picking tools: for careful harvesting",
      "Grading equipment: for fruit sorting",
      "Packing materials: for market preparation"
    ],
    fertilizers: ["NPK", "Magnesium sulfate", "Boron"],
    pesticides: ["Emamectin for fruit fly", "Copper oxychloride for citrus canker", "Imidacloprid for aphids"],
    notes: "Avoid water stress and maintain good orchard sanitation."
  },
  papaya: {
    image: "/images/cropImages/papaya.jpg",
    zoomedImage: "/images/zoomedImages/papaya.jpg",
    season: "Perennial",
    water: "Medium",
    ph: "6.0–7.0",
    days: "180–270",
    tip: "Fast-growing. Sensitive to waterlogging. Plant on raised beds in heavy soils.",
    sow: "Plant seedlings at 1.5–2 m spacing after the rainy season.",
    howToSow: [
      "Prepare raised beds for drainage.",
      "Plant seedlings in holes with compost.",
      "Space plants 1.5-2 m apart.",
      "Stake plants for support.",
      "Mulch to prevent weed growth."
    ],
    harvest: "Harvest 6–9 months after planting when fruits attain full size.",
    howToHarvest: [
      "Harvest when fruits are mature but green.",
      "Cut fruit with a knife, leaving stem.",
      "Handle carefully to avoid latex leakage.",
      "Harvest regularly every 2-3 days.",
      "Store at room temperature for ripening."
    ],
    seedTypes: ["Red Lady", "Pusa Delicious", "Arka Surya"],
    seedBenefits: "Select high-yielding, disease-resistant hybrid varieties.",
    equipment: [
      "Bed former: for raised bed preparation",
      "Staking materials: for plant support",
      "Sharp knife: for harvesting",
      "Protective gear: for handling latex",
      "Mulching tools: for weed control"
    ],
    fertilizers: ["NPK", "Potash", "Organic manure"],
    pesticides: ["Carbaryl for papaya fruit fly", "Mancozeb for anthracnose", "Imidacloprid for mites"],
    notes: "Remove diseased plants and maintain drainage to avoid root rot."
  },
  coconut: {
    image: "/images/cropImages/coconut.jpg",
    zoomedImage: "/images/zoomedImages/coconut.jpg",
    season: "Perennial",
    water: "High",
    ph: "5.5–8.0",
    days: "365+",
    tip: "Needs coastal humid climate. Apply potassium-rich fertilizer for better nut yield.",
    sow: "Plant seedlings at 7–9 m spacing in deep, sandy loam soils.",
    howToSow: [
      "Prepare pits 1m x 1m x 1m in well-drained soil.",
      "Plant seedlings with husk intact.",
      "Space palms 7-9 m apart.",
      "Ensure water retention around base.",
      "Mulch and protect from wind."
    ],
    harvest: "Harvest nuts year-round as they mature, typically every 45–60 days.",
    howToHarvest: [
      "Climb palm or use long poles.",
      "Cut bunches with sharp knife.",
      "Lower bunches safely to ground.",
      "Collect fallen nuts immediately.",
      "De-husk and store properly."
    ],
    seedTypes: ["Tall varieties", "Dwarf varieties", "Hybrid seedlings"],
    seedBenefits: "Choose varieties based on local climate and water availability.",
    equipment: [
      "Pit digger: for planting preparation",
      "Climbing gear: for harvesting",
      "Long poles with hooks: for cutting bunches",
      "De-husking tools: for nut processing",
      "Wind protection: for young palms"
    ],
    fertilizers: ["NPK", "Potash", "Magnesium sulfate"],
    pesticides: ["Imidacloprid for rhinoceros beetle", "Bifenthrin for weevil", "Copper fungicides for bud rot"],
    notes: "Maintain good drainage and control weeds around palms."
  },
  cotton: {
    image: "/images/cropImages/cotton.jpg",
    zoomedImage: "/images/zoomedImages/cotton.jpg",
    season: "Kharif",
    water: "Medium",
    ph: "5.8–8.0",
    days: "150–180",
    tip: "Needs long frost-free season. Monitor for bollworm. Avoid excess nitrogen early.",
    sow: "Sow cotton seed in June–July after soil warms.",
    howToSow: [
      "Prepare fine seedbed with plowing.",
      "Sow seeds in rows 75-90 cm apart.",
      "Maintain shallow sowing depth.",
      "Thin seedlings to proper spacing.",
      "Apply pre-emergence herbicide."
    ],
    harvest: "Harvest in October–November when bolls open.",
    howToHarvest: [
      "Harvest when bolls are fully open.",
      "Pick by hand or use mechanical pickers.",
      "Collect in bags to avoid contamination.",
      "Dry picked cotton in shade.",
      "Ginn to separate lint from seeds."
    ],
    seedTypes: ["Bt cotton hybrids", "Non-Bt long staple", "Medium-duration varieties"],
    seedBenefits: "Bt hybrids reduce bollworm damage and increase yield.",
    equipment: [
      "Plow and harrow: for seedbed preparation",
      "Seed drill: for row sowing",
      "Herbicide sprayer: for weed control",
      "Cotton picker: for mechanical harvesting",
      "Cotton gin: for lint separation"
    ],
    fertilizers: ["DAP", "Urea", "MoP", "Nitrogen top dressing"],
    pesticides: ["Bt formulation for bollworm", "Acephate for aphids", "Carbaryl for foliage pests"],
    notes: "Use integrated pest management to minimize pesticide resistance."
  },
  jute: {
    image: "/images/jute.jpg",
    season: "Kharif",
    water: "High",
    ph: "6.0–7.5",
    days: "100–120",
    tip: "Needs warm humid climate and alluvial soil. Harvest before flowering for best fiber.",
    sow: "Sow in March–May after soil moisture is available.",
    howToSow: [
      "Prepare puddled seedbed.",
      "Broadcast seeds evenly on wet soil.",
      "Cover lightly with soil or water.",
      "Maintain standing water initially.",
      "Thin seedlings if overcrowded."
    ],
    harvest: "Harvest in July–August before plants flower.",
    howToHarvest: [
      "Harvest when plants are 3-4 m tall.",
      "Pull plants from base with roots.",
      "Bundle plants for retting.",
      "Ret in water for 10-15 days.",
      "Extract fiber after retting."
    ],
    seedTypes: ["Tossa jute", "White jute", "Brown jute"],
    seedBenefits: "Choose seed type based on fiber quality needed for market demand.",
    equipment: [
      "Plow: for field preparation",
      "Water pump: for puddling",
      "Broadcast seeder: for sowing",
      "Pulling tools: for harvesting",
      "Retting tanks: for fiber processing"
    ],
    fertilizers: ["DAP", "MoP", "Gypsum"],
    pesticides: ["Metasystox for semilooper", "Carbaryl for jute hairy caterpillar"],
    notes: "Ret water properly during retting to preserve fiber strength."
  },
  coffee: {
    image: "/images/coffee.jpg",
    season: "Perennial",
    water: "Medium",
    ph: "6.0–6.5",
    days: "365+",
    tip: "Needs shade and cool temperatures. Mulch heavily. Prune after harvest.",
    sow: "Plant grafted seedlings in June–July under shade trees.",
    howToSow: [
      "Prepare shaded planting area.",
      "Dig pits and enrich with compost.",
      "Plant seedlings 2-3 m apart.",
      "Provide permanent shade trees.",
      "Mulch heavily around base."
    ],
    harvest: "Harvest cherries in November–February when ripe.",
    howToHarvest: [
      "Harvest ripe red cherries selectively.",
      "Pick by hand to avoid damage.",
      "Collect in baskets.",
      "Process immediately or dry.",
      "Store in cool, dry conditions."
    ],
    seedTypes: ["Arabica", "Robusta", "Hybrid varieties"],
    seedBenefits: "Arabica gives premium quality; Robusta is hardier and higher-yielding.",
    equipment: [
      "Shade tree management tools: for canopy control",
      "Mulching equipment: for moisture retention",
      "Hand picking baskets: for harvesting",
      "Processing equipment: for cherry depulping",
      "Drying racks: for bean processing"
    ],
    fertilizers: ["NPK", "Organic compost", "Micronutrients"],
    pesticides: ["Copper hydroxide for leaf rust", "Spinosad for berry borer", "Imidacloprid for mealybugs"],
    notes: "Maintain shade and mulch to protect roots and preserve soil moisture."
  }
};

export function getCropInfo(cropName) {
  if (!cropName) return null;
  return CROP_INFO[cropName.toLowerCase().trim()] || null;
}
