import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Login from './components/Login';
import Inscription from './components/Inscription';
import EtudiantDashboard from './components/EtudiantDashboard';
import AdminDashboard from './components/AdminDashboard';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    // Vérifier si un utilisateur est stocké dans le localStorage
    const storedUser = localStorage.getItem('user');
    const storedType = localStorage.getItem('userType');
    if (storedUser && storedType) {
      setUser(JSON.parse(storedUser));
      setUserType(storedType);
    }
  }, []);

  const handleLogin = (userData, type) => {
    setUser(userData);
    setUserType(type);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userType', type);
  };

  const handleLogout = () => {
    setUser(null);
    setUserType(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  };

  return (
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        {!user && <Navigation />}
        <Routes>
          <Route 
            path="/" 
            element={<Home />}
          />
          <Route 
            path="/about" 
            element={<About />}
          />
          <Route 
            path="/login" 
            element={
              user ? (
                <Navigate to={userType === 'admin' ? '/admin' : '/etudiant'} />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/inscription" 
            element={
              user && userType === 'etudiant' ? (
                <Navigate to="/etudiant" />
              ) : (
                <Inscription onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/etudiant" 
            element={
              user && userType === 'etudiant' ? (
                <EtudiantDashboard user={user} onLogout={handleLogout} />
              ) : user && userType === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          <Route 
            path="/admin" 
            element={
              user && userType === 'admin' ? (
                <AdminDashboard user={user} onLogout={handleLogout} />
              ) : user && userType === 'etudiant' ? (
                <Navigate to="/etudiant" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
        {!user && <Footer />}
      </div>
    </Router>
  );
}

export default App;

