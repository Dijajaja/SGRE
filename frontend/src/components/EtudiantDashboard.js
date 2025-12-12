import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookIcon, BellIcon, PlusIcon, CloseIcon, DocumentIcon, CalendarIcon, UserIcon, LogoutIcon, EmptyIcon, ListIcon, TagIcon, CheckIcon, EditIcon } from './Icons';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function EtudiantDashboard({ user, onLogout }) {
  const [reclamations, setReclamations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingReclamation, setEditingReclamation] = useState(null);
  const [formData, setFormData] = useState({
    type_reclamation: 'ACADEMIQUE',
    titre: '',
    description: ''
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const userId = user.id || user.ID;
      const [reclamationsRes, notificationsRes] = await Promise.all([
        axios.get(`${API_URL}/etudiants/${userId}/reclamations`),
        axios.get(`${API_URL}/etudiants/${userId}/notifications`)
      ]);
      setReclamations(reclamationsRes.data);
      setNotifications(notificationsRes.data.filter(n => n.lu === 0));
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reclamation) => {
    setEditingReclamation(reclamation);
    setFormData({
      type_reclamation: reclamation.type_reclamation,
      titre: reclamation.titre,
      description: reclamation.description
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingReclamation(null);
    setFormData({
      type_reclamation: 'ACADEMIQUE',
      titre: '',
      description: ''
    });
    setShowForm(false);
  };

  const handleDelete = async (reclamationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réclamation ?')) {
      return;
    }

    try {
      const userId = user.id || user.ID;
      await axios.delete(`${API_URL}/reclamations/${reclamationId}`, {
        data: { etudiant_id: userId }
      });
      
      // Afficher un message de succès
      const successMsg = document.createElement('div');
      successMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
      `;
      successMsg.textContent = 'Réclamation annulée avec succès';
      document.body.appendChild(successMsg);
      setTimeout(() => {
        successMsg.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(successMsg), 300);
      }, 3000);

      // Recharger les données
      loadData();
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      const errorMsg = document.createElement('div');
      errorMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
      `;
      errorMsg.textContent = error.response?.data?.error || 'Erreur lors de l\'annulation de la réclamation';
      document.body.appendChild(errorMsg);
      setTimeout(() => {
        errorMsg.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(errorMsg), 300);
      }, 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Formulaire soumis', formData);
    
    // Validation
    if (!formData.titre || !formData.description) {
      const errorMsg = document.createElement('div');
      errorMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
      `;
      errorMsg.textContent = 'Veuillez remplir tous les champs obligatoires';
      document.body.appendChild(errorMsg);
      setTimeout(() => {
        errorMsg.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => errorMsg.remove(), 300);
      }, 3000);
      return;
    }
    
    setSubmitting(true);
    try {
      const userId = user.id || user.ID;
      
      if (editingReclamation) {
        // Modification
        console.log('Modification de la réclamation...', {
          id: editingReclamation.reclamation_id,
          etudiant_id: userId,
          type_reclamation: formData.type_reclamation,
          titre: formData.titre.trim(),
          description: formData.description.trim()
        });
        
        await axios.put(`${API_URL}/reclamations/${editingReclamation.reclamation_id}`, {
          etudiant_id: userId,
          type_reclamation: formData.type_reclamation,
          titre: formData.titre.trim(),
          description: formData.description.trim()
        });
        
        console.log('Réclamation modifiée avec succès');
        
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(17, 153, 142, 0.3);
          z-index: 10000;
          font-weight: 600;
          animation: slideIn 0.3s ease;
        `;
        successMsg.textContent = 'Réclamation modifiée avec succès!';
        document.body.appendChild(successMsg);
        setTimeout(() => {
          successMsg.style.animation = 'slideOut 0.3s ease';
          setTimeout(() => successMsg.remove(), 300);
        }, 3000);
      } else {
        // Création
        console.log('Envoi de la réclamation...', {
          etudiant_id: userId,
          type_reclamation: formData.type_reclamation,
          titre: formData.titre.trim(),
          description: formData.description.trim()
        });
        
        await axios.post(`${API_URL}/reclamations`, {
          etudiant_id: userId,
          type_reclamation: formData.type_reclamation,
          titre: formData.titre.trim(),
          description: formData.description.trim()
        });
        
        console.log('Réclamation créée avec succès');
        
        const successMsg = document.createElement('div');
        successMsg.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(17, 153, 142, 0.3);
          z-index: 10000;
          font-weight: 600;
          animation: slideIn 0.3s ease;
        `;
        successMsg.textContent = 'Réclamation créée avec succès!';
        document.body.appendChild(successMsg);
        setTimeout(() => {
          successMsg.style.animation = 'slideOut 0.3s ease';
          setTimeout(() => successMsg.remove(), 300);
        }, 3000);
      }
      
      setSubmitting(false);
      setShowForm(false);
      setEditingReclamation(null);
      setFormData({ type_reclamation: 'ACADEMIQUE', titre: '', description: '' });
      await loadData();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      setSubmitting(false);
      const errorMsg = document.createElement('div');
      errorMsg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(235, 51, 73, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
      `;
      errorMsg.textContent = `Erreur: ${error.response?.data?.error || error.message || 'Erreur lors de la création de la réclamation'}`;
      document.body.appendChild(errorMsg);
      setTimeout(() => {
        errorMsg.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => errorMsg.remove(), 300);
      }, 4000);
    }
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'EN ATTENTE': 'badge-warning',
      'EN COURS': 'badge-info',
      'RESOLUE': 'badge-success',
      'FERMEE': 'badge-secondary'
    };
    return badges[statut] || 'badge-secondary';
  };

  const getPriorityBadge = (priorite) => {
    const badges = {
      'FAIBLE': 'badge-secondary',
      'MOYENNE': 'badge-info',
      'ELEVEE': 'badge-warning',
      'URGENTE': 'badge-danger'
    };
    return badges[priorite] || 'badge-secondary';
  };

  const getTypeStyle = (type) => {
    switch(type) {
      case 'ACADEMIQUE': 
        return { background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)', color: 'white' };
      case 'ADMINISTRATIF': 
        return { background: 'linear-gradient(135deg, #f472b6 0%, #fb7185 100%)', color: 'white' };
      case 'TECHNIQUE': 
        return { background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', color: 'white' };
      default: 
        return { background: 'linear-gradient(135deg, #94a3b8 0%, #cbd5e1 100%)', color: 'white' };
    }
  };

  if (loading) {
    return <div className="container">Chargement...</div>;
  }

  return (
    <div>
      <div className="header">
        <div className="header-content">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
            <BookIcon size={28} color="white" />
            Tableau de bord Étudiant
          </h1>
          <div className="header-actions">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>
              <UserIcon size={18} color="white" />
              Bienvenue, {user.nom || user.NOM} {user.prenom || user.PRENOM}
            </span>
            <button className="btn btn-secondary" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogoutIcon size={18} color="white" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="container dashboard">
        {notifications.length > 0 && (
          <div className="card" style={{ 
            background: 'rgba(251, 191, 36, 0.25)', 
            border: '2px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 4px 16px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}>
            <h3 style={{ marginBottom: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
              <BellIcon size={20} color="white" />
              Notifications ({notifications.length})
            </h3>
            {notifications.map(notif => (
              <div key={notif.id || notif.ID} style={{ 
                marginTop: '12px', 
                padding: '18px', 
                background: 'rgba(255, 255, 255, 0.2)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                borderLeft: '4px solid rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <p style={{ margin: '0 0 8px 0', color: 'white', textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>{notif.message || notif.MESSAGE}</p>
                <small style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
                  <CalendarIcon size={14} color="rgba(255, 255, 255, 0.8)" />
                  {new Date(notif.date_notification || notif.DATE_NOTIFICATION).toLocaleString('fr-FR')}
                </small>
              </div>
            ))}
          </div>
        )}

        <div className="dashboard-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
            <ListIcon size={28} color="white" />
            Mes Réclamations
          </h2>
          <button className="btn btn-primary" onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setShowForm(true);
            }
          }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showForm ? (
              <>
                <CloseIcon size={18} color="white" />
                Annuler
              </>
            ) : (
              <>
                <PlusIcon size={18} color="white" />
                Nouvelle Réclamation
              </>
            )}
          </button>
        </div>

        {showForm && (
          <div className="card reclamation-form" style={{ animation: 'slideDown 0.3s ease' }}>
            <h3 style={{ marginBottom: '24px', color: 'white', fontSize: '22px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
              <DocumentIcon size={24} color="white" />
              {editingReclamation ? 'Modifier la Réclamation' : 'Nouvelle Réclamation'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  <TagIcon size={18} color="white" />
                  Type de réclamation
                </label>
                <select
                  value={formData.type_reclamation}
                  onChange={(e) => setFormData({ ...formData, type_reclamation: e.target.value })}
                  required
                >
                  <option value="ACADEMIQUE">Académique</option>
                  <option value="ADMINISTRATIF">Administratif</option>
                  <option value="TECHNIQUE">Technique</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <DocumentIcon size={18} color="white" />
                  Titre
                </label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  required
                  placeholder="Résumez votre réclamation en quelques mots"
                />
              </div>

              <div className="form-group">
                <label>
                  <DocumentIcon size={18} color="white" />
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Décrivez votre problème en détail..."
                  rows="6"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={submitting}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? (
                  <>
                    <div className="spinner" style={{ 
                      width: '18px', 
                      height: '18px', 
                      border: '2px solid rgba(0,0,0,0.2)', 
                      borderTop: '2px solid #000000', 
                      borderRadius: '50%', 
                      animation: 'spin 0.8s linear infinite' 
                    }}></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <CheckIcon size={18} color="white" />
                    {editingReclamation ? 'Modifier la réclamation' : 'Soumettre la réclamation'}
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        <div className="card">
          {reclamations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#718096' }}>
              <EmptyIcon size={64} color="#cbd5e0" />
              <h3 style={{ color: '#2d3748', marginBottom: '8px' }}>Aucune réclamation</h3>
              <p>Vous n'avez pas encore créé de réclamation.</p>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowForm(true)}
                style={{ marginTop: '20px' }}
              >
                Créer ma première réclamation
              </button>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titre</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Priorité</th>
                  <th>Date</th>
                  <th>Responsable</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reclamations.map(reclamation => (
                  <tr key={reclamation.reclamation_id}>
                    <td style={{ fontWeight: '700', color: 'white', textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>#{reclamation.reclamation_id}</td>
                    <td style={{ fontWeight: '500', color: 'rgba(255, 255, 255, 0.95)' }}>{reclamation.titre}</td>
                    <td>
                      <span style={{ 
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        ...getTypeStyle(reclamation.type_reclamation),
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {reclamation.type_reclamation}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(reclamation.statut)}`}>
                        {reclamation.statut}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getPriorityBadge(reclamation.priorite)}`}>
                        {reclamation.priorite}
                      </span>
                    </td>
                    <td style={{ color: 'rgba(255, 255, 255, 0.8)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CalendarIcon size={16} color="rgba(255, 255, 255, 0.8)" />
                      {new Date(reclamation.date_creation).toLocaleDateString('fr-FR')}
                    </td>
                    <td>{reclamation.admin_nom ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255, 255, 255, 0.9)' }}>
                        <UserIcon size={16} color="rgba(255, 255, 255, 0.9)" />
                        {reclamation.admin_nom}
                      </span>
                    ) : <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Non assigné</span>}</td>
                    <td>
                      {reclamation.statut === 'EN ATTENTE' && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => handleEdit(reclamation)}
                            style={{
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.05)';
                              e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                            }}
                          >
                            <EditIcon size={14} color="white" />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(reclamation.reclamation_id)}
                            style={{
                              padding: '6px 12px',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.05)';
                              e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)';
                            }}
                          >
                            <CloseIcon size={14} color="white" />
                            Annuler
                          </button>
                        </div>
                      )}
                      {reclamation.statut !== 'EN ATTENTE' && (
                        <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>Non modifiable</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default EtudiantDashboard;

