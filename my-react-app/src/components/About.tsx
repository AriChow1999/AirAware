import React from 'react';
import { ShieldCheck, HeartPulse, Wind, AlertTriangle } from 'lucide-react';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-root">
      <main className="about-container">
        <header className="about-header">

          <h1>Understanding <span className="text-gradient">Air Quality</span></h1>
          <p>Everything you need to know about the air you breathe and how to stay protected.</p>
        </header>

        <section className="about-grid">
          {/* Section 1: What is AQI */}
          <div className="glass-panel info-card">
            <div className="icon-box green">
              <Wind size={28} />
            </div>
            <h2>What is AQI?</h2>
            <p>
              The <strong>Air Quality Index (AQI)</strong> is a standardized system used to report daily air quality. 
              It tells you how clean or polluted your air is, and what associated health effects might be a concern for you.
            </p>
            <p>
              It focuses on health effects you may experience within a few hours or days after breathing polluted air.
            </p>
          </div>

          {/* Section 2: Health Impact */}
          <div className="glass-panel info-card">
            <div className="icon-box red">
              <HeartPulse size={28} />
            </div>
            <h2>Health Impacts</h2>
            <p>
              High levels of air pollution can cause immediate symptoms such as:
            </p>
            <ul className="impact-list">
              <li>Irritated eyes, nose, and throat</li>
              <li>Shortness of breath and coughing</li>
              <li>Worsening of asthma or bronchitis</li>
              <li>Increased risk of cardiovascular events</li>
            </ul>
          </div>

          {/* Section 3: Protection */}
          <div className="glass-panel info-card full-width">
            <div className="section-flex">
              <div className="flex-content">
                <div className="icon-box blue">
                  <ShieldCheck size={28} />
                </div>
                <h2>How to Stay Protected</h2>
                <div className="protection-grid">
                  <div className="prot-item">
                    <h3>Monitor Levels</h3>
                    <p>Check the AirAware dashboard daily before planning outdoor activities.</p>
                  </div>
                  <div className="prot-item">
                    <h3>Air Filtration</h3>
                    <p>Use HEPA air purifiers indoors to reduce particulate matter concentration.</p>
                  </div>
                  <div className="prot-item">
                    <h3>Limit Exposure</h3>
                    <p>On "Unhealthy" days, avoid heavy exertion outdoors and keep windows closed.</p>
                  </div>
                  <div className="prot-item">
                    <h3>Wear Masks</h3>
                    <p>N95 respirators are effective at filtering out fine toxic particles (PM2.5).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="about-disclaimer">
          <AlertTriangle size={16} />
          <span>Data provided is for informational purposes. Consult local health authorities for official safety protocols.</span>
        </footer>
      </main>
    </div>
  );
};

export default About;