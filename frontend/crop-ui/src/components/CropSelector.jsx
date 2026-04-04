import { NUTRIENT_DEFICIENCIES } from "../data/nutrientDeficiencies.js";
import "./CropSelector.css";

const CropSelector = ({ onSelectCrop }) => {
  // Get list of available crops
  const crops = Object.keys(NUTRIENT_DEFICIENCIES).sort();

  const cropEmojis = {
    potato: "🥔",
    tomato: "🍅",
    wheat: "🌾",
    onion: "🧅",
    rice: "🍚",
    banana: "🍌",
    sugarcane: "🎋",
    citrus: "🍊",
    coffee: "☕",
  };

  return (
    <div className="crop-selector-container">
      <div className="crop-selector-content">
        <h1 className="crop-selector-title">🌾 Choose Your Crop</h1>
        <p className="crop-selector-subtitle">
          Select a crop to view its nutrient deficiencies and learn more about
          symptoms, causes, and affected plant parts.
        </p>

        <div className="crops-grid">
          {crops.map((crop) => (
            <button
              key={crop}
              className="crop-card"
              onClick={() => onSelectCrop(crop)}
            >
              <div className="crop-emoji">
                {cropEmojis[crop] || "🌱"}
              </div>
              <div className="crop-name">
                {crop.charAt(0).toUpperCase() + crop.slice(1)}
              </div>
              <div className="crop-deficiency-count">
                {NUTRIENT_DEFICIENCIES[crop].length} deficiencies
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CropSelector;
