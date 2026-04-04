import { useState } from "react";
import "./DeficiencyCard.css";

const DeficiencyCard = ({ deficiency }) => {
  const nutrientIcons = {
    Nitrogen: "N",
    Phosphorus: "P",
    Potassium: "K",
    Calcium: "Ca",
    Magnesium: "Mg",
    Iron: "Fe",
    Manganese: "Mn",
    Zinc: "Zn",
    Copper: "Cu",
    Boron: "B",
    Sulphur: "S",
    Molybdenum: "Mo",
  };

  const nutrientColors = {
    Nitrogen: "#2ecc71",
    Phosphorus: "#e74c3c",
    Potassium: "#f39c12",
    Calcium: "#9b59b6",
    Magnesium: "#1abc9c",
    Iron: "#c0392b",
    Manganese: "#d35400",
    Zinc: "#8e44ad",
    Copper: "#b8860b",
    Boron: "#16a085",
    Sulphur: "#f1c40f",
    Molybdenum: "#34495e",
  };

  const defaultImages = {
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

  const localPath = deficiency.crop
    ? `/assets/nutrient-deficiencies/${deficiency.crop.toLowerCase().replace(/\s+/g, '-')}_${deficiency.nutrient.toLowerCase().replace(/\s+/g, '-')}.jpg`
    : null;

  const baseFallback = defaultImages[deficiency.nutrient] || "https://via.placeholder.com/300x200?text=No+Image+Available";
  const initialImage =
    deficiency.image && !deficiency.image.includes("via.placeholder")
      ? deficiency.image
      : localPath || baseFallback;

  const [imgSrc, setImgSrc] = useState(initialImage);

  const onImageError = () => {
    if (imgSrc !== baseFallback) {
      setImgSrc(baseFallback);
    }
  };

  return (
    <div className="deficiency-card">
      {/* Nutrient Header */}
      <div
        className="deficiency-header"
        style={{ backgroundColor: nutrientColors[deficiency.nutrient] || "#3498db" }}
      >
        <div className="nutrient-badge">
          {nutrientIcons[deficiency.nutrient] || deficiency.nutrient}
        </div>
        <h3 className="deficiency-nutrient">{deficiency.nutrient} Deficiency</h3>
      </div>

      {/* Image */}
      <div className="deficiency-image-container">
        <img
          src={imgSrc}
          alt={`${deficiency.nutrient} deficiency`}
          className="deficiency-image"
          onError={onImageError}
        />
      </div>

      {/* Description */}
      <div className="deficiency-description">
        <p>{deficiency.description}</p>
      </div>

      {/* Details Section */}
      <div className="deficiency-details">
        {/* Symptoms */}
        <div className="detail-item">
          <h4 className="detail-title">🔴 Symptoms</h4>
          <div className="detail-list">
            {deficiency.symptoms.map((symptom, index) => (
              <span key={index} className="detail-tag symptom-tag">
                {symptom}
              </span>
            ))}
          </div>
        </div>

        {/* Cause (Nutrient) */}
        <div className="detail-item">
          <h4 className="detail-title">🧪 Nutrient</h4>
          <div className="detail-list">
            <span className="detail-tag nutrient-tag">
              {deficiency.cause}
            </span>
          </div>
        </div>

        {/* Location in Plant */}
        <div className="detail-item">
          <h4 className="detail-title">🌿 Location in Plant</h4>
          <div className="detail-list">
            {deficiency.locations.map((location, index) => (
              <span key={index} className="detail-tag location-tag">
                {location}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeficiencyCard;
