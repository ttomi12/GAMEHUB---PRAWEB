import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

export const TournamentDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  // Configuración de estilo para GameHub
  const alertStyle = {
    background: '#16161e',
    color: '#fff',
    confirmButtonColor: '#8b5cf6',
    borderRadius: '15px',
    border: '1px solid #2a2a35'
  };

  const sessionUser = user || JSON.parse(localStorage.getItem('user'));
  const myId = sessionUser?._id || sessionUser?.id;

  useEffect(() => {
    const getTournament = async () => {
      try {
        const res = await axios.get(`https://gamehub-praweb.onrender.com/api/tournaments/${id}`);
        setTournament(res.data);
      } catch (error) {
        console.error("Error al traer el torneo:", error);
      } finally {
        setLoading(false);
      }
    };

    getTournament();
  }, [id]);

  // --- 🆘 CORRECCIÓN CRÍTICA AQUÍ ---
  // Forzamos a que ambos IDs se conviertan a String() antes de compararlos.
  // Esto soluciona problemas si uno es un ObjectId de MongoDB y el otro es un String simple.
  const yaInscripto = tournament?.players?.some(p => {
    const playerId = typeof p === 'object' ? p._id : p;
    return String(playerId) === String(myId);
  });

  const cupoLleno = tournament?.players?.length >= tournament?.maxPlayers;
  
  // Comprobar si el torneo ya pasó (fecha es futura, así que esto debería dar false)
  const esFechaPasada = tournament ? new Date(tournament.date) < new Date().setHours(0,0,0,0) : false;

  const handleInscripcion = async () => {
    if (!sessionUser || !sessionUser.token) {
      Swal.fire({
        ...alertStyle,
        title: '¡ALTO AHÍ!',
        text: 'Debes iniciar sesión para inscribirte.',
        icon: 'warning',
        iconColor: '#f59e0b'
      });
      navigate('/login');
      return;
    }

    const nombreJuegoBusqueda = tournament.game.toLowerCase().replace(/\s+/g, '');
    const tieneIdJuego = sessionUser.gameIds && sessionUser.gameIds[nombreJuegoBusqueda];

    if (!tieneIdJuego) {
      return Swal.fire({
        ...alertStyle,
        title: 'FALTA TU ID',
        text: `Debes configurar tu ID de ${tournament.game} en tu perfil antes de inscribirte.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'IR AL PERFIL',
        cancelButtonText: 'CANCELAR'
      }).then((result) => {
        if (result.isConfirmed) navigate('/profile');
      });
    }

    if (yaInscripto) return;

    setRegistering(true);
    try {
      const res = await axios.post(
        `https://gamehub-praweb.onrender.com/api/tournaments/${id}/join`, 
        {}, 
        { headers: { 'x-auth-token': sessionUser.token } }
      );

      Swal.fire({
        ...alertStyle,
        title: '¡LISTO!',
        text: 'Inscripción exitosa. ¡Mucha suerte!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      setTournament(res.data.tournament || res.data);

    } catch (error) {
      Swal.fire({
        ...alertStyle,
        title: 'ERROR',
        text: error.response?.data?.msg || "Hubo un error al procesar tu inscripción.",
        icon: 'error'
      });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div style={msgStyle}>Cargando torneo...</div>;
  if (!tournament) return <div style={msgStyle}>El torneo no existe o fue eliminado.</div>;

  return (
    <div style={containerStyle}>
      <div style={headerStyle(tournament.image)}>
        <div style={overlayStyle}>
          <h1 style={titleStyle}>{tournament.name}</h1>
          <span style={badgeStyle}>{tournament.game}</span>
        </div>
      </div>

      <div style={contentStyle}>
        <div style={infoGrid}>
          <div style={cardStyle}>
            <h3 style={cardTitle}>📅 Fecha y Hora</h3>
            <p style={cardText}>{tournament.date} - {tournament.time}</p>
          </div>
          <div style={cardStyle}>
            <h3 style={cardTitle}>💰 Premio</h3>
            <p style={{ color: '#10b981', fontWeight: 'bold', fontSize: 'clamp(1rem, 4vw, 1.2rem)', margin: '5px 0 0 0' }}>
              {tournament.prize}
            </p>
          </div>
          <div style={cardStyle}>
            <h3 style={cardTitle}>👥 Cupos</h3>
            <p style={cardText}>{tournament.players?.length || 0} / {tournament.maxPlayers} inscriptos</p>
          </div>
        </div>

        {/* CONTENEDOR DE ACCIONES PRINCIPALES */}
        <div style={actionContainer}>
          
          {esFechaPasada ? (
            <button disabled style={btnDisabledStyle}>TORNEO FINALIZADO</button>
          ) : cupoLleno && !yaInscripto ? (
            <button disabled style={btnDisabledStyle}>CUPO LLENO</button>
          ) : (
            <button 
              onClick={handleInscripcion}
              disabled={registering || yaInscripto}
              style={yaInscripto ? btnDoneStyle : btnStyle}
            >
              {registering ? 'PROCESANDO...' : yaInscripto ? '✓ YA ESTÁS INSCRIPTO' : 'INSCRIBIRME AHORA'}
            </button>
          )}

          {/* ESTE BOTÓN ES EL QUE DEBE APARECER ABAJO (Asegúrate de que la condición lo permita) */}
          {yaInscripto && !esFechaPasada && (
            <button 
              onClick={() => navigate(`/tournament/${tournament._id || id}/matchroom`)}
              style={btnMatchroomStyle}
            >
              💬 ENTRAR AL MATCHROOM (CHAT EN VIVO)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS OPTIMIZADOS PARA MÓVIL ---

const msgStyle = { 
  textAlign: 'center', 
  padding: 'clamp(50px, 10vw, 100px)', 
  fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', 
  color: '#8b5cf6',
  fontFamily: 'Inter, sans-serif'
};

const containerStyle = { 
  minHeight: '100vh', 
  backgroundColor: '#0f0f12', 
  paddingBottom: 'clamp(30px, 6vw, 50px)', 
  color: 'white',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box'
};

const headerStyle = (img) => ({
  height: 'clamp(220px, 40vh, 400px)', // Altura dinámica
  backgroundImage: `url(${img})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative'
});

const overlayStyle = {
  position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
  background: 'linear-gradient(to top, #0f0f12 5%, rgba(15,15,18,0.4) 50%, transparent)',
  display: 'flex', 
  flexDirection: 'column', 
  justifyContent: 'flex-end', 
  padding: 'clamp(20px, 5vw, 40px)',
  boxSizing: 'border-box'
};

const titleStyle = { 
  fontSize: 'clamp(1.5rem, 6vw, 3rem)', // Escalado fluido
  margin: '0 0 10px 0', 
  textTransform: 'uppercase', 
  letterSpacing: '2px', 
  fontWeight: '900',
  textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
};

const badgeStyle = { 
  backgroundColor: '#8b5cf6', 
  padding: 'clamp(4px, 2vw, 6px) clamp(10px, 3vw, 15px)', 
  borderRadius: '20px', 
  fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)', 
  width: 'fit-content', 
  fontWeight: '800',
  boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
};

const contentStyle = { 
  maxWidth: '900px', 
  margin: '0 auto', 
  padding: 'clamp(20px, 5vw, 40px) clamp(15px, 4vw, 20px)' 
};

const infoGrid = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', // Permite 2 columnas en celulares modernos o 1 en muy chicos
  gap: 'clamp(10px, 3vw, 20px)' 
};

const cardStyle = { 
  backgroundColor: '#16161e', 
  padding: 'clamp(15px, 4vw, 20px)', 
  borderRadius: '16px', 
  border: '1px solid #2a2a35', 
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

const cardTitle = {
  fontSize: 'clamp(0.85rem, 3vw, 1rem)',
  margin: '0 0 5px 0',
  color: '#9ca3af'
};

const cardText = {
  fontSize: 'clamp(0.85rem, 3vw, 1rem)',
  margin: '0',
  fontWeight: 'bold'
};

const actionContainer = { 
  marginTop: 'clamp(30px, 6vw, 40px)', 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  gap: 'clamp(15px, 4vw, 20px)',
  width: '100%'
};

// Base para todos los botones principales
const baseBtnStyle = {
  width: '100%',
  maxWidth: '400px', // Evita que en PC queden ridículamente anchos
  padding: 'clamp(15px, 4vw, 20px)',
  border: 'none',
  borderRadius: '12px',
  fontSize: 'clamp(0.9rem, 3.5vw, 1.2rem)',
  fontWeight: '900',
  boxSizing: 'border-box',
  textAlign: 'center',
  letterSpacing: '1px'
};

const btnStyle = { 
  ...baseBtnStyle,
  backgroundColor: '#8b5cf6', 
  color: 'white', 
  cursor: 'pointer', 
  transition: 'transform 0.2s, background-color 0.3s' 
};

const btnDoneStyle = { 
  ...baseBtnStyle,
  backgroundColor: '#10b981', 
  color: 'white', 
  cursor: 'not-allowed', 
  opacity: 0.9 
};

const btnDisabledStyle = { 
  ...baseBtnStyle,
  backgroundColor: '#2a2a35', 
  color: '#666', 
  cursor: 'not-allowed' 
};

const btnMatchroomStyle = {
  ...baseBtnStyle,
  backgroundColor: 'transparent',
  color: '#8b5cf6',
  border: '2px solid #8b5cf6',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)',
  textTransform: 'uppercase'
};