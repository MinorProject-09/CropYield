import "./FilterPanel.css";

const FilterPanel = ({
  symptoms,
  causes,
  locations,
  selectedSymptoms,
  selectedCauses,
  selectedLocations,
  onSymptomToggle,
  onCauseToggle,
  onLocationToggle,
  onClearFilters,
}) => {
  const hasActiveFilters =
    selectedSymptoms.length > 0 ||
    selectedCauses.length > 0 ||
    selectedLocations.length > 0;

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h2 className="filter-title">🔍 Filter Deficiencies</h2>
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={onClearFilters}>
            Clear All
          </button>
        )}
      </div>

      <div className="filter-columns">
        {/* Symptoms Column */}
        <div className="filter-column">
          <div className="filter-column-header">
            <h3 className="filter-column-title">🔴 Symptoms</h3>
            <span className="filter-count">{selectedSymptoms.length}</span>
          </div>
          <div className="filter-list">
            {symptoms.map((symptom) => (
              <label key={symptom} className="filter-item">
                <input
                  type="checkbox"
                  checked={selectedSymptoms.includes(symptom)}
                  onChange={() => onSymptomToggle(symptom)}
                  className="filter-checkbox"
                />
                <span className="filter-label">{symptom}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Causes Column */}
        <div className="filter-column">
          <div className="filter-column-header">
            <h3 className="filter-column-title">🧪 Cause</h3>
            <span className="filter-count">{selectedCauses.length}</span>
          </div>
          <div className="filter-list">
            {causes.map((cause) => (
              <label key={cause} className="filter-item">
                <input
                  type="checkbox"
                  checked={selectedCauses.includes(cause)}
                  onChange={() => onCauseToggle(cause)}
                  className="filter-checkbox"
                />
                <span className="filter-label">{cause}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location in Plant Column */}
        <div className="filter-column">
          <div className="filter-column-header">
            <h3 className="filter-column-title">🌿 Location in Plant</h3>
            <span className="filter-count">{selectedLocations.length}</span>
          </div>
          <div className="filter-list">
            {locations.map((location) => (
              <label key={location} className="filter-item">
                <input
                  type="checkbox"
                  checked={selectedLocations.includes(location)}
                  onChange={() => onLocationToggle(location)}
                  className="filter-checkbox"
                />
                <span className="filter-label">{location}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
