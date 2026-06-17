import { useState, useEffect } from 'react';
import './App.css';
import coffeeHeroImg from './assets/coffee_hero.png';
import BeanCard from './components/BeanCard';
import QuoteCalculator from './components/QuoteCalculator';
import SampleModal from './components/SampleModal';

// Published Google Sheets CSV export URL (Option 2)
// To connect your Google Sheet:
// 1. In Google Sheets, go to File > Share > Publish to web.
// 2. Select your coffee sheet tab and select "Comma-separated values (.csv)" format.
// 3. Publish and paste the generated URL between the quotes below.
// 4. Leaving this empty or invalid will automatically fall back to the local '/data/beans.json' data.
const GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2OjUzEC43muLEQ_y0QKsftuFGRcjhef2S4N4WSwUjB8_u01HoTRlyqRWPoL0-X_00WMSowisfOSIW/pub?output=csv";

// Helper to parse CSV text, handling quotes, double-quotes and commas correctly
function parseCSV(csvText) {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];
    const next = csvText[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push("");
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  return lines;
}

// Convert CSV rows to structured bean objects
function csvToBeans(csvText) {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const beans = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || (row.length === 1 && row[0] === "")) continue;

    const bean = {};
    headers.forEach((header, index) => {
      let val = row[index]?.trim() || "";
      const isNumeric = ['score', 'basepricekg', 'price', 'fob price', 'price/kg'].includes(header);

      if (isNumeric) {
        const cleanVal = val.replace(/[$,]/g, '').trim();
        const parsed = parseFloat(cleanVal);
        const finalVal = isNaN(parsed) ? 0 : parsed;
        const targetKey = (header === 'score') ? 'score' : 'basePriceKg';
        bean[targetKey] = finalVal;
      } else if (header === 'notes') {
        bean[header] = val ? val.split(',').map(n => n.trim()) : [];
      } else {
        const keyMap = {
          'id': 'id',
          'name': 'name',
          'origin': 'origin',
          'altitude': 'altitude',
          'process': 'process',
          'type': 'type',
          'score': 'score',
          'notes': 'notes',
          'variety': 'variety',
          'harvest': 'harvest',
          'basepricekg': 'basePriceKg',
          'price': 'basePriceKg',
          'fob price': 'basePriceKg',
          'price/kg': 'basePriceKg',
          'gradecode': 'gradeCode',
          'grade': 'gradeCode',
          'sieve': 'sieve',
          'referstext': 'refersText',
          'description': 'description',
          'availability': 'availability'
        };
        const mappedKey = keyMap[header] || header;
        bean[mappedKey] = val;
      }
    });

    if (bean.id && bean.name) {
      beans.push(bean);
    }
  }
  return beans;
}

// Automatically convert Google Sheets sharing/published webpage links to direct CSV exports
function getCSVUrl(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url.trim());
    const gid = parsed.searchParams.get("gid");

    // Normalize pathname by removing trailing slash if present
    let path = parsed.pathname;
    if (path.endsWith("/")) {
      path = path.slice(0, -1);
    }

    // Check for published spreadsheet webpage formats (contains /pubhtml)
    if (path.endsWith("/pubhtml")) {
      parsed.pathname = path.slice(0, -8) + "/pub";
      parsed.searchParams.set("output", "csv");
      if (gid) {
        parsed.searchParams.set("gid", gid);
      }
      return parsed.toString();
    }

    // Check if it is a published document without pubhtml (ends with /pub)
    if (path.endsWith("/pub")) {
      parsed.searchParams.set("output", "csv");
      if (gid) {
        parsed.searchParams.set("gid", gid);
      }
      return parsed.toString();
    }

    // Check for editing or direct sheet view link formats (contains /edit)
    if (path.includes("/edit")) {
      let finalGid = gid;
      if (!finalGid && parsed.hash) {
        const hashMatch = parsed.hash.match(/gid=(\d+)/);
        if (hashMatch) {
          finalGid = hashMatch[1];
        }
      }

      const editIndex = path.indexOf("/edit");
      parsed.pathname = path.substring(0, editIndex) + "/export";
      parsed.searchParams.set("format", "csv");
      if (finalGid) {
        parsed.searchParams.set("gid", finalGid);
      }
      parsed.hash = ""; // Clear hash to clean up the URL
      return parsed.toString();
    }

    // If it's a generic spreadsheet link ending in /preview
    if (path.endsWith("/preview")) {
      parsed.pathname = path.slice(0, -8) + "/export";
      parsed.searchParams.set("format", "csv");
      if (gid) {
        parsed.searchParams.set("gid", gid);
      }
      return parsed.toString();
    }

    // If it is a generic Google Sheets URL but pathname doesn't end with above
    if (parsed.hostname === "docs.google.com" && parsed.pathname.includes("/spreadsheets/")) {
      if (parsed.pathname.includes("/pub")) {
        parsed.searchParams.set("output", "csv");
      } else {
        parsed.searchParams.set("format", "csv");
      }
      return parsed.toString();
    }

    return url.trim();
  } catch (e) {
    console.error("Error parsing spreadsheet URL with URL API, falling back to regex/string match:", e);
    const trimmed = url.trim();
    if (trimmed.includes("/pubhtml")) {
      const urlPart = trimmed.split("/pubhtml")[0] + "/pub?output=csv";
      const match = trimmed.match(/[?&]gid=(\d+)/);
      return match ? `${urlPart}&gid=${match[1]}` : urlPart;
    }
    if (trimmed.includes("/edit")) {
      const urlPart = trimmed.split("/edit")[0] + "/export?format=csv";
      const match = trimmed.match(/[?&#]gid=(\d+)/);
      return match ? `${urlPart}&gid=${match[1]}` : urlPart;
    }
    return trimmed;
  }
}

function App() {
  const [beans, setBeans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBeanIds, setSelectedBeanIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialBeanId, setModalInitialBeanId] = useState('');
  const [modalInitialQty, setModalInitialQty] = useState(0);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [sortBy, setSortBy] = useState('score-desc');

  // Timeline active step
  const [activeStep, setActiveStep] = useState(0);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Light/Dark Theme state (Defaults to Light Mode)
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (!GOOGLE_SHEETS_CSV_URL) {
      setError("No dynamic catalog Google Sheet URL is configured.");
      setIsLoading(false);
      return;
    }

    const targetUrl = getCSVUrl(GOOGLE_SHEETS_CSV_URL);
    const cacheBuster = targetUrl.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;
    fetch(targetUrl + cacheBuster, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Fetch failed: ${res.statusText}`);
        return res.text();
      })
      .then(text => {
        const parsedData = csvToBeans(text);
        if (parsedData.length === 0) {
          throw new Error("The coffee catalog data parsed is empty.");
        }

        // Deduplicate rows by ID to prevent repeating items in the catalog
        const uniqueBeans = [];
        const seenIds = new Set();
        parsedData.forEach(bean => {
          if (bean.id && !seenIds.has(bean.id)) {
            seenIds.add(bean.id);
            uniqueBeans.push(bean);
          }
        });

        setBeans(uniqueBeans);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error loading coffee beans catalog from Google Sheets:", err);
        setError("We are currently experiencing connection issues loading our live green coffee catalog.");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  const handleToggleSelectBean = (beanId) => {
    setSelectedBeanIds(prev =>
      prev.includes(beanId)
        ? prev.filter(id => id !== beanId)
        : [...prev, beanId]
    );
  };

  const handleOpenSampleModal = (initialBeanId = '', qty = 0) => {
    setModalInitialBeanId(initialBeanId);
    setModalInitialQty(qty);
    setIsModalOpen(true);
  };

  const handleClearSelection = () => {
    setSelectedBeanIds([]);
  };

  // Filter & Sort Logic
  const filteredBeans = beans.filter(bean => {
    const matchesSearch =
      bean.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bean.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bean.notes.some(note => note.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bean.gradeCode && bean.gradeCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      selectedType === 'All' ||
      (selectedType === 'Robusta' && (bean.name.toLowerCase().includes('robusta') || bean.process.toLowerCase().includes('robusta') || bean.type.toLowerCase().includes('robusta'))) ||
      (selectedType === 'Arabica' && (bean.name.toLowerCase().includes('arabica') || bean.process.toLowerCase().includes('arabica') || bean.type.toLowerCase().includes('arabica'))) ||
      (selectedType === 'Speciality Blends' && (bean.name.toLowerCase().includes('blend') || bean.process.toLowerCase().includes('blend') || bean.type.toLowerCase().includes('blend') || bean.type.toLowerCase().includes('speciality') || bean.type.toLowerCase().includes('specialty')));

    return matchesSearch && matchesType;
  }).sort((a, b) => {
    if (sortBy === 'score-desc') return b.score - a.score;
    if (sortBy === 'price-asc') return a.basePriceKg - b.basePriceKg;
    if (sortBy === 'price-desc') return b.basePriceKg - a.basePriceKg;
    return 0;
  });

  const timelineSteps = [
    {
      title: "Local Coffee Board Sourcing",
      subtitle: "Phase 1: Auction & Board Sourcing",
      desc: "We secure our high-grade green coffee lots directly through the local coffee boards in Chikkamagaluru, validating authentic plantation origins and supporting transparent pricing structures for growers."
    },
    {
      title: "Grading & Density Selection",
      subtitle: "Phase 2: Screen Sizes & Sorting",
      desc: "Unroasted green coffee is sorted by screen sizes (Screens 15 to 19+) and density-separated to achieve clean, high-grade allocations (Plantation AA, Parchment AB, Mysore Nuggets, Kaapi Royale)."
    },
    {
      title: "Moisture & Quality Inspection",
      subtitle: "Phase 3: Moisture Monitoring",
      desc: "Raw green beans are strictly tested to maintain a stable 10-12% moisture level, preventing mold, preserving organic acids, and securing stable flavor profiles during transport."
    },
    {
      title: "Climate-Preserved Export",
      subtitle: "Phase 4: Global Shipping from Mangalore Port",
      desc: "Green coffee is packed in protective GrainPro barrier liners to prevent humidity damage, loaded into containers, and exported globally via the Port of Mangalore."
    }
  ];

  return (
    <>
      {/* Header & Navigation */}
      <header className="site-header">
        <div className="header-container">
          <div className="logo-container">
            <span
              className="logo-image"
              aria-label="Triventa Exports Logo"
              role="img"
            />
            <span className="logo-text">TRIVENTA EXPORTS</span>
          </div>
          <nav className="site-nav">
            <a href="#origins">Green Varieties</a>
            <a href="#guide">Grades Guide</a>
            <a href="#process">Sourcing Journey</a>
            <a href="#calculator">FOB Calculator</a>
          </nav>
          <div className="header-actions">
            {/* Theme Switcher Button */}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label="Toggle light and dark themes"
            >
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button
              type="button"
              className="nav-cta-btn"
              onClick={() => handleOpenSampleModal()}
            >
              Request Samples
            </button>
            <button
              type="button"
              className={`mobile-menu-toggle ${isMobileMenuOpen ? 'open' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav-links">
          <a href="#origins" onClick={() => setIsMobileMenuOpen(false)}>Green Varieties</a>
          <a href="#guide" onClick={() => setIsMobileMenuOpen(false)}>Grades Guide</a>
          <a href="#process" onClick={() => setIsMobileMenuOpen(false)}>Sourcing Journey</a>
          <a href="#calculator" onClick={() => setIsMobileMenuOpen(false)}>FOB Calculator</a>

          <button
            type="button"
            className="mobile-theme-toggle-btn"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            Switch to {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          <button
            type="button"
            className="mobile-cta-btn"
            onClick={() => {
              setIsMobileMenuOpen(false);
              handleOpenSampleModal();
            }}
          >
            Request Samples
          </button>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content animate-fade-in">
            <span className="hero-badge">Specialty Green Coffee Exporter</span>
            <h1 className="hero-title">
              Coffee Exporters from KARNATAKA.
            </h1>
            <p className="hero-description">
              Triventa Exports supplies unroasted green coffee beans sourced through the local coffee boards in Karnataka, India. We deal exclusively in raw green Arabica and Robusta grades for global roasters.
            </p>
            <div className="hero-actions-container">
              <a href="#origins" className="primary-btn">
                Explore Green Grades
              </a>
              <a href="#calculator" className="secondary-btn">
                FOB Price Calculator
              </a>
            </div>
            <div className="hero-stats">
            </div>
          </div>
          <div className="hero-media animate-fade-in">
            <div className="media-wrapper">
              <img
                src={coffeeHeroImg}
                className="hero-image-main"
                alt="Premium raw green coffee beans and specialty unroasted coffee beans arranged minimally on a ceramic plate"
              />
              <div className="media-overlay-tag">
                <span className="crop-status">● GREEN COFFEE ONLY</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Pillars / Trust Indicators */}
      <section className="pillars-section">
        <div className="pillars-container">
          <div className="section-header text-center">
            <h2 className="section-title">Specialized Green Coffee Exports</h2>
            <p className="section-subtitle">We secure raw green coffee through local coffee boards and ship container loads directly to international roasteries.</p>
          </div>
          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon">🏛️</div>
              <h3 className="pillar-title">Coffee Board Sourced</h3>
              <p className="pillar-description">
                Our coffee lots are purchased directly from local coffee boards in Karnataka, guaranteeing authenticity, legal grading, and absolute lot traceability.
              </p>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon">🌱</div>
              <h3 className="pillar-title">100% Unroasted Green</h3>
              <p className="pillar-description">
                We specialize strictly in raw green beans. By maintaining control over milling, moisture (10-12%), and bagging, we protect flavor potentials.
              </p>
            </div>
            <div className="pillar-card">
              <div className="pillar-icon">🚢</div>
              <h3 className="pillar-title">Direct Mangalore Shipping</h3>
              <p className="pillar-description">
                Our offices manage bagging in GrainPro liners, customs clearance at the Port of Mangalore, and freight delivery globally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Origins Showcase */}
      <section id="origins" className="showcase-section">
        <div className="showcase-container">
          <div className="section-header">
            <h2 className="section-title">Wholesale Green Coffee Catalog</h2>
            <p className="section-subtitle">Browse raw green coffee grades sourced directly from local auctions in Chikkamagaluru.</p>
          </div>

          {/* Filter Controls */}
          <div className="filter-controls">
            <div className="search-box">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search by variety, grade code, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filters-group">
              <div className="filter-dropdown-wrapper">
                <span className="dropdown-label">Type:</span>
                <select
                  className="filter-select"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="Robusta">Robusta</option>
                  <option value="Arabica">Arabica</option>
                  <option value="Speciality Blends">Speciality Blends</option>
                </select>
              </div>

              <div className="filter-dropdown-wrapper">
                <span className="dropdown-label">Sort:</span>
                <select
                  className="filter-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="score-desc">Highest Rating</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Beans Grid */}
          <div className="beans-grid">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bean-card skeleton">
                  <div className="skeleton-header">
                    <div className="skeleton-line short animate-pulse"></div>
                    <div className="skeleton-line pill animate-pulse"></div>
                  </div>
                  <div className="skeleton-title animate-pulse"></div>
                  <div className="skeleton-meta animate-pulse"></div>
                  <div className="skeleton-paragraph animate-pulse"></div>
                  <div className="skeleton-specs">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div key={idx} className="skeleton-spec-item animate-pulse"></div>
                    ))}
                  </div>
                  <div className="skeleton-button animate-pulse"></div>
                </div>
              ))
            ) : error ? (
              <div className="catalog-error-panel">
                <div className="error-icon-wrapper">⚠️</div>
                <h3 className="error-title">Offer Sheet Unavailable</h3>
                <p className="error-desc">
                  {error}
                </p>
                <p className="error-contact-prompt">
                  Please reach out directly to our trade desk via WhatsApp or Email to request the latest pricing and sample availability:
                </p>
                <div className="error-contact-buttons">
                  <a
                    href="https://wa.me/919148025018"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="error-btn whatsapp-link"
                  >
                    <svg className="error-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                    Chat on WhatsApp
                  </a>
                  <a
                    href="mailto:info@triventaexports.com"
                    className="error-btn email-link"
                  >
                    <svg className="error-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Email Trade Desk
                  </a>
                </div>
              </div>
            ) : filteredBeans.length > 0 ? (
              filteredBeans.map(bean => (
                <BeanCard
                  key={bean.id}
                  bean={bean}
                  isSelected={selectedBeanIds.includes(bean.id)}
                  onToggleSelect={handleToggleSelectBean}
                />
              ))
            ) : (
              <div className="empty-state">
                <p>No green coffee varieties match your selection. Try adjusting filters or search terms.</p>
                <button
                  type="button"
                  className="reset-filters-btn"
                  onClick={() => { setSearchTerm(''); setSelectedType('All'); }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Selected Bean Floating Action Bar */}
        {selectedBeanIds.length > 0 && (
          <div className="selection-action-bar animate-fade-in">
            <div className="bar-details">
              <span className="bar-count">Grades selected</span>
              <span className="bar-names">
                ({beans.filter(b => selectedBeanIds.includes(b.id)).map(b => b.name).join(', ')})
              </span>
            </div>
            <div className="bar-buttons">
              <button type="button" className="bar-clear-btn" onClick={handleClearSelection}>
                Clear
              </button>
              <button
                type="button"
                className="bar-submit-btn"
                onClick={() => handleOpenSampleModal(selectedBeanIds[0])}
              >
                Request Free Green Samples
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Guide Section */}
      <section id="guide" className="guide-section">
        <div className="guide-container">
          <div className="section-header text-center">
            <h2 className="section-title">Indian Green Coffee Grades &amp; Sieve Matrix</h2>
            <p className="section-subtitle">Understanding the official types, screen sizes, and grades under Indian export standards.</p>
          </div>

          <div className="guide-grid">
            <div className="guide-card">
              <h3 className="guide-card-title">1. Primary Green Coffee Types</h3>
              <div className="guide-types-list">
                <div className="guide-type-item">
                  <span className="type-title">Plantation Coffee (Washed Arabica)</span>
                  <p className="type-desc">Raw cherries are pulped, fermented, and washed. Yields clean, uniform, bluish-green beans with a clean cup profile.</p>
                </div>
                <div className="guide-type-item">
                  <span className="type-title">Parchment Coffee (Washed Robusta)</span>
                  <p className="type-desc">India is world-renowned for high-quality washed Robustas, delivering a clean, non-rubbery, high-caffeine crema base.</p>
                </div>
                <div className="guide-type-item">
                  <span className="type-title">Cherry Coffee (Natural / Sun-Dried)</span>
                  <p className="type-desc">The whole coffee cherry dries intact in the sun. Raw beans are duller and yellowish-green, yielding a sweet, fruit-forward profile.</p>
                </div>
              </div>
            </div>

            <div className="guide-card">
              <h3 className="guide-card-title">2. Sizing Sieve Standards</h3>
              <div className="guide-table-wrapper">
                <table className="guide-table">
                  <thead>
                    <tr>
                      <th>Grade Name</th>
                      <th>Sieve / Screen Metric</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>AAA</strong> (MNEB)</td>
                      <td>Screen 19+ (7.50 mm)</td>
                      <td>The largest beans available. Perfect uniformity, zero defects.</td>
                    </tr>
                    <tr>
                      <td><strong>AA</strong> (Plantation)</td>
                      <td>Screen 18 (7.14 mm)</td>
                      <td>Standard premium export grade. Exceptionally bold and uniform.</td>
                    </tr>
                    <tr>
                      <td><strong>A</strong> (Cherry/Parchment)</td>
                      <td>Screen 17 (6.75 mm)</td>
                      <td>Most common, recognized export grade. Balance and versatility.</td>
                    </tr>
                    <tr>
                      <td><strong>AB</strong> (Parchment/Cherry)</td>
                      <td>Screens 15 and 16</td>
                      <td>Consistent mixed blend size. Solid extraction uniformity.</td>
                    </tr>
                    <tr>
                      <td><strong>PB</strong> (Peaberry)</td>
                      <td>Peaberry Sieve</td>
                      <td>Single round bean mutations. Rolled evenly in roasters.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sourcing & Export Process */}
      <section id="process" className="process-section">
        <div className="process-inner">
          <div className="section-header text-center">
            <h2 className="section-title">The Green Sourcing Journey</h2>
            <p className="section-subtitle">Traceable and verified steps from Coffee Boards to international ports.</p>
          </div>

          <div className="process-container">
            <div className="process-nav">
              {timelineSteps.map((step, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`process-nav-item ${activeStep === idx ? 'active' : ''}`}
                  onClick={() => setActiveStep(idx)}
                >
                  <span className="step-num">0{idx + 1}</span>
                  <span className="step-title">{step.title}</span>
                </button>
              ))}
            </div>

            <div className="process-content-card">
              <span className="card-phase-label">{timelineSteps[activeStep].subtitle}</span>
              <h3 className="card-step-title">{timelineSteps[activeStep].title}</h3>
              <p className="card-step-desc">{timelineSteps[activeStep].desc}</p>

              <div className="card-navigation-btns">
                <button
                  type="button"
                  className="step-arrow-btn"
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep(p => Math.max(0, p - 1))}
                  aria-label="Previous step"
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  className="step-arrow-btn"
                  disabled={activeStep === timelineSteps.length - 1}
                  onClick={() => setActiveStep(p => Math.min(timelineSteps.length - 1, p + 1))}
                  aria-label="Next step"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping and Quote Calculator Section */}
      <section id="calculator" className="calculator-section">
        <div className="calculator-container">
          <div className="section-header text-center">
            <h2 className="section-title">Custom Export Calculator</h2>
            <p className="section-subtitle">Simulate shipping weight, bag allocations, and FOB values instantly.</p>
          </div>

          <QuoteCalculator
            beans={beans}
            onOpenSampleModal={handleOpenSampleModal}
            selectedBeanIds={selectedBeanIds}
          />
        </div>
      </section>

      {/* Newsletter / Contact Section */}
      <section id="about" className="contact-banner">
        <div className="contact-banner-container">
          <div className="banner-content text-center">
            <div className="section-header text-center">
              <h2 className="section-title">Receive Harvest Alerts &amp; Offer Lists</h2>
              <p className="section-subtitle">Subscribe to receive green coffee micro-lot allocations, pre-harvest cupping sheets, and shipping schedules.</p>
            </div>
            <div className="subscribe-form">
              <input type="email" className="sub-input" placeholder="Enter business email address" required />
              <button type="button" className="sub-btn" onClick={() => alert('Thank you for subscribing to Triventa Exports harvest list.')}>
                Join Offer List
              </button>
            </div>
            <div className="contact-quick">
              <span>Corporate Address: <strong>Mangalore, Dakshina Kannada, Karnataka, India</strong></span>
              <span className="divider-dot">•</span>
              <span>Tel: <a href="tel:+919148025018"><strong>+91 91480 25018</strong></a></span>
              <span className="divider-dot">•</span>
              <span>Email: <a href="mailto:info@triventaexports.com"><strong>info@triventaexports.com</strong></a></span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-cols">
            <div className="footer-brand-col">
              <div className="footer-logo-container">
                <span
                  className="footer-logo-image"
                  aria-label="Triventa Exports Logo"
                  role="img"
                />
                <span className="footer-logo-text">TRIVENTA EXPORTS</span>
              </div>
              <p className="footer-tagline">
                Premium exporter of unroasted specialty green Arabica and Robusta coffee beans, sourced directly through local coffee boards in Karnataka.
              </p>
              <span className="copyright">© 2026 Triventa Exports Private Limited. All rights reserved.</span>
            </div>
            <div className="footer-links-col">
              <h4 className="footer-title">Green Coffee Grades</h4>
              <a href="#origins">Arabica Plantation AA (PL AA)</a>
              <a href="#origins">Robusta Parchment AB (RP AB)</a>
              <a href="#origins">Arabica Cherry A (AC A)</a>
              <a href="#origins">Mysore Nuggets Extra Bold (PL AAA)</a>
              <a href="#origins">Robusta Kaapi Royale (RKR)</a>
            </div>
            <div className="footer-links-col">
              <h4 className="footer-title">Logistics &amp; Sourcing</h4>
              <a href="#calculator">FOB Calculator</a>
              <a href="#process">Sourcing Journey</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}>Request Samples</a>
            </div>
            <div className="footer-links-col">
              <h4 className="footer-title">Trade Desk</h4>
              <p>Email: <a href="mailto:info@triventaexports.com" className="footer-contact-link">info@triventaexports.com</a></p>
              <p>Phone: <a href="tel:+919148025018" className="footer-contact-link">+91 91480 25018</a></p>
              <p>Mangalore, Karnataka, India</p>
              <div className="business-ids">
                <p><strong>GSTIN:</strong> 29AAMCT6839P1Z5</p>
                <p><strong>CIN:</strong> U46209KA2026PTC214010</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Booking Modal */}
      {isModalOpen && (
        <SampleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          beans={beans}
          initialSelectedBeanId={modalInitialBeanId}
          initialQuantity={modalInitialQty}
        />
      )}
    </>
  );
}

export default App;
