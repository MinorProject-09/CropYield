import { useState, useMemo } from "react";
import {
  getCropDeficiencies,
  SYMPTOMS,
  CAUSES,
  LOCATIONS,
  filterDeficiencies,
  BACKGROUND_IMAGES,
} from "../data/nutrientDeficiencies.js";
import CropSelector from "../components/CropSelector.jsx";
import FilterPanel from "../components/FilterPanel.jsx";
import DeficiencyCard from "../components/DeficiencyCard.jsx";
import "./CropNutrient.css";

const CropNutrient = () => {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedCauses, setSelectedCauses] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);

  // Get deficiencies for selected crop
  const cropDeficiencies = useMemo(() => {
    if (!selectedCrop) return [];
    return getCropDeficiencies(selectedCrop);
  }, [selectedCrop]);

  // Get background image for selected crop
  const cropBackgroundImage = useMemo(() => {
    if (!selectedCrop) return null;
    return BACKGROUND_IMAGES[selectedCrop.toLowerCase()] || null;
  }, [selectedCrop]);

  // Filter deficiencies based on selected filters
  const filteredDeficiencies = useMemo(() => {
    const defs = filterDeficiencies(
      cropDeficiencies,
      selectedSymptoms,
      selectedCauses,
      selectedLocations
    );
    // Attach crop key for fallback guessing in card
    return defs.map((def) => ({ ...def, crop: selectedCrop }));
  }, [cropDeficiencies, selectedSymptoms, selectedCauses, selectedLocations, selectedCrop]);

  // Reset filters when crop changes
  const handleCropSelect = (crop) => {
    setSelectedCrop(crop);
    setSelectedSymptoms([]);
    setSelectedCauses([]);
    setSelectedLocations([]);
  };

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleCauseToggle = (cause) => {
    setSelectedCauses((prev) =>
      prev.includes(cause)
        ? prev.filter((c) => c !== cause)
        : [...prev, cause]
    );
  };

  const handleLocationToggle = (location) => {
    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const handleClearAllFilters = () => {
    setSelectedSymptoms([]);
    setSelectedCauses([]);
    setSelectedLocations([]);
  };

  if (!selectedCrop) {
    return <CropSelector onSelectCrop={handleCropSelect} />;
  }

  return (
    <div className="crop-nutrient-container">
      {/* Header with crop name and back button */}
      <div className="nutrient-header">
        <button
          className="back-button"
          onClick={() => setSelectedCrop(null)}
          title="Go back to crop selection"
        >
          ← Back to Crops
        </button>
        <h1 className="nutrient-title">
          🌾 {selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)} -
          Nutrient Deficiencies
        </h1>
        {cropBackgroundImage && (
          <div className="crop-background-image">
            <img
              src={cropBackgroundImage}
              alt={`Healthy ${selectedCrop}`}
              className="background-image"
            />
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="nutrient-content">
        {/* Filter Panel (Left Side) */}
        <FilterPanel
          symptoms={SYMPTOMS}
          causes={CAUSES}
          locations={LOCATIONS}
          selectedSymptoms={selectedSymptoms}
          selectedCauses={selectedCauses}
          selectedLocations={selectedLocations}
          onSymptomToggle={handleSymptomToggle}
          onCauseToggle={handleCauseToggle}
          onLocationToggle={handleLocationToggle}
          onClearFilters={handleClearAllFilters}
        />

        {/* Deficiencies Display (Right Side) */}
        <div className="deficiencies-section">
          <div className="deficiencies-info">
            <p className="results-count">
              Showing {filteredDeficiencies.length} of{" "}
              {cropDeficiencies.length} nutrient deficiencies
            </p>
          </div>

          {filteredDeficiencies.length > 0 ? (
            <div className="deficiencies-grid">
              {filteredDeficiencies.map((deficiency) => (
                <DeficiencyCard
                  key={deficiency.id}
                  deficiency={deficiency}
                />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <p>No nutrient deficiencies match your filters.</p>
              <button
                className="reset-button"
                onClick={handleClearAllFilters}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropNutrient;
