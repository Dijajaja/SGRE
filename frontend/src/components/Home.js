import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-logo">
          <img src="/logo-iscae.png" alt="ISCAE Logo" className="logo-img" />
        </div>
        <h1 className="home-title">
          Système de Gestion des Réclamations Étudiantes
        </h1>
        <p className="home-description">
          Une plateforme moderne et intuitive pour gérer vos réclamations académiques, 
          administratives et techniques en toute simplicité.
        </p>
        <button 
          className="btn btn-primary btn-large"
          onClick={() => navigate('/login')}
        >
          Accéder à mon compte
        </button>
      </div>
    </div>
  );
}

export default Home;

