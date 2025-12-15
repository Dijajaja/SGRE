import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { SettingsIcon, LogoutIcon, UserIcon, StatsIcon, AlertIcon, EditIcon, FilterIcon, TagIcon, CalendarIcon, ListIcon, EmptyIcon, SaveIcon, DocumentIcon, CloseIcon, CheckIcon } from './Icons';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Composant Toast pour les notifications
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    error: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    info: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: bgColors[type] || bgColors.info,
      color: 'white',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      zIndex: 10000,
      fontWeight: 600,
      minWidth: '300px',
      animation: 'slideInRight 0.3s ease'
    }}>
      {message}
    </div>
  );
};

function AdminDashboard({ user, onLogout }) {
  const [reclamations, setReclamations] = useState([]);
  const [statistiques, setStatistiques] = useState({
    total_reclamations: 0,
    en_attente: 0,
    en_cours: 0,
    resolues: 0,
    temps_moyen_jours: 0
  });
  const [urgentes, setUrgentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    statut: '',
    type: '',
    mesReclamations: false // Nouveau filtre pour voir seulement mes réclamations
  });
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionData, setActionData] = useState({
    nouveau_statut: '',
    commentaire: ''
  });
  const [admins, setAdmins] = useState([]);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    loadAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters]);

  // Charger les admins une seule fois au montage
  useEffect(() => {
    loadAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.type) params.append('type', filters.type);
      // Ajouter le filtre admin_id si "Mes réclamations" est activé
      const userId = user.id || user.ID;
      if (filters.mesReclamations && userId) {
        params.append('admin_id', userId);
        console.log('🔍 Filtre "Mes réclamations" activé pour admin_id:', userId);
      } else {
        console.log('🔍 Affichage de toutes les réclamations (filtre désactivé)');
      }

      console.log('📡 URL de la requête:', `${API_URL}/reclamations?${params.toString()}`);

      const [reclamationsRes, statsRes, urgentesRes] = await Promise.allSettled([
        axios.get(`${API_URL}/reclamations?${params.toString()}`),
        axios.get(`${API_URL}/statistiques/globales`),
        axios.get(`${API_URL}/statistiques/urgentes`)
      ]);
      
      // Traiter les réclamations
      if (reclamationsRes.status === 'fulfilled') {
        const data = reclamationsRes.value.data;
        console.log('📥 Données reçues du backend:', data);
        console.log('📊 Nombre de réclamations:', data.length);
        data.forEach(rec => {
          const recId = rec.reclamation_id || rec.RECLAMATION_ID || rec.id || rec.ID;
          const adminId = rec.admin_assignee_id || rec.ADMIN_ASSIGNEE_ID;
          console.log(`  - Réclamation #${recId}: admin_assignee="${rec.admin_assignee || 'NULL'}", admin_assignee_id=${adminId || 'NULL'}, statut=${rec.statut || rec.STATUT}`);
        });
        setReclamations(data);
      } else {
        console.error('❌ Erreur lors du chargement des réclamations:', reclamationsRes.reason);
        setReclamations([]);
      }
      
      // Traiter les statistiques
      if (statsRes.status === 'fulfilled') {
        const response = statsRes.value;
        console.log('📈 Réponse complète des statistiques:', response);
        console.log('📈 Status HTTP:', response.status);
        console.log('📈 Données brutes:', response.data);
        
        if (response.data) {
          const statsData = response.data;
          console.log('📈 Statistiques reçues:', statsData);
          
          const newStats = {
            total_reclamations: Number(statsData.total_reclamations) || 0,
            en_attente: Number(statsData.en_attente) || 0,
            en_cours: Number(statsData.en_cours) || 0,
            resolues: Number(statsData.resolues) || 0,
            temps_moyen_jours: Number(statsData.temps_moyen_jours) || 0
          };
          
          console.log('📈 Statistiques formatées pour le state:', newStats);
          setStatistiques(newStats);
        } else {
          console.warn('⚠️ Pas de données dans la réponse des statistiques');
        }
      } else {
        console.error('❌ Erreur lors du chargement des statistiques:', statsRes.reason);
        console.error('❌ Détails de l\'erreur:', statsRes.reason?.response?.data);
        console.error('❌ Status HTTP:', statsRes.reason?.response?.status);
        // Garder les valeurs par défaut déjà initialisées
      }
      
      // Traiter les réclamations urgentes
      if (urgentesRes.status === 'fulfilled') {
        console.log('🚨 Réclamations urgentes:', urgentesRes.value.data);
        setUrgentes(urgentesRes.value.data || []);
      } else {
        console.error('❌ Erreur lors du chargement des réclamations urgentes:', urgentesRes.reason);
        setUrgentes([]);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      showToast('Erreur lors du chargement des données', 'error');
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

  // Validation des transitions de statut
  const isValidStatusTransition = (ancienStatut, nouveauStatut) => {
    const transitionsValides = {
      'EN ATTENTE': ['EN COURS', 'RESOLUE', 'FERMEE'],
      'EN COURS': ['RESOLUE', 'FERMEE', 'EN ATTENTE'],
      'RESOLUE': ['FERMEE'],
      'FERMEE': [] // Une réclamation fermée ne peut plus changer de statut
    };
    
    return transitionsValides[ancienStatut]?.includes(nouveauStatut) ?? false;
  };

  const handleStatusChange = async () => {
    if (!selectedReclamation) {
      showToast('Aucune réclamation sélectionnée', 'error');
      return;
    }
    
    const reclamationId = selectedReclamation.reclamation_id || selectedReclamation.RECLAMATION_ID || selectedReclamation.id || selectedReclamation.ID;
    if (!reclamationId) {
      showToast('Erreur: ID de réclamation introuvable', 'error');
      return;
    }

    // Validation du nouveau statut
    if (!actionData.nouveau_statut) {
      showToast('Veuillez sélectionner un nouveau statut', 'warning');
      return;
    }

    // Validation de la transition
    const ancienStatut = selectedReclamation.statut;
    if (!isValidStatusTransition(ancienStatut, actionData.nouveau_statut)) {
      showToast(`Transition invalide: impossible de passer de "${ancienStatut}" à "${actionData.nouveau_statut}"`, 'error');
      return;
    }

    // Confirmation pour certaines transitions importantes
    if (actionData.nouveau_statut === 'FERMEE' && ancienStatut !== 'FERMEE') {
      if (!window.confirm('Êtes-vous sûr de vouloir fermer cette réclamation ? Cette action est définitive.')) {
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      await axios.put(`${API_URL}/reclamations/${reclamationId}/statut`, {
        admin_id: user.id || user.ID,
        nouveau_statut: actionData.nouveau_statut,
        commentaire: actionData.commentaire || null
      });
      setShowModal(false);
      setActionData({ nouveau_statut: '', commentaire: '' });
      setSelectedReclamation(null);
      await loadData();
      showToast(`Statut mis à jour avec succès: ${actionData.nouveau_statut}`, 'success');
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de la mise à jour';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignResponsible = async (reclamationId, adminId) => {
    if (!reclamationId || !adminId) {
      showToast('ID de réclamation ou admin manquant', 'error');
      return;
    }
    
    // Trouver la réclamation actuelle pour vérifier si c'est un changement
    const currentReclamation = reclamations.find(rec => {
      const recId = rec.reclamation_id || rec.RECLAMATION_ID || rec.id || rec.ID;
      return recId === parseInt(reclamationId);
    });
    
    const currentAssigneeId = currentReclamation?.admin_assignee_id ? parseInt(currentReclamation.admin_assignee_id) : null;
    
    // Si c'est le même responsable, ne rien faire
    if (currentAssigneeId === parseInt(adminId)) {
      return;
    }
    
    const admin = admins.find(a => (a.id || a.ID) === parseInt(adminId));
    const adminName = admin ? `${admin.nom || admin.NOM} ${admin.prenom || admin.PRENOM}` : 'Responsable';
    
    // Mise à jour optimiste de l'interface
    setReclamations(prevReclamations => 
      prevReclamations.map(rec => {
        const recId = rec.reclamation_id || rec.RECLAMATION_ID || rec.id || rec.ID;
        if (recId === parseInt(reclamationId)) {
          return {
            ...rec,
            admin_assignee: adminName,
            admin_assignee_id: parseInt(adminId),
            statut: rec.statut === 'EN ATTENTE' ? 'EN COURS' : rec.statut
          };
        }
        return rec;
      })
    );
    
    try {
      const response = await axios.put(`${API_URL}/reclamations/${reclamationId}/responsable`, {
        admin_id: adminId
      });
      
      console.log('✅ Réponse attribution:', response.data);
      
      // Attendre un peu pour laisser Oracle se mettre à jour
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Recharger les données pour s'assurer de la cohérence
      await loadData();
      
      const actionText = currentAssigneeId ? 'changé' : 'attribué';
      showToast(`Responsable ${actionText} avec succès: ${adminName}`, 'success');
    } catch (error) {
      console.error('❌ Erreur lors de l\'attribution:', error);
      console.error('❌ Détails:', error.response?.data);
      
      // Annuler la mise à jour optimiste en cas d'erreur
      await loadData();
      
      const errorMessage = error.response?.data?.error || error.message || 'Erreur lors de l\'attribution';
      showToast(errorMessage, 'error');
    }
  };

  const openModal = (reclamation) => {
    setSelectedReclamation(reclamation);
    setActionData({ 
      nouveau_statut: reclamation.statut || reclamation.STATUT || '', 
      commentaire: '' 
    });
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
    return (
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        color: 'white',
        fontSize: '18px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          Chargement des données...
        </div>
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
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
        {/* Debug: Afficher les statistiques dans la console */}
        {console.log('🔍 Statistiques dans le render:', statistiques)}
        
        <div className="stats-grid">
            <div className="stat-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StatsIcon size={16} color="white" />
                Total Réclamations
              </h3>
              <div className="value">{statistiques?.total_reclamations ?? 0}</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(244, 114, 182, 0.3)', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertIcon size={16} color="white" />
                En Attente
              </h3>
              <div className="value">{statistiques?.en_attente ?? 0}</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(96, 165, 250, 0.3)', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SettingsIcon size={16} color="white" />
                En Cours
              </h3>
              <div className="value">{statistiques?.en_cours ?? 0}</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(52, 211, 153, 0.3)', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckIcon size={16} color="white" />
                Résolues
              </h3>
              <div className="value">{statistiques?.resolues ?? 0}</div>
            </div>
            <div className="stat-card" style={{ background: 'rgba(251, 191, 36, 0.3)', border: '1px solid rgba(255, 255, 255, 0.4)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={16} color="white" />
                Temps Moyen
              </h3>
              <div className="value">{(statistiques?.temps_moyen_jours ?? 0).toFixed(1)} jours</div>
            </div>
          </div>

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', padding: '8px 12px', background: filters.mesReclamations ? 'rgba(34, 197, 94, 0.2)' : 'transparent', borderRadius: '8px', border: filters.mesReclamations ? '2px solid rgba(34, 197, 94, 0.5)' : '2px solid transparent' }}>
            <input
              type="checkbox"
              id="mesReclamations"
              checked={filters.mesReclamations}
              onChange={(e) => {
                console.log('✅ Checkbox "Mes réclamations" changée:', e.target.checked);
                setFilters({ ...filters, mesReclamations: e.target.checked });
              }}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="mesReclamations" style={{ color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
              <UserIcon size={16} color="white" />
              Mes réclamations uniquement
              {filters.mesReclamations && (user.id || user.ID) && (
                <span style={{ fontSize: '12px', opacity: 0.8 }}>(Admin #{user.id || user.ID})</span>
              )}
            </label>
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
                    <td style={{ color: 'rgba(255, 255, 255, 0.8)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CalendarIcon size={16} color="rgba(255, 255, 255, 0.8)" />
                        {new Date(reclamation.date_creation || reclamation.DATE_CREATION).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.7 }}>
                        {(() => {
                          const date = new Date(reclamation.date_creation || reclamation.DATE_CREATION);
                          const now = new Date();
                          const diffTime = Math.abs(now - date);
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return diffDays === 0 ? "Aujourd'hui" : diffDays === 1 ? "Hier" : `Il y a ${diffDays} jours`;
                        })()}
                      </div>
                    </td>
                    <td>
                      {(() => {
                        const isClosedOrResolved = reclamation.statut === 'FERMEE' || reclamation.statut === 'RESOLUE';
                        
                        // Si fermée ou résolue, afficher seulement le nom du responsable (lecture seule)
                        if (isClosedOrResolved) {
                          let displayName = reclamation.admin_assignee;
                          
                          if (!displayName && reclamation.admin_assignee_id) {
                            const assignedAdmin = admins.find(a => {
                              const adminId = a.id || a.ID;
                              const assigneeId = parseInt(reclamation.admin_assignee_id);
                              return adminId === assigneeId;
                            });
                            
                            if (assignedAdmin) {
                              displayName = `${assignedAdmin.nom || assignedAdmin.NOM} ${assignedAdmin.prenom || assignedAdmin.PRENOM}`;
                            } else {
                              displayName = `Admin #${reclamation.admin_assignee_id}`;
                            }
                          }
                          
                          return displayName ? (
                            <span style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <UserIcon size={16} color="rgba(255, 255, 255, 0.9)" />
                              {displayName}
                            </span>
                          ) : (
                            <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic', fontSize: '13px' }}>
                              Non assigné
                            </span>
                          );
                        }
                        
                        // Pour les réclamations actives, afficher un dropdown pour attribuer/changer le responsable
                        const currentAssigneeId = reclamation.admin_assignee_id ? parseInt(reclamation.admin_assignee_id) : null;
                        let displayName = reclamation.admin_assignee;
                        
                        // Si pas de nom mais un ID, chercher dans la liste des admins
                        if (!displayName && reclamation.admin_assignee_id) {
                          const assignedAdmin = admins.find(a => {
                            const adminId = a.id || a.ID;
                            const assigneeId = parseInt(reclamation.admin_assignee_id);
                            return adminId === assigneeId;
                          });
                          
                          if (assignedAdmin) {
                            displayName = `${assignedAdmin.nom || assignedAdmin.NOM} ${assignedAdmin.prenom || assignedAdmin.PRENOM}`;
                          }
                        }
                        
                        return (
                          <select 
                            onChange={(e) => {
                              const reclamationId = reclamation.reclamation_id || reclamation.RECLAMATION_ID || reclamation.id || reclamation.ID;
                              if (e.target.value && reclamationId) {
                                handleAssignResponsible(reclamationId, e.target.value);
                              }
                            }}
                            value={currentAssigneeId || ""}
                            style={{ 
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: '2px solid #e2e8f0',
                              fontSize: '13px',
                              cursor: 'pointer',
                              backgroundColor: 'white',
                              color: '#1e293b',
                              minWidth: '200px'
                            }}
                          >
                            <option value="">{displayName ? "Changer le responsable..." : "Assigner un responsable..."}</option>
                            {admins.map(admin => {
                              const adminId = admin.id || admin.ID;
                              const isSelected = adminId === currentAssigneeId;
                              return (
                                <option key={adminId} value={adminId}>
                                  {admin.nom || admin.NOM} {admin.prenom || admin.PRENOM}
                                  {isSelected ? ' (actuel)' : ''}
                                </option>
                              );
                            })}
                          </select>
                        );
                      })()}
                    </td>
                    <td>
                      {(() => {
                        const isClosedOrResolved = reclamation.statut === 'FERMEE' || reclamation.statut === 'RESOLUE';
                        
                        if (isClosedOrResolved) {
                          // Pour les réclamations fermées/résolues, afficher un bouton "Voir" en lecture seule
                          return (
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => openModal(reclamation)}
                              style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8 }}
                              title="Voir les détails (lecture seule)"
                            >
                              <DocumentIcon size={16} color="white" />
                              Voir
                            </button>
                          );
                        }
                        
                        // Pour les autres statuts, afficher le bouton "Modifier"
                        return (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => openModal(reclamation)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <EditIcon size={16} color="white" />
                            Modifier
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && selectedReclamation && (() => {
        const isReadOnly = selectedReclamation.statut === 'FERMEE' || selectedReclamation.statut === 'RESOLUE';
        const currentStatut = selectedReclamation.statut || selectedReclamation.STATUT;
        
        return (
          <div className="modal" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
                  {isReadOnly ? <DocumentIcon size={24} color="white" /> : <EditIcon size={24} color="white" />}
                  {isReadOnly ? 'Détails de la réclamation' : 'Modifier la réclamation'} #{selectedReclamation.reclamation_id}
                </h3>
                <button className="close-btn" onClick={() => setShowModal(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CloseIcon size={24} color="#999" />
                </button>
              </div>
              
              {/* Informations de la réclamation */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ marginBottom: '8px', display: 'block', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <strong>Titre:</strong> {selectedReclamation.titre}
                </label>
                <label style={{ marginBottom: '8px', display: 'block', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <strong>Type:</strong> {selectedReclamation.type_reclamation}
                </label>
                <label style={{ marginBottom: '8px', display: 'block', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <strong>Étudiant:</strong> {selectedReclamation.etudiant_nom}
                </label>
                <label style={{ marginBottom: '8px', display: 'block', color: 'rgba(255, 255, 255, 0.9)' }}>
                  <strong>Statut actuel:</strong> 
                  <span className={`badge ${getStatusBadge(currentStatut)}`} style={{ marginLeft: '8px' }}>
                    {currentStatut}
                  </span>
                </label>
                {selectedReclamation.admin_assignee && (
                  <label style={{ marginBottom: '8px', display: 'block', color: 'rgba(255, 255, 255, 0.9)' }}>
                    <strong>Responsable:</strong> {selectedReclamation.admin_assignee}
                  </label>
                )}
              </div>
              
              {!isReadOnly && (
                <>
                  <div className="form-group">
                    <label>
                      <TagIcon size={18} color="white" />
                      Nouveau statut
                      <span style={{ fontSize: '12px', opacity: 0.8, marginLeft: '8px' }}>
                        (Actuel: {currentStatut})
                      </span>
                    </label>
                    <select
                      value={actionData.nouveau_statut}
                      onChange={(e) => setActionData({ ...actionData, nouveau_statut: e.target.value })}
                    >
                      {(() => {
                        const validTransitions = {
                          'EN ATTENTE': ['EN COURS', 'RESOLUE', 'FERMEE'],
                          'EN COURS': ['RESOLUE', 'FERMEE', 'EN ATTENTE'],
                          'RESOLUE': ['FERMEE'],
                          'FERMEE': []
                        };
                        const allowed = validTransitions[currentStatut] || [];
                        return (
                          <>
                            <option value="">-- Sélectionner un statut --</option>
                            {allowed.map(statut => (
                              <option key={statut} value={statut}>
                                {statut === 'EN ATTENTE' ? 'En Attente' : 
                                 statut === 'EN COURS' ? 'En Cours' : 
                                 statut === 'RESOLUE' ? 'Résolue' : 'Fermée'}
                              </option>
                            ))}
                          </>
                        );
                      })()}
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
                  <button 
                    className="btn btn-primary" 
                    onClick={handleStatusChange} 
                    disabled={isSubmitting || !actionData.nouveau_statut}
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px',
                      opacity: (isSubmitting || !actionData.nouveau_statut) ? 0.6 : 1,
                      cursor: (isSubmitting || !actionData.nouveau_statut) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <SaveIcon size={18} color="white" />
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </>
              )}
              
              {isReadOnly && (
                <div style={{ 
                  padding: '16px', 
                  background: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '8px', 
                  marginTop: '16px',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                  <p style={{ margin: 0 }}>
                    Cette réclamation est <strong>{currentStatut.toLowerCase()}</strong> et ne peut plus être modifiée.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default AdminDashboard;

