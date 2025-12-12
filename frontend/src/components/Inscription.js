import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GraduationIcon, UserIcon, BookIcon, TagIcon, CheckIcon } from './Icons';
import './Inscription.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function Inscription({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    matricule: '',
    filiere: '',
    niveau: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filieres = [
    'Banques & Assurances',
    'Finance & Comptabilité',
    'Gestion des Ressources Humaines',
    'Techniques Commerciales et Marketing',
    'Développement Informatique',
    'Informatique de Gestion',
    'Pro Finance et Comptabilité',
    'Pro en Informatique Appliqué à la Gestion'
  ];

  // Filières Master (n'ont que M1 et M2)
  const filieresMaster = [
    'Pro Finance et Comptabilité',
    'Pro en Informatique Appliqué à la Gestion'
  ];

  // Niveaux selon la filière sélectionnée
  const getNiveaux = () => {
    if (filieresMaster.includes(formData.filiere)) {
      return ['M1', 'M2'];
    }
    return ['L1', 'L2', 'L3'];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/etudiants`, formData);
      
      // Afficher un message de succès
      const successMsg = document.createElement('div');
      successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        color: white;
        padding: 20px 28px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(17, 153, 142, 0.4);
        z-index: 10000;
        font-weight: 600;
        font-size: 16px;
        animation: slideIn 0.3s ease;
        max-width: 400px;
      `;
      successMsg.innerHTML = 'Inscription réussie !<br><small style="font-size: 14px; opacity: 0.9;">Redirection en cours...</small>';
      document.body.appendChild(successMsg);

      // Connecter automatiquement l'étudiant
      setTimeout(() => {
        onLogin(response.data.etudiant, 'etudiant');
        navigate('/etudiant');
        successMsg.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => successMsg.remove(), 300);
      }, 1500);
    } catch (err) {
      console.error('❌ Erreur inscription:', err);
      console.error('❌ Réponse erreur:', err.response?.data);
      const errorMessage = err.response?.data?.error || err.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      setLoading(false);
      
      const errorMsg = document.createElement('div');
      errorMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
        color: white;
        padding: 20px 28px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(235, 51, 73, 0.4);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        word-wrap: break-word;
      `;
      errorMsg.textContent = errorMessage;
      document.body.appendChild(errorMsg);
      setTimeout(() => {
        errorMsg.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => errorMsg.remove(), 300);
      }, 5000);
    }
  };

  return (
    <div className="inscription-container">
      <div className="inscription-card">
        <div className="inscription-header">
          <div className="inscription-logo">
            <img src="/logo-iscae.png" alt="ISCAE Logo" className="logo-img-small" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            <GraduationIcon size={32} color="white" />
            <h2>Inscription Étudiant</h2>
          </div>
          <p className="subtitle">Créez votre compte pour accéder au système de réclamations</p>
        </div>

        <form onSubmit={handleSubmit} className="inscription-form">
          <div className="form-row">
            <div className="form-group">
              <label>
                <UserIcon size={18} color="white" />
                Nom
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                placeholder="Votre nom"
              />
            </div>

            <div className="form-group">
              <label>
                <UserIcon size={18} color="white" />
                Prénom
              </label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
                placeholder="Votre prénom"
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <TagIcon size={18} color="white" />
              Matricule
            </label>
            <input
              type="text"
              value={formData.matricule}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                if (value === '' || (value.startsWith('I') && /^I[0-9]{0,5}$/.test(value))) {
                  setFormData({ ...formData, matricule: value });
                }
              }}
              required
              placeholder="I12345"
              pattern="I[0-9]{5}"
              maxLength={6}
            />
            <small style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              Votre email sera généré automatiquement : {formData.matricule ? formData.matricule.toLowerCase() + '.etu@iscae.mr' : 'i12345.etu@iscae.mr'}
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <BookIcon size={18} color="white" />
                Filière
              </label>
              <select
                value={formData.filiere}
                onChange={(e) => {
                  const nouvelleFiliere = e.target.value;
                  // Réinitialiser le niveau si on change de filière
                  setFormData({ ...formData, filiere: nouvelleFiliere, niveau: '' });
                }}
                required
              >
                <option value="">Sélectionner une filière</option>
                {filieres.map(filiere => (
                  <option key={filiere} value={filiere}>{filiere}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <TagIcon size={18} color="white" />
                Niveau
              </label>
              <select
                value={formData.niveau}
                onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                required
                disabled={!formData.filiere}
              >
                <option value="">
                  {formData.filiere 
                    ? (filieresMaster.includes(formData.filiere) ? 'Sélectionner un niveau (Master)' : 'Sélectionner un niveau (Licence)')
                    : 'Sélectionner d\'abord une filière'}
                </option>
                {getNiveaux().map(niveau => (
                  <option key={niveau} value={niveau}>{niveau}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-large"
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid #000000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                Inscription en cours...
              </>
            ) : (
              <>
                <CheckIcon size={18} color="white" />
                Créer mon compte
              </>
            )}
          </button>

          <div className="inscription-footer">
            <p>Déjà inscrit ? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Se connecter</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Inscription;

