import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2'; // 1. Importamos SweetAlert2

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

  const yaInscripto = tournament?.players?.some(p => {
    const playerId = typeof p === 'object' ? p._id : p;
    return playerId === myId;
  });

  const handleInscripcion = async () => {
    if (!sessionUser || !sessionUser.token) {
      // --- ALERTA: LOGIN REQUERIDO ---
      Swal.fire({
        ...alertStyle,
        title: '¡ALTO AHÍ!',
        text: 'Debes iniciar sesión para inscribirte en este torneo.',
        icon: 'warning',
        iconColor: '#f59e0b'
      });
      navigate('/login');
      return;
    }

    if (yaInscripto) {
      // --- ALERTA: YA INSCRIPTO ---
      Swal.fire({
        ...alertStyle,
        title: 'AVISO',
        text: '¡Ya estás en la lista! No podés anotarte dos veces.',
        icon: 'info',
        iconColor: '#8b5cf6'
      });
      return;
    }

    setRegistering(true);
    try {
      const res = await axios.post(
        `https://gamehub-praweb.onrender.com/api/tournaments/${id}/join`, 
        {}, 
        { 
          headers: { 
            'x-auth-token': sessionUser.token 
          } 
        }
      );

      // --- ALERTA: ÉXITO ---
      Swal.fire({
        ...alertStyle,
        title: '¡LISTO!',
        text: 'Inscripción exitosa. ¡Mucha suerte en la competencia!',
        icon: 'success',
        iconColor: '#10b981'
      });
      
      setTournament(res.data.tournament || res.data);

    } catch (error) {
      console.error("Error al anotar:", error.response?.data || error.message);
      
      // --- ALERTA: ERROR ---
      Swal.fire({
        ...alertStyle,
        title: 'ERROR',
        text: error.response?.data?.msg || "Hubo un error al procesar tu inscripción.",
        icon: 'error',
        iconColor: '#ef4444'
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
            <h3>📅 Fecha y Hora</h3>
            <p>{tournament.date} - {tournament.time}</p>
          </div>
          <div style={cardStyle}>
            <h3>💰 Premio</h3>
            <p style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1.2rem' }}>
              {tournament.prize}
            </p>
          </div>
          <div style={cardStyle}>
            <h3>👥 Cupos</h3>
            <p>{tournament.players?.length || 0} / {tournament.maxPlayers} inscriptos</p>
          </div>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <button 
            onClick={handleInscripcion}
            disabled={registering || yaInscripto}
            style={yaInscripto ? btnDoneStyle : btnStyle}
          >
            {registering ? 'PROCESANDO...' : yaInscripto ? '✓ YA ESTÁS INSCRIPTO' : 'INSCRIBIRME AHORA'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ESTILOS (MANTENIDOS) ---
const msgStyle = { textAlign: 'center', padding: '100px', fontSize: '1.5rem', color: '#8b5cf6' };
const containerStyle = { minHeight: '100vh', backgroundColor: '#0f0f12', paddingBottom: '50px', color: 'white' };
const headerStyle = (img) => ({
  height: '400px',
  backgroundImage: `url(${img})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative'
});
const overlayStyle = {
  position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
  background: 'linear-gradient(to top, #0f0f12, transparent)',
  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px'
};
const titleStyle = { fontSize: '3rem', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' };
const badgeStyle = { backgroundColor: '#8b5cf6', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', width: 'fit-content', fontWeight: 'bold' };
const contentStyle = { maxWidth: '900px', margin: '0 auto', padding: '40px 20px' };
const infoGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' };
const cardStyle = { backgroundColor: '#16161e', padding: '20px', borderRadius: '15px', border: '1px solid #2a2a35', textAlign: 'center' };
const btnStyle = { backgroundColor: '#8b5cf6', color: 'white', padding: '20px 50px', border: 'none', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' };
const btnDoneStyle = { backgroundColor: '#10b981', color: 'white', padding: '20px 50px', border: 'none', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'not-allowed', opacity: 0.8 };