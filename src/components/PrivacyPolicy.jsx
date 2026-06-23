import { useEffect } from 'react';

function PrivacyPolicy({ onNavigate }) {
  useEffect(() => {
    document.title = "Privacy Policy | Triventa Exports";
  }, []);

  return (
    <div className="legal-page-container animate-fade-in">
      <header className="legal-header">
        <div className="legal-header-content">
          <div className="logo-container">
            <span className="logo-image" aria-label="Triventa Exports Logo" role="img"></span>
            <span className="logo-text">TRIVENTA EXPORTS</span>
          </div>
          <button type="button" className="legal-back-btn" onClick={() => onNavigate('/')}>
            ← Back to Home
          </button>
        </div>
      </header>

      <main className="legal-content-wrapper">
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-last-updated">Last Updated: June 23, 2026</p>

        <section className="legal-section-block">
          <p>
            Triventa Exports Private Limited (&ldquo;Triventa,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy and is committed to protecting your personal and business data. This Privacy Policy describes how we collect, use, store, and share your information when you visit our website, use our FOB cargo calculator, or request green coffee samples.
          </p>
        </section>

        <section className="legal-section-block">
          <h2>1. Information We Collect</h2>
          <p>We collect business and contact information necessary to evaluate trade partnerships and dispatch wholesale cupping samples:</p>
          <ul>
            <li><strong>Roastery &amp; Contact Details:</strong> Contact name, roastery/company name, business email address, phone number, destination country, and annual roasting volume.</li>
            <li><strong>Sample Request Specifications:</strong> Specific green coffee micro-lots selected, cargo shipping volume directives, and DHL/FedEx account numbers for express routing.</li>
            <li><strong>FOB Calculator Queries:</strong> Estimated shipment weights, bag counts, container loads, and country preferences entered into our logistics simulation portal.</li>
            <li><strong>Technical Access Logs:</strong> IP address, device specifications, browser type, and navigation logs collected for security and system optimization.</li>
          </ul>
        </section>

        <section className="legal-section-block">
          <h2>2. How We Use Your Information</h2>
          <p>Your data is processed strictly for commercial trade purposes and regulatory compliance:</p>
          <ul>
            <li><strong>Sample Dispatch &amp; Verification:</strong> Validating your roasting business credentials and issuing custom sample reservations.</li>
            <li><strong>Logistics Planning &amp; Quotations:</strong> Generating shipping projections from the Port of Mangalore (NMPT) and providing simulated FOB price estimates.</li>
            <li><strong>Communications &amp; Harvest Alerts:</strong> Sending harvest sheets, pre-harvest cupping logs, container shipping schedules, and marketing updates (with your consent).</li>
            <li><strong>Legal &amp; Export Filings:</strong> Managing compliant documentation with the Coffee Board of India, DGFT, and Customs gateways.</li>
          </ul>
        </section>

        <section className="legal-section-block">
          <h2>3. Sourcing &amp; Export Compliance Sharing</h2>
          <p>As a certified exporter from India, we share trade and shipment information to comply with statutory regulations:</p>
          <ul>
            <li><strong>Coffee Board of India:</strong> Submitting lot data, quality testing logs, and trace parameters to obtain official RCMC approvals and Certificates of Origin (RCMC Certificate: 3463).</li>
            <li><strong>DGFT &amp; Customs Gateways:</strong> Transmitting customs filings, container manifests, and shipping bills via the Indian Customs Electronic Gateway (ICEGATE ID: AAMCT6839P / ICEGATE: AAMCT6839PPIE000) under our registered Import Export Code (IEC: AAMCT6839P).</li>
            <li><strong>Logistics &amp; Cargo Freight Partners:</strong> Disclosing consignee name, destination address, and weight specifications to shipping lines and port clearing agents at Mangalore.</li>
          </ul>
          <p className="legal-note-box">
            <strong>Note:</strong> We do NOT sell, lease, or distribute your business contact information or trade volumes to third-party marketing companies.
          </p>
        </section>

        <section className="legal-section-block">
          <h2>4. Data Retention &amp; Security</h2>
          <p>
            We implement high-grade organizational and technical controls to secure your roastery’s data. We retain your commercial inquiries and sample requests for as long as necessary to maintain active trade relations or to comply with statutory customs audit periods under Indian export regulations.
          </p>
        </section>

        <section className="legal-section-block">
          <h2>5. Cookies &amp; Web Analytics</h2>
          <p>
            Our website uses minimal operational cookies and local storage tokens to preserve your sample cart selection (e.g., storing your selected micro-lots) and to analyze traffic flow. You can adjust your browser settings to reject cookies, though doing so may impact the functional persistence of your sample selections.
          </p>
        </section>

        <section className="legal-section-block">
          <h2>6. Your Trade Desk Rights</h2>
          <p>Depending on your jurisdiction (such as the GDPR for EU/UK roasters), you hold the right to:</p>
          <ul>
            <li>Request access to the roastery contact logs and trade history we maintain.</li>
            <li>Request correction of inaccurate shipping coordinates or contact emails.</li>
            <li>Request erasure of your contact details from our active offer list database.</li>
            <li>Withdraw marketing consent for harvest newsletters at any time.</li>
          </ul>
        </section>

        <section className="legal-section-block">
          <h2>7. Contact Trade Desk</h2>
          <p>For questions regarding this policy, data erasure requests, or trade desk compliance, please contact our legal representative:</p>
          <div className="legal-contact-card">
            <p><strong>Triventa Exports Private Limited</strong></p>
            <p>Corporate Office: Mangalore, Karnataka, India</p>
            <p>CIN: U46209KA2026PTC214010 &bull; GSTIN: 29AAMCT6839P1Z5</p>
            <p>Email: <a href="mailto:info@triventaexports.com">info@triventaexports.com</a></p>
            <p>Phone / WhatsApp: <a href="tel:+919148025018">+91 91480 25018</a></p>
          </div>
        </section>
      </main>

      <footer className="legal-footer">
        <p className="copyright">&copy; 2026 Triventa Exports Private Limited. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default PrivacyPolicy;
