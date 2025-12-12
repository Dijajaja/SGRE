import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SettingsIcon, LogoutIcon, UserIcon, StatsIcon, AlertIcon, EditIcon, FilterIcon, TagIcon, CalendarIcon, ListIcon, EmptyIcon, SaveIcon, DocumentIcon, CloseIcon, CheckIcon } from './Icons';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function AdminDashboard({ user, onLogout }) {
  const [reclamations, setReclamations] = useState([]);
  const [statistiques, setStatistiques] = useState(null);
  const [urgentes, setUrgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    statut: '',
    type: ''
  });
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionData, setActionData] = useState({
    nouveau_statut: '',
    commentaire: ''
  });
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    loadData();
    loadAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.type) params.append('type', filters.type);

      const [reclamationsRes, statsRes, urgentesRes] = await Promise.all([
        axios.get(`${API_URL}/reclamations?${params.toString()}`),
        axios.get(`${API_URL}/statistiques/globales`),
        axios.get(`${API_URL}/statistiques/urgentes`)
      ]);
      setReclamations(reclamationsRes.data);
      setStatistiques(statsRes.data);
      setUrgentes(urgentesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin`);
      setAdmins(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des admins:', error);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedReclamation) {
      console.error('Aucune réclamation sélectionnée');
      return;
    }
    
    const reclamationId = selectedReclamation.reclamation_id || selectedReclamation.RECLAMATION_ID || selectedReclamation.id || selectedReclamation.ID;
    if (!reclamationId) {
      console.error('ID de réclamation introuvable:', selectedReclamation);
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
      `;
      errorMsg.textContent = 'Erreur: ID de réclamation introuvable';
      document.body.appendChild(errorMsg);
      setTimeout(() => {
        document.body.removeChild(errorMsg);
      }, 3000);
      return;
    }
    
    console.log('🔄 Mise à jour du statut pour la réclamation:', reclamationId);
    console.log('📋 Données:', { admin_id: user.id || user.ID, nouveau_statut: actionData.nouveau_statut });
    
    try {
      await axios.put(`${API_URL}/reclamations/${reclamationId}/statut`, {
        admin_id: user.id || user.ID,
        nouveau_statut: actionData.nouveau_statut,
        commentaire: actionData.commentaire
      });
      setShowModal(false);
      setActionData({ nouveau_statut: '', commentaire: '' });
      loadData();
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
      `;
      successMsg.textContent = 'Statut mis à jour avec succès!';
      document.body.appendChild(successMsg);
      setTimeout(() => {
        successMsg.remove();
      }, 3000);
    } catch (error) {
      console.error('Erreur:', error);
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
      `;
      errorMsg.textContent = 'Erreur lors de la mise à jour';
      document.body.appendChild(errorMsg);
      setTimeout(() => {
        errorMsg.remove();
      }, 3000);
    }
  };

  const handleAssignResponsible = async (reclamationId, adminId) => {
    if (!reclamationId || !adminId) {
      console.error('ID de réclamation ou admin manquant:', { reclamationId, adminId });
      return;
    }
    
    try {
      await axios.put(`${API_URL}/reclamations/${reclamationId}/responsable`, {
        admin_id: adminId
      });
      loadData();
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
      `;
      successMsg.textContent = 'Responsable attribué avec succès!';
      document.body.appendChild(successMsg);
      setTimeout(() => {
        successMsg.remove();
      }, 3000);
    } catch (error) {
      console.error('Erreur:', error);
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
      `;
      errorMsg.textContent = 'Erreur lors de l\'attribution';
      document.body.appendChild(errorMsg);
      setTimeout(() => {
        errorMsg.remove();
      }, 3000);
    }
  };

  const openModal = (reclamation) => {
    setSelectedReclamation(reclamation);
    setActionData({ nouveau_statut: reclamation.statut, commentaire: '' });
    setShowModal(true);
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
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b' }}>

            <SettingsIcon size={28} color="white" />
            Tableau de bord Administrateur
          </h1>
          <div className="header-actions">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
              <UserIcon size={18} color="#475569" />
              {user.nom || user.NOM} {user.prenom || user.PRENOM} ({user.role || user.ROLE})
            </span>
            <button className="btn btn-secondary" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogoutIcon size={18} color="white" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="container dashboard admin-dashboard">
        {statistiques && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StatsIcon size={16} color="white" />
                Total Réclamations
              </h3>
              <div className="value">{statistiques.total_reclamations}</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(244, 114, 182, 0.3)', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertIcon size={16} color="white" />
                En Attente
              </h3>
              <div className="value">{statistiques.en_attente}</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(96, 165, 250, 0.3)', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SettingsIcon size={16} color="white" />
                En Cours
              </h3>
              <div className="value">{statistiques.en_cours}</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(52, 211, 153, 0.3)', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon size={16} color="white" />
                Résolues
              </h3>
              <div className="value">{statistiques.resolues}</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(251, 191, 36, 0.3)', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={16} color="white" />
                Temps Moyen
              </h3>
              <div className="value">{statistiques.temps_moyen_jours?.toFixed(1) || 0} jours</div>
            </div>
          </div>
        )}

        {urgentes.length > 0 && (
          <div className="card" style={{ 
            border: '2px solid rgba(255, 255, 255, 0.4)',
            background: 'rgba(248, 113, 113, 0.25)',
            boxShadow: '0 4px 16px rgba(248, 113, 113, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}>
            <h3 style={{ color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
              <AlertIcon size={20} color="white" />
              Réclamations Urgentes ({urgentes.length})
            </h3>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titre</th>
                  <th>Étudiant</th>
                  <th>Jours d'attente</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {urgentes.slice(0, 5).map((reclamation, index) => (
                  <tr key={reclamation.reclamation_id || reclamation.RECLAMATION_ID || reclamation.id || reclamation.ID || `urgent-${index}`}>
                    <td>#{reclamation.reclamation_id}</td>
                    <td>{reclamation.titre}</td>
                    <td>{reclamation.etudiant_nom}</td>
                    <td>{reclamation.jours_attente} jours</td>
                    <td>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => openModal(reclamation)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <EditIcon size={16} color="white" />
                        Traiter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="filters">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FilterIcon size={20} color="white" />
            
            <select 
              value={filters.statut} 
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
            >
              <option value="">Tous les statuts</option>
              <option value="EN ATTENTE">En Attente</option>
              <option value="EN COURS">En Cours</option>
              <option value="RESOLUE">Résolue</option>
              <option value="FERMEE">Fermée</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TagIcon size={20} color="white" />
            <select 
              value={filters.type} 
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">Tous les types</option>
              <option value="ACADEMIQUE">Académique</option>
              <option value="ADMINISTRATIF">Administratif</option>
              <option value="TECHNIQUE">Technique</option>
            </select>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '20px', color: 'white', fontSize: '20px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
            <ListIcon size={24} color="white" />
            Toutes les Réclamations
          </h3>
          {reclamations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255, 255, 255, 0.8)' }}>
              <EmptyIcon size={64} color="rgba(255, 255, 255, 0.4)" />
              <h3 style={{ color: 'white', marginBottom: '8px', marginTop: '16px', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>Aucune réclamation</h3>
              <p style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>Aucune réclamation ne correspond aux filtres sélectionnés.</p>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titre</th>
                  <th>Type</th>
                  <th>Étudiant</th>
                  <th>Statut</th>
                  <th>Priorité</th>
                  <th>Date</th>
                  <th>Responsable</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reclamations.map((reclamation, index) => (
                  <tr key={reclamation.reclamation_id || reclamation.RECLAMATION_ID || reclamation.id || reclamation.ID || `reclamation-${index}`}>
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
                    <td style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UserIcon size={16} color="#475569" />
                      {reclamation.etudiant_nom}
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
                    <td>
                      {reclamation.admin_assignee ? (
                        <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <UserIcon size={16} color="rgba(255, 255, 255, 0.9)" />
                          {reclamation.admin_assignee}
                        </span>
                      ) : (
                        <select 
                          onChange={(e) => {
                            const reclamationId = reclamation.reclamation_id || reclamation.RECLAMATION_ID || reclamation.id || reclamation.ID;
                            if (e.target.value && reclamationId) {
                              handleAssignResponsible(reclamationId, e.target.value);
                            }
                          }}
                          defaultValue=""
                          style={{ 
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '2px solid #e2e8f0',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">Assigner un responsable...</option>
                          {admins.map(admin => (
                            <option key={admin.id || admin.ID} value={admin.id || admin.ID}>
                              {admin.nom || admin.NOM} {admin.prenom || admin.PRENOM}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => openModal(reclamation)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <EditIcon size={16} color="white" />
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && selectedReclamation && (
        <div className="modal" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
                  <EditIcon size={24} color="white" />
                  Modifier la réclamation #{selectedReclamation.reclamation_id}
                </h3>
                <button className="close-btn" onClick={() => setShowModal(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CloseIcon size={24} color="#999" />
                </button>
              </div>
              <div className="form-group">
                <label>
                  <TagIcon size={18} color="white" />
                  Nouveau statut
                </label>
                <select
                  value={actionData.nouveau_statut}
                  onChange={(e) => setActionData({ ...actionData, nouveau_statut: e.target.value })}
                >
                  <option value="EN ATTENTE">En Attente</option>
                  <option value="EN COURS">En Cours</option>
                  <option value="RESOLUE">Résolue</option>
                  <option value="FERMEE">Fermée</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <DocumentIcon size={18} color="white" />
                  Commentaire
                </label>
                <textarea
                  value={actionData.commentaire}
                  onChange={(e) => setActionData({ ...actionData, commentaire: e.target.value })}
                  placeholder="Ajouter un commentaire pour l'étudiant..."
                  rows="4"
                />
              </div>
              <button className="btn btn-primary" onClick={handleStatusChange} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <SaveIcon size={18} color="white" />
                Enregistrer les modifications
              </button>
            </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

