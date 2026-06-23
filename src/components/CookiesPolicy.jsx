import { useEffect } from 'react';

function CookiesPolicy({ onNavigate }) {
  useEffect(() => {
    document.title = "Cookies Policy | Triventa Exports";
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
        <h1 className="legal-title">Cookies Policy</h1>
        <p className="legal-last-updated">Last Updated: June 23, 2026</p>

        <section className="legal-section-block">
          <p>
            Triventa Exports Private Limited (&ldquo;Triventa,&rdquo; &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) uses cookies and similar tracking technologies on our website. This Cookies Policy explains what cookies are, how we use them, and your choices regarding cookie management.
          </p>
        </section>

        <section className="legal-section-block">
          <h2>1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your computer or mobile device by your web browser when you visit a website. They help the website recognize your device, remember preferences, and analyze navigation flows to improve your browsing experience.
          </p>
        </section>

        <section className="legal-section-block">
          <h2>2. How We Use Cookies</h2>
          <p>We use cookies and local storage tokens for specific, functional purposes:</p>
          <ul>
            <li><strong>Essential &amp; Functional Cookies:</strong> These are required for the website to operate correctly. For example, we use browser Local Storage to save your sample cart selection (persistent coffee origins selected for cupping request) so they remain active even if you reload the page.</li>
            <li><strong>Security &amp; Performance:</strong> Cookies help protect our forms (such as the Netlify spam-prevention honeypot verification) and optimize raw data loads from our dynamic catalog sheet.</li>
            <li><strong>Theme Persistence:</strong> We utilize local storage indicators to remember your preference for Light or Dark theme configurations across different visits.</li>
          </ul>
        </section>

        <section className="legal-section-block">
          <h2>3. Cookies Sourcing Table</h2>
          <p>The table below summarizes the persistent storage configurations used on our site:</p>
          <div className="guide-table-wrapper" style={{ marginTop: '16px' }}>
            <table className="guide-table">
              <thead>
                <tr>
                  <th>Storage Key / Name</th>
                  <th>Type</th>
                  <th>Purpose</th>
                  <th>Retention</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>sampleCart</strong></td>
                  <td>Local Storage</td>
                  <td>Saves your selected coffee origins between sessions.</td>
                  <td>Persistent until cleared</td>
                </tr>
                <tr>
                  <td><strong>theme-preference</strong></td>
                  <td>Local Storage</td>
                  <td>Saves your Light/Dark mode choice.</td>
                  <td>Persistent</td>
                </tr>
                <tr>
                  <td><strong>__nf_cf_status</strong></td>
                  <td>HTTP Cookie</td>
                  <td>Netlify secure bot protection and form token validation.</td>
                  <td>Session</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="legal-section-block">
          <h2>4. Managing Your Cookie Choices</h2>
          <p>
            You can control or delete cookies as you wish. Most web browsers allow you to manage cookie preferences through their settings menu. You can set your browser to refuse cookies, or alert you when cookies are being sent.
          </p>
          <p>
            Please note that if you disable local storage or reject cookies, some features of our website (specifically the persistent sample cart selection and form submissions) may not function as intended.
          </p>
        </section>

        <section className="legal-section-block">
          <h2>5. Contact Us</h2>
          <p>If you have any questions about our use of cookies, please contact us at:</p>
          <div className="legal-contact-card">
            <p><strong>Triventa Exports Private Limited</strong></p>
            <p>Corporate Office: Mangalore, Karnataka, India</p>
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

export default CookiesPolicy;
