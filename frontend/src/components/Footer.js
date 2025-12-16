import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>SGRE</h3>
          <p>Système de Gestion des Réclamations Étudiantes</p>
        </div>
        <div className="footer-section">
          <h4>Liens utiles</h4>
          <ul>
            <li><a href="/">Accueil</a></li>
            <li><a href="/about">À propos</a></li>
            <li><a href="/login">Connexion</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>support@iscae.edu</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© ISCAE 2025. Tous droits réservés</p>
      </div>
    </footer>
  );
}

export default Footer;

