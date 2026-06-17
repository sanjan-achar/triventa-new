import { useState } from 'react';

function QuoteCalculator({ beans, onOpenSampleModal, selectedBeanIds }) {
  const [selectedBeanId, setSelectedBeanId] = useState(beans[0]?.id || '');
  const [unit, setUnit] = useState('bags'); // 'bags' (60kg) or 'fcl' (Full Container Load - 320 bags / 19.2 Tons)
  const [quantity, setQuantity] = useState(20);

  // Lock State & User Details Form
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [userDetails, setUserDetails] = useState({
    name: '',
    company: '',
    email: '',
    country: ''
  });

  // Sync selected bean if prop selectedBeanIds changes (without useEffect)
  const [prevSelectedBeanIds, setPrevSelectedBeanIds] = useState(selectedBeanIds);
  if (selectedBeanIds !== prevSelectedBeanIds) {
    setPrevSelectedBeanIds(selectedBeanIds);
    if (selectedBeanIds && selectedBeanIds.length > 0) {
      setSelectedBeanId(selectedBeanIds[0]);
    }
  }

  // Sync selected bean when beans array changes (e.g. loads dynamically)
  const [prevBeans, setPrevBeans] = useState(beans);
  if (beans !== prevBeans) {
    setPrevBeans(beans);
    if (!selectedBeanId && beans && beans.length > 0) {
      setSelectedBeanId(beans[0].id);
    }
  }

  const selectedBean = beans.find(b => b.id === selectedBeanId) || beans[0];

  // Calculations
  const bagWeightKg = 60;
  const fclBagsCount = 320;

  const totalBags = unit === 'bags' ? quantity : quantity * fclBagsCount;
  const totalWeightKg = totalBags * bagWeightKg;
  const totalWeightTons = (totalWeightKg / 1000).toFixed(2);

  // Simulated base export price per kg (FOB USD)
  const pricePerKg = selectedBean ? selectedBean.basePriceKg : 4.50;
  const totalEstFOB = (totalWeightKg * pricePerKg).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    if (newUnit === 'bags') {
      setQuantity(20); // Default bags
    } else {
      setQuantity(1); // Default FCL
    }
  };

  const handleQtySlider = (e) => {
    setQuantity(parseInt(e.target.value, 10) || 1);
  };

  const handleQtyInput = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setQuantity(val);
    }
  };

  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    if (userDetails.name && userDetails.company && userDetails.email && userDetails.country) {
      setIsUnlocked(true);
    } else {
      alert('Please fill out all fields to unlock the calculator.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="calculator-widget">
      {!isUnlocked ? (
        <>
          <div className="calc-left">
            <h3 className="calc-title">Unlock FOB Export Calculator</h3>
            <p className="calc-subtitle">Please enter your business details to unlock real-time volume estimates and pricing projections.</p>

            <form onSubmit={handleUnlockSubmit} className="calc-unlock-form">
              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label required">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={userDetails.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label required">Roastery / Company</label>
                  <input
                    type="text"
                    name="company"
                    className="form-input"
                    placeholder="e.g. Artisan Roasters"
                    value={userDetails.company}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label required">Business Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="e.g. contact@roastery.com"
                    value={userDetails.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group flex-1">
                  <label className="form-label required">Destination Country</label>
                  <input
                    type="text"
                    name="country"
                    className="form-input"
                    placeholder="e.g. United Kingdom"
                    value={userDetails.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="calc-cta-btn unlock-btn">
                Unlock FOB Calculator
                <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </form>
          </div>

          <div className="calc-right teaser-panel">
            <div className="teaser-content">
              <div className="teaser-badge">🌿 100% Green Specialty Coffee</div>
              <h4 className="teaser-title">Why secure pricing estimates?</h4>
              <ul className="teaser-list">
                <li>Direct sourcing logs from the Coffee Boards.</li>
                <li>Simulate shipment configurations in 60kg jute bags or full FCL containers.</li>
                <li>Analyze estimated FOB port rates and local warehouse logistics.</li>
              </ul>
              <p className="teaser-note">**Triventa Exports deals exclusively with green coffee beans for wholesale roasters.</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="calc-left">
            <h3 className="calc-title">Volume &amp; FOB Calculator</h3>
            <p className="calc-subtitle">Estimate shipping parameters and pricing for direct-trade green bean shipments.</p>

            <div className="form-group">
              <label className="form-label">Select Coffee Grade</label>
              <select
                className="form-select"
                value={selectedBeanId}
                onChange={(e) => setSelectedBeanId(e.target.value)}
                disabled={beans.length === 0}
              >
                {beans.length > 0 ? (
                  beans.map((bean) => (
                    <option key={bean.id} value={bean.id}>
                      {bean.origin} — {bean.name} (Q-Score: {bean.score})
                    </option>
                  ))
                ) : (
                  <option value="">No grades loaded. Please contact trade desk.</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Shipping Shipment Unit</label>
              <div className="unit-buttons">
                <button
                  type="button"
                  className={`unit-btn ${unit === 'bags' ? 'active' : ''}`}
                  onClick={() => handleUnitChange('bags')}
                >
                  Export Bags (60kg)
                </button>
                <button
                  type="button"
                  className={`unit-btn ${unit === 'fcl' ? 'active' : ''}`}
                  onClick={() => handleUnitChange('fcl')}
                >
                  Full Container (20ft FCL)
                </button>
              </div>
            </div>

            <div className="form-group">
              <div className="qty-header">
                <label className="form-label">Quantity</label>
                <div className="qty-input-wrapper">
                  <input
                    type="number"
                    className="qty-number-input"
                    value={quantity}
                    onChange={handleQtyInput}
                    min="1"
                    max={unit === 'bags' ? 1000 : 20}
                  />
                  <span className="qty-unit-tag">{unit === 'bags' ? 'Bags' : 'FCL Containers'}</span>
                </div>
              </div>

              <input
                type="range"
                className="qty-slider"
                min="1"
                max={unit === 'bags' ? 300 : 10}
                value={quantity}
                onChange={handleQtySlider}
              />
              <div className="slider-labels">
                <span>Min (1)</span>
                <span>Max ({unit === 'bags' ? '300' : '10'})</span>
              </div>
            </div>
          </div>

          <div className="calc-right">
            <div className="results-panel">
              <h3 className="calc-title">Estimated Cargo Metrics</h3>
              <p className="calc-subtitle">Export volume, pricing projections, and shipping parameters.</p>

              <div className="metric-row">
                <div className="metric-label">Total Volume</div>
                <div className="metric-val">{totalBags} bags (60kg each)</div>
              </div>

              <div className="metric-row">
                <div className="metric-label">Net Cargo Weight</div>
                <div className="metric-val">
                  {totalWeightKg.toLocaleString()} kg <span className="metric-sub">({totalWeightTons} MT)</span>
                </div>
              </div>

              <div className="metric-row price-row">
                <div className="metric-label">Est. FOB Price (USD)</div>
                <div className="metric-val price-highlight">
                  ${totalEstFOB}<sup>*</sup>
                  <span className="metric-sub-label">at ${pricePerKg.toFixed(2)}/kg base FOB</span>
                </div>
              </div>

              <div className="metric-row">
                <div className="metric-label">Shipping Window</div>
                <div className="metric-val">
                  {unit === 'fcl' ? '4 - 6 Weeks' : '2 - 3 Weeks'}
                  <span className="metric-sub">Port of Export</span>
                </div>
              </div>

              <div className="calc-disclaimer-warning">
                ⚠️ IMPORTANT MARKET NOTICE: The price displayed is a simulated FOB estimate. This is NOT a final binding price. Sourcing rates are determined directly by daily local coffee board auctions in Chikkamagaluru and are subject to immediate changes, currency rates, and market differentials.
              </div>

              <button
                type="button"
                className="calc-cta-btn"
                onClick={() => onOpenSampleModal(selectedBeanId, totalBags)}
              >
                Inquire &amp; Request Sample
                <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default QuoteCalculator;
