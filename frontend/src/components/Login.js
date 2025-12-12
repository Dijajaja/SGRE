import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LockIcon, GraduationIcon, ShieldIcon, ArrowRightIcon } from './Icons';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = choix du profil, 2 = formulaire de connexion
  const [userType, setUserType] = useState(null); // 'etudiant' ou 'admin'
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileSelect = (type) => {
    setUserType(type);
    setStep(2);
    setError('');
  };

  const handleBack = () => {
    setStep(1);
    setUserType(null);
    setEmail('');
    setMotDePasse('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/login/${userType}`,
        { email, mot_de_passe: motDePasse }
      );

      if (response.data && response.data.user) {
        onLogin(response.data.user, response.data.type);
      } else {
        setError('Erreur lors de la connexion');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {step === 1 ? (
          <>
            <div className="login-header">
              <div className="login-logo">
                <img src="/logo-iscae.png" alt="ISCAE Logo" className="logo-img-small" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
                <LockIcon size={32} color="white" />
                <h2>Connexion</h2>
              </div>
              <p className="subtitle">Choisissez votre profil pour continuer</p>
            </div>

            <div className="profile-selection">
              <button
                type="button"
                className="profile-card"
                onClick={() => handleProfileSelect('etudiant')}
              >
                <div className="profile-icon">
                  <GraduationIcon size={48} color="white" />
                </div>
                <h3>Étudiant</h3>
                <p>Accédez à votre espace étudiant pour déposer et suivre vos réclamations</p>
                <div className="profile-arrow">
                  <ArrowRightIcon size={20} color="white" />
                </div>
              </button>

              <button
                type="button"
                className="profile-card"
                onClick={() => handleProfileSelect('admin')}
              >
                <div className="profile-icon">
                  <ShieldIcon size={48} color="white" />
                </div>
                <h3>Administrateur</h3>
                <p>Gérez les réclamations et le système en tant qu'administrateur</p>
                <div className="profile-arrow">
                  <ArrowRightIcon size={20} color="white" />
                </div>
              </button>
            </div>

            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.2)', textAlign: 'center' }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', margin: '0 0 12px 0' }}>
                Nouveau sur la plateforme ?
              </p>
              <a 
                href="/inscription" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/inscription');
                }}
                style={{
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(59, 130, 246, 0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <GraduationIcon size={18} color="#ffffff" />
                Créer un compte étudiant
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="login-header" style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={handleBack}
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ← Retour
              </button>
              <div className="login-logo">
                <img src="/logo-iscae.png" alt="ISCAE Logo" className="logo-img-small" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
                {userType === 'etudiant' ? (
                  <GraduationIcon size={32} color="white" />
                ) : (
                  <ShieldIcon size={32} color="white" />
                )}
                <h2>Connexion {userType === 'etudiant' ? 'Étudiant' : 'Administrateur'}</h2>
              </div>
              <p className="subtitle">
                {userType === 'etudiant' 
                  ? 'Entrez votre adresse email et votre mot de passe' 
                  : 'Entrez vos identifiants administrateur'}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label>
                  <LockIcon size={18} color="white" />
                  {userType === 'etudiant' ? 'Adresse email étudiant' : 'Email administrateur'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={userType === 'etudiant' ? 'i12345.etu@iscae.mr' : 'admin@univ.edu'}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <LockIcon size={18} color="white" />
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid #000000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                    Connexion...
                  </>
                ) : (
                  <>
                    <LockIcon size={18} color="white" />
                    Se connecter
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
