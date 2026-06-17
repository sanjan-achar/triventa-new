import React from 'react';

function BeanCard({ bean, isSelected, onToggleSelect }) {
  const {
    id,
    name,
    origin,
    altitude,
    process,
    type,
    score,
    notes,
    variety,
    harvest,
    description,
    gradeCode,
    sieve,
    refersText,
    availability
  } = bean;

  return (
    <div className={`bean-card ${isSelected ? 'selected' : ''}`}>
      {/* Header with Location and Q-score */}
      <div className="bean-card-header">
        <span className="bean-origin">
          • {origin}
        </span>
        <div className="q-score-box">
          Q-Score: {score}
        </div>
      </div>

      {/* Title block */}
      <div className="bean-name-container">
        <h3 className="bean-name">{name}</h3>
      </div>

      {/* Grade badge and variety/availability row */}
      <div className="bean-meta-row">
        {gradeCode && <span className="grade-badge-boxed">{gradeCode}</span>}
        {availability && (
          <span className="availability-tag">{availability}</span>
        )}
      </div>

      {/* Combined Description Paragraph (Refers + Profile) */}
      <p className="bean-description-paragraph">
        {refersText ? `${refersText} ${description}` : description}
      </p>

      {/* Specs List */}
      <div className="bean-specs">
        <div className="spec-item">
          <span className="spec-label">Process</span>
          <span className="spec-val">{process}</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">Type</span>
          <span className="spec-val">{type}</span>
        </div>
        {sieve && (
          <div className="spec-item">
            <span className="spec-label">Sieve Metric</span>
            <span className="spec-val">{sieve}</span>
          </div>
        )}
        <div className="spec-item">
          <span className="spec-label">Altitude</span>
          <span className="spec-val">{altitude}</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">Harvest</span>
          <span className="spec-val">{harvest}</span>
        </div>
      </div>

      {/* Button block */}
      <div className="bean-card-actions">
        <button
          type="button"
          className={`sample-select-btn ${isSelected ? 'selected' : ''}`}
          onClick={() => onToggleSelect(id)}
          aria-label={isSelected ? `Remove ${name} from sample list` : `Add ${name} to sample list`}
        >
          {isSelected ? (
            <>
              <svg className="btn-icon check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Requested Sample
            </>
          ) : (
            <>
              Request Sample
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default BeanCard;
