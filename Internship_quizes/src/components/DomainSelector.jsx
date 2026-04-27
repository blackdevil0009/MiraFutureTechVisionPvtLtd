import React from 'react';

const DomainSelector = ({ domains, onSelectDomain, userInfo }) => {
  return (
    <div className="domain-selector-container">
      {userInfo && (
        <div className="user-info-banner">
          <div className="user-badge">
            <span className="user-name">👤 {userInfo.name}</span>
            <span className="user-details">{userInfo.collegeName} • {userInfo.branch}</span>
          </div>
        </div>
      )}

      <div className="welcome-section">
        <h1 className="main-heading">📚 Student Domain Test Portal</h1>
        <p className="subtitle">Select your domain and test your basics</p>
      </div>

      <div className="domains-grid">
        {domains.map((domain) => (
          <button
            key={domain}
            className="domain-card"
            onClick={() => onSelectDomain(domain)}
          >
            <span className="domain-icon">
              {domain === 'Full Stack Development' && '🎯'}
              {domain === 'Frontend Development' && '🎨'}
              {domain === 'Backend Development' && '⚙️'}
              {domain === 'Java Development' && '☕'}
              {domain === 'Python Development' && '🐍'}
              {domain === 'Data Science' && '📊'}
              {domain === 'Artificial Intelligence' && '🤖'}
              {domain === 'Machine Learning' && '🧠'}
              {domain === 'Cyber Security' && '🔒'}
              {domain === 'Cloud Computing' && '☁️'}
            </span>
            <span className="domain-name">{domain}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DomainSelector;
