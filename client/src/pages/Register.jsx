import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Importamos las herramientas de Firebase
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Creamos el usuario en Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Le ponemos el nombre de usuario (displayName) para que aparezca en el Navbar
      await updateProfile(user, { displayName: username });

      // 3. Mandamos el mail de verificación
      await sendEmailVerification(user);
      
      alert(`¡Cuenta creada con éxito! 📧 Enviamos un link de verificación a ${email}. Por favor, verificalo para poder iniciar sesión.`);
      
      // Lo mandamos al login para que entre una vez verificado
      navigate('/login');
    } catch (error) {
      console.error(error);
      // Un poco de manejo de errores amigable
      if (error.code === 'auth/email-already-in-use') {
        alert("Este correo ya está registrado. Probá iniciando sesión.");
      } else if (error.code === 'auth/weak-password') {
        alert("La contraseña es muy corta (mínimo 6 caracteres).");
      } else {
        alert("Hubo un error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#8b5cf6', fontSize: '2.2rem', margin: 0 }}>Unite a GameHub</h2>
          <p style={{ color: '#9ca3af', marginTop: '10px' }}>Tu carrera profesional empieza acá</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Nombre de Usuario</label>
            <input 
              type="text" 
              placeholder="Ej: Tomi_Gamer" 
              style={inputStyle} 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

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
              placeholder="Mínimo 6 caracteres" 
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
            {loading ? 'CREANDO CUENTA...' : 'REGISTRARME'}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
            ¿Ya sos parte? <span onClick={() => navigate('/login')} style={linkStyle}>Iniciá sesión</span>
          </p>
        </div>
      </div>
    </div>
  );
};

/* --- ESTILOS --- */
const containerStyle = {
  display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 70px)', padding: '20px', backgroundColor: '#0f0f12'
};

const cardStyle = {
  backgroundColor: '#16161e', padding: '40px', borderRadius: '24px', border: '1px solid #2a2a35', width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
};

const labelStyle = { display: 'block', color: '#e5e7eb', marginBottom: '8px', fontSize: '0.9rem' };

const inputStyle = {
  width: '100%', padding: '14px', borderRadius: '12px', backgroundColor: '#0f0f12', border: '1px solid #333', color: 'white', outline: 'none', boxSizing: 'border-box', fontSize: '1rem'
};

const buttonStyle = {
  width: '100%', padding: '16px', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px', transition: '0.3s', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
};

const linkStyle = {
  color: '#8b5cf6', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline', marginLeft: '5px'
};