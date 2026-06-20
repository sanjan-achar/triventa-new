import { useState, useEffect } from 'react';

function SampleModal({ isOpen, onClose, beans, initialSelectedBeanId, initialQuantity }) {
  const [formData, setFormData] = useState({
    name: '',
    roastery: '',
    email: '',
    country: '',
    volume: '5-20',
    message: ''
  });

  const [selectedBeanIds, setSelectedBeanIds] = useState(
    initialSelectedBeanId ? [initialSelectedBeanId] : []
  );
  const [submissionStep, setSubmissionStep] = useState(0); // 0: input, 1: submitting, 2: success
  const [submitMessage, setSubmitMessage] = useState('Initiating request...');
  const [trackingRef, setTrackingRef] = useState('');

  const createTrackingRef = () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
    return `TES-${yy}${mm}${seq}`;
  };

  useEffect(() => {
    if (isOpen) {
      setTrackingRef(createTrackingRef());
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const handleCheckboxChange = (beanId) => {
    setSelectedBeanIds(prev => 
      prev.includes(beanId)
        ? prev.filter(id => id !== beanId)
        : [...prev, beanId]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.roastery || !formData.email || !formData.country) {
      alert('Please fill out all required fields.');
      return;
    }
    if (selectedBeanIds.length === 0) {
      alert('Please select at least one coffee origin for your sample request.');
      return;
    }

    const form = e.target;
    try {
      await fetch('/', {
        method: 'POST',
        body: new FormData(form),
      });
    } catch (err) {
      console.error('Sample request submission failed:', err);
    }

    setSubmissionStep(1);
    
    const steps = [
      { msg: 'Connecting to origin supply database...', time: 800 },
      { msg: 'Verifying micro-lot warehouse availability...', time: 1600 },
      { msg: 'Generating logistics shipping projection...', time: 2400 },
      { msg: 'Finalizing sample reservation...', time: 3200 }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setSubmitMessage(step.msg);
      }, step.time);
    });

    setTimeout(() => {
      setSubmissionStep(2);
    }, 4000);
  };

  const selectedBeansList = beans.filter(b => selectedBeanIds.includes(b.id));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {submissionStep === 0 && (
          <form
          name="request-sample"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          onSubmit={handleSubmit}
          className="modal-form"
        >
          <input type="hidden" name="form-name" value="request-sample" />
          <input type="hidden" name="bot-field" />
          <input type="hidden" name="tracking-ref" value={trackingRef} />
          <div className="modal-header">
              <h3 className="modal-title">Request Specialty Green Samples</h3>
              <p className="modal-subtitle">
                Select your desired micro-lots and enter your roastery details. We ship 300g cupping samples globally.
              </p>
            </div>

            <div className="modal-grid">
              <div className="modal-col">
                <h4 className="form-section-title">1. Selected Micro-Lots</h4>
                <div className="modal-beans-selection">
                  {beans.map((bean) => (
                    <label key={bean.id} className={`modal-bean-option ${selectedBeanIds.includes(bean.id) ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        name="selected-beans"
                        value={`${bean.origin} — ${bean.name}`}
                        checked={selectedBeanIds.includes(bean.id)}
                        onChange={() => handleCheckboxChange(bean.id)}
                        className="modal-bean-checkbox"
                      />
                      <div className="modal-bean-info">
                        <span className="modal-bean-origin">{bean.origin}</span>
                          <span className="modal-bean-name">{bean.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-col">
                <h4 className="form-section-title">2. Roastery Information</h4>
                
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label className="form-label required">Contact Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label required">Roastery / Company</label>
                    <input
                      type="text"
                      name="roastery"
                      className="form-input"
                      placeholder="e.g. Equator Roast Labs"
                      value={formData.roastery}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">Business Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="e.g. roasting@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label className="form-label required">Destination Country</label>
                    <input
                      type="text"
                      name="country"
                      className="form-input"
                      placeholder="e.g. Germany"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label className="form-label">Annual Volume</label>
                    <select
                      name="volume"
                      className="form-select"
                      value={formData.volume}
                      onChange={handleInputChange}
                    >
                      <option value="under-5">Under 5 Tons</option>
                      <option value="5-20">5 - 20 Tons</option>
                      <option value="20-100">20 - 100 Tons</option>
                      <option value="100+">100+ Tons</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Special Directives / Shipping Account</label>
                  <textarea
                    name="message"
                    className="form-textarea"
                    placeholder="Provide details such as target price differentials, contract lengths, or your DHL/FedEx account for expedited samples."
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {initialQuantity && initialQuantity > 20 && (
                <div className="modal-indicator">
                  Requesting quote parameters for <strong>{initialQuantity} bags</strong>
                </div>
              )}
              <button type="submit" className="submit-btn">
                Confirm Sample Reservation
                <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </form>
        )}

        {submissionStep === 1 && (
          <div className="modal-status-container animate-fade-in">
            <div className="loader-ring">
              <div></div><div></div><div></div><div></div>
            </div>
            <h3 className="status-title">Securing Allocations</h3>
            <p className="status-message">{submitMessage}</p>
          </div>
        )}

        {submissionStep === 2 && (
          <div className="modal-status-container success animate-fade-in">
            <div className="success-icon-wrapper">
              <svg className="success-checkmark" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h3 className="status-title">Reservation Confirmed</h3>
            <p className="status-message text-center">
              Your sample request for <strong>{selectedBeansList.map(b => b.name).join(', ')}</strong> has been registered.
            </p>
            <div className="success-details">
              <p><strong>Tracking Reference:</strong> {trackingRef}</p>
              <p>A regional coffee trade representative from Triventa Exports will contact you at <strong>{formData.email}</strong> within 12 business hours to verify your roasting business credentials and dispatch the samples.</p>
            </div>
            <button type="button" className="success-close-btn" onClick={onClose}>
              Return to Origins Explorer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SampleModal;
