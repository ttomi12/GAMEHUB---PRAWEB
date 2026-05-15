import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import Swal from 'sweetalert2';

export const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const alertStyle = {
    background: '#16161e',
    color: '#fff',
    confirmButtonColor: '#8b5cf6',
    borderRadius: '15px',
    border: '1px solid #2a2a35'
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user.emailVerified) {
        const response = await axios.post('https://gamehub-praweb.onrender.com/api/auth/firebase-sync', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || ''
        });

        const { user: mongoUser, token } = response.data;

        // --- SOLUCIÓN DISCORD: UNIÓN DE DATOS ---
        // Traemos lo que hay actualmente en el almacenamiento local
        const localData = JSON.parse(localStorage.getItem('user')) || {};
        
        const fullUserData = {
          ...localData,    // Mantenemos datos previos (Discord, etc.)
          ...mongoUser,    // Pisamos con lo nuevo del servidor
          token: token     // Aseguramos el token actualizado
        };

        console.log("Login Exitoso. Rol:", fullUserData.role);

        setUser(fullUserData);
        localStorage.setItem('user', JSON.stringify(fullUserData));

        Swal.fire({
          ...alertStyle,
          title: `¡Hola, ${fullUserData.username || 'de nuevo'}!`,
          text: 'Ingreso exitoso. ¡Preparate para la competencia!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        navigate(fullUserData.role === 'admin' ? '/admin' : '/');
      } else {
        Swal.fire({
          ...alertStyle,
          title: 'EMAIL NO VERIFICADO',
          text: 'Por favor, revisá tu casilla de correo y verificá tu cuenta antes de entrar.',
          icon: 'warning',
          iconColor: '#f59e0b'
        });
        await signOut(auth);
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        ...alertStyle,
        title: 'FALLÓ EL INGRESO',
        text: error.response?.data?.msg || "Credenciales incorrectas o problema de conexión.",
        icon: 'error',
        iconColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#8b5cf6', fontSize: '2.2rem', margin: '0 0 10px 0' }}>¡Qué bueno verte!</h2>
          <p style={{ color: '#9ca3af' }}>Ingresá para competir en los mejores torneos</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="tu@email.com" 
              style={inputStyle} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              style={inputStyle} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...buttonStyle,
              backgroundColor: loading ? '#444' : '#8b5cf6',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'COMPROBANDO...' : 'ENTRAR'}
          </button>
        </form>

        <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #2a2a35', paddingTop: '20px' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            ¿Todavía no tenés cuenta? <br />
            <span 
              onClick={() => navigate('/register')} 
              style={{ color: '#8b5cf6', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Crea una acá en 1 minuto
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 70px)', padding: '20px', backgroundColor: '#0f0f12' };
const cardStyle = { backgroundColor: '#16161e', padding: '40px', borderRadius: '24px', border: '1px solid #2a2a35', width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' };
const labelStyle = { display: 'block', color: '#e5e7eb', marginBottom: '8px', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f0f12', border: '1px solid #333', color: 'white', outline: 'none', boxSizing: 'border-box', fontSize: '1rem' };
const buttonStyle = { width: '100%', padding: '16px', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px', transition: '0.3s', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' };