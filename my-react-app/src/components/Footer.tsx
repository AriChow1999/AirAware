import React from 'react';
import { Gauge, Github, Twitter, Linkedin } from 'lucide-react';
import "./Footer.css";

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo-section">
            <div className="footer-logo-icon-wrapper">
              <Gauge size={24} className="footer-brand-icon" strokeWidth={2.5} />
            </div>
            <span className="footer-logo-text">
              <span className="brand-accent">Air</span>
              <span className="brand-main">Aware</span>
            </span>
          </div>
          <p className="footer-description">
            Live healthier by tracking real-time air quality in your neighborhood.
            Empowering communities with atmospheric clarity and data-driven insights.
          </p>
          <div className="social-links">
            <a href="#"><Twitter size={20} /></a>
            <a href="#"><Linkedin size={20} /></a>
            <a href="#"><Github size={20} /></a>
          </div>
        </div>

        <div className="footer-links-group">
          <div className="footer-column">
            <h3>Explore</h3>
            <a href="/">Home</a>
            <a href="/about">About Us</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-line"></div>
        <div className="footer-bottom-content">
          <p>© {new Date().getFullYear()} AirAware — Breathe Better.</p>
        </div>
      </div>
    </footer>
  );
};