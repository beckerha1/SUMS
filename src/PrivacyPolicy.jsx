import React from 'react';
import { Link } from 'react-router-dom';
import PageNav from './components/PageNav';

const overlayStyle = {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100dvh",
  overflowY: "auto",
  backgroundColor: "rgba(0,0,0,0.6)",
  zIndex: 2000,
  padding: "max(8px, env(safe-area-inset-top)) 12px max(8px, env(safe-area-inset-bottom))",
  boxSizing: "border-box",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  touchAction: "manipulation"
};

const modalCardStyle = {
  width: "min(100%, 800px)",
  maxHeight: "calc(100dvh - 16px)",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  margin: "0 auto",
  padding: "clamp(20px, 5vw, 40px) clamp(14px, 4vw, 20px)",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  lineHeight: "1.6",
  color: "#333",
  background: "#fff",
  borderRadius: "12px",
  position: "relative"
};

const closeButtonStyle = {
  position: "absolute",
  top: "14px",
  right: "14px",
  background: "transparent",
  border: "none",
  fontSize: "1.5rem",
  cursor: "pointer",
  color: "#666",
  lineHeight: "1",
  padding: 0
};

const pageWrapStyle = {
  minHeight: "100vh",
  background: "#f7f7f8",
  padding: "20px 12px",
  boxSizing: "border-box"
};

const homeLinkStyle = {
  display: "inline-block",
  marginBottom: "16px",
  color: "#303036",
  fontWeight: 600,
  textDecoration: "none"
};

const PrivacyPolicyContent = ({ onClose, modal = false }) => {
  const body = (
    <div style={modalCardStyle}>
      {modal ? (
        <button
          onClick={onClose}
          style={closeButtonStyle}
          aria-label="Close"
        >
          ✖
        </button>
      ) : (
        <Link to="/" style={homeLinkStyle}>← Play today’s puzzle</Link>
      )}
      {!modal && <PageNav />}

        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Privacy Policy</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        <strong>Effective Date:</strong> January 26, 2025
      </p>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>1. Introduction</h2>
        <p>
          Welcome to Sums ("we," "our," or "us"). We are committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, and safeguard information when you 
          visit our website and play our puzzle game.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>2. Information We Collect</h2>
        
        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', marginTop: '20px' }}>
          2.1 Information You Provide
        </h3>
        <p>
          We do not require you to create an account or provide personal information to play Sums. 
          However, we store the following data locally on your device:
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
          <li><strong>Game Statistics:</strong> Your win/loss record, streak count, and completion times</li>
          <li><strong>Game Preferences:</strong> Settings like difficulty mode (Normal/Hard)</li>
          <li><strong>Completed Puzzles:</strong> Record of which daily puzzles you've completed</li>
        </ul>
        <p>
          This information is stored in your browser's local storage and never leaves your device 
          or is transmitted to our servers.
        </p>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', marginTop: '20px' }}>
          2.2 Automatically Collected Information
        </h3>
        <p>
          When you visit our website, certain information may be automatically collected, including:
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
          <li>Browser type and version</li>
          <li>Device type (mobile, tablet, desktop)</li>
          <li>Operating system</li>
          <li>IP address (anonymized)</li>
          <li>Pages visited and time spent on pages</li>
          <li>Date and time of visit</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>3. Third-Party Services</h2>
        
        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', marginTop: '20px' }}>
          3.1 Google AdSense
        </h3>
        <p>
          We use Google AdSense to display advertisements on our website. Google AdSense may use 
          cookies and web beacons to collect information about your visits to this and other websites 
          in order to provide relevant advertisements.
        </p>
        <p>
          Google's use of advertising cookies enables it and its partners to serve ads based on your 
          visits to our site and/or other sites on the Internet. You may opt out of personalized 
          advertising by visiting{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" 
             style={{ color: '#007bff' }}>
            Google Ads Settings
          </a>.
        </p>
        <p>
          For more information about how Google uses data, please visit{' '}
          <a href="https://policies.google.com/technologies/partner-sites" target="_blank" 
             rel="noopener noreferrer" style={{ color: '#007bff' }}>
            Google's Privacy & Terms
          </a>.
        </p>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', marginTop: '20px' }}>
          3.2 Analytics (if applicable)
        </h3>
        <p>
          We may use analytics services to help us understand how visitors use our website. 
          These services may collect information such as how often users visit the site, 
          what pages they visit, and what other sites they used prior to coming to our site.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>4. Cookies</h2>
        <p>
          Our website uses cookies and similar tracking technologies. Cookies are small text files 
          stored on your device that help us improve your experience. We use cookies for:
        </p>
        <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
          <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
          <li><strong>Advertising Cookies:</strong> Used by Google AdSense to display relevant ads</li>
        </ul>
        <p>
          You can control cookies through your browser settings. However, disabling cookies may 
          affect your ability to use certain features of our website.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>5. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
          <li>Provide and maintain our game service</li>
          <li>Track your personal game statistics locally on your device</li>
          <li>Display relevant advertisements through Google AdSense</li>
          <li>Improve and optimize our website</li>
          <li>Understand how users interact with our game</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>6. Data Storage and Security</h2>
        <p>
          Your game statistics are stored locally in your browser's local storage and are not 
          transmitted to our servers. This data remains on your device and can be cleared at any 
          time by clearing your browser data or using our "Reset Stats" feature in the game settings.
        </p>
        <p>
          While we strive to protect your information, no method of transmission over the Internet 
          or electronic storage is 100% secure. We cannot guarantee absolute security.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>7. Children's Privacy</h2>
        <p>
          Our website is not directed to children under the age of 13. We do not knowingly collect 
          personal information from children under 13. If you are a parent or guardian and believe 
          your child has provided us with personal information, please contact us.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>8. Your Rights and Choices</h2>
        <p>You have the following rights regarding your data:</p>
        <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
          <li>
            <strong>Access and Delete:</strong> You can access and delete your game statistics 
            at any time using the "Reset Stats" button in the game settings menu
          </li>
          <li>
            <strong>Opt-Out of Personalized Ads:</strong> Visit{' '}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" 
               style={{ color: '#007bff' }}>
              Google Ads Settings
            </a>{' '}
            to manage your advertising preferences
          </li>
          <li>
            <strong>Cookie Management:</strong> Adjust your browser settings to refuse or delete cookies
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>9. Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes 
          by posting the new Privacy Policy on this page and updating the "Effective Date" at the top.
        </p>
        <p>
          You are advised to review this Privacy Policy periodically for any changes. Changes to 
          this Privacy Policy are effective when they are posted on this page.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>10. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at:
        </p>
        <p style={{ marginLeft: '20px' }}>
          <strong>Email:</strong> harrison.x.becker@gmail.com<br/>
          <strong>Website:</strong> sums.games
        </p>
      </section>

      <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #ddd' }} />

      <section style={{ fontSize: '0.9rem', color: '#666' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Additional Information for EU Users</h3>
        <p>
          If you are located in the European Union, you have additional rights under the General 
          Data Protection Regulation (GDPR), including:
        </p>
        <ul style={{ marginLeft: '20px' }}>
          <li>The right to access your personal data</li>
          <li>The right to rectification of inaccurate data</li>
          <li>The right to erasure ("right to be forgotten")</li>
          <li>The right to restrict processing</li>
          <li>The right to data portability</li>
          <li>The right to object to processing</li>
        </ul>
        <p style={{ marginTop: '15px' }}>
          Since we do not collect or store personal data on our servers, most of these rights 
          can be exercised by managing your browser's local storage and cookie settings.
        </p>
      </section>
    </div>
  );

  if (modal) return <div style={overlayStyle}>{body}</div>;
  return <main style={pageWrapStyle}>{body}</main>;
};

export default PrivacyPolicyContent;