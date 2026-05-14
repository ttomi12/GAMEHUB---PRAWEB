
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Importamos las herramientas de Firebase
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import Swal from 'sweetalert2'; // 1. Importamos SweetAlert2

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Configuración de estilo para GameHub
  const alertStyle = {
    background: '#16161e',
    color: '#fff',
    confirmButtonColor: '#8b5cf6',
    borderRadius: '24px',
    border: '1px solid #2a2a35'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Creamos el usuario en Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Le ponemos el nombre de usuario (displayName)
      await updateProfile(user, { displayName: username });

      // 3. Mandamos el mail de verificación
      await sendEmailVerification(user);
      
      // --- ALERTA DE ÉXITO ESTILIZADA ---
      await Swal.fire({
        ...alertStyle,
        title: '¡CUENTA CREADA!',
        html: `Enviamos un link de verificación a <b style="color: #8b5cf6">${email}</b>.<br><br>Por favor, verificalo para poder iniciar sesión.`,
        icon: 'success',
        iconColor: '#10b981'
      });
      
      navigate('/login');
    } catch (error) {
      console.error(error);
      
      // --- MANEJO DE ERRORES CON SWEETALERT ---
      let errorTitle = "ERROR";
      let errorText = "Hubo un problema al crear tu cuenta.";

      if (error.code === 'auth/email-already-in-use') {
        errorTitle = "CORREO EN USO";
        errorText = "Este correo ya está registrado. Probá iniciando sesión.";
      } else if (error.code === 'auth/weak-password') {
        errorTitle = "CONTRASEÑA DÉBIL";
        errorText = "La contraseña debe tener al menos 6 caracteres.";
      }

      Swal.fire({
        ...alertStyle,
        title: errorTitle,
        text: errorText,
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

/* --- ESTILOS (MANTENIDOS) --- */
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