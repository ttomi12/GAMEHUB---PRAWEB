import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebaseConfig'; 
import { onAuthStateChanged, signOut } from "firebase/auth";

// Componentes y Páginas
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import Tournaments from './pages/Tournaments';
import { TournamentDetail } from './pages/TournamentDetail';
import { Profile } from './pages/Profile';
import { Admin } from './pages/Admin';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // 1. Intentamos recuperar el usuario con el ROL de MongoDB desde el localStorage
        const savedUser = JSON.parse(localStorage.getItem('user'));
        
        if (savedUser && savedUser.email === firebaseUser.email) {
          // Si el usuario guardado coincide, lo usamos 
          setUser(savedUser);
        } else {
          // Si está en Firebase pero no en LocalStorage, ponemos datos base
          
          setUser({
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            uid: firebaseUser.uid,
            role: 'user' 
          });
        }
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
      setInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('user');
      alert("Sesión terminada.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // PANTALLA DE CARGA PROFESIONAL
  if (initializing) return (
    <div style={{ backgroundColor: '#0f0f12', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#8b5cf6' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ letterSpacing: '4px', animate: 'pulse 2s infinite' }}>CARGANDO GAMEHUB...</h2>
        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#444' }}>Verificando credenciales...</div>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <div style={{ backgroundColor: '#0f0f12', minHeight: '100vh', color: 'white' }}>
        <Navbar user={user} logout={logout} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tournaments/:gameName" element={<Tournaments />} />
            <Route path="/tournament/:id" element={<TournamentDetail user={user} />} />
            
            {/* Si ya está logueado, el Login y Register lo mandan al Home */}
            <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

            <Route 
              path="/profile" 
              element={user ? <Profile user={user} /> : <Navigate to="/login" />} 
            />

            {/* PROTECCIÓN DE RUTA ADMIN */}
            <Route 
              path="/admin" 
              element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} 
            />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

/* --- ESTILOS (Mantenemos la estética Gaming) --- */
const containerStyle = { padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: 'white' };
const profileCard = { textAlign: 'center', backgroundColor: '#16161e', padding: '30px', borderRadius: '20px', border: '1px solid #2a2a35', marginBottom: '40px' };
const avatarStyle = { width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #8b5cf6', objectFit: 'cover' };
const sectionStyle = { marginTop: '20px' };
const titleSection = { borderBottom: '2px solid #8b5cf6', paddingBottom: '10px', marginBottom: '20px', letterSpacing: '1px' };
const gridStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const cardLink = { textDecoration: 'none' };
const miniCard = { display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#16161e', padding: '15px', borderRadius: '12px', border: '1px solid #2a2a35', transition: '0.3s' };
const miniImg = { width: '100px', height: '60px', objectFit: 'cover', borderRadius: '8px' };
const emptyState = { textAlign: 'center', padding: '40px', backgroundColor: '#16161e', borderRadius: '15px', border: '1px dashed #444' };
const exploreBtn = { display: 'inline-block', backgroundColor: '#8b5cf6', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' };
const msgStyle = { textAlign: 'center', color: 'white', marginTop: '100px' };
const textCenter = { textAlign: 'center', color: '#aaa' };
