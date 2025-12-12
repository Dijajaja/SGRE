import React from 'react';
import './About.css';

function About() {
  return (
    <div className="about-container">
      <div className="about-content">
        <div className="about-logo">
          <img src="/logo-iscae.png" alt="ISCAE Logo" className="logo-img" />
        </div>
        <h1 className="about-title">À propos de ISCAE</h1>
        <p className="about-subtitle">Institut Supérieur de Comptabilité et d'Administration des Entreprises</p>
        <p className="about-description">
          Le Système de Gestion des Réclamations Étudiantes (SGRE) est une plateforme 
          moderne conçue pour faciliter la communication entre les étudiants et 
          l'administration universitaire. Créez, suivez et gérez vos réclamations 
          académiques, administratives et techniques en toute simplicité.
        </p>

        <div className="about-sections">
          <div className="about-section">
            <h3 className="section-title">Pour les Étudiants</h3>
            <p className="section-text">
              Créez facilement des réclamations concernant vos notes, examens, inscriptions, 
              documents administratifs ou problèmes techniques. Suivez l'évolution de vos 
              réclamations en temps réel et recevez des notifications instantanées.
            </p>
          </div>

          <div className="about-section">
            <h3 className="section-title">Pour l'Administration</h3>
            <p className="section-text">
              Gérez efficacement toutes les réclamations, assignez des responsables, 
              changez les statuts et ajoutez des commentaires. Accédez à des statistiques 
              détaillées pour un suivi optimal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;

