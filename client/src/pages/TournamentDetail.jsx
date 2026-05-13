import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export const TournamentDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const getTournament = async () => {
      try {
        // 1. LLAMADA AL BACKEND (MONGODB)
        // Asegúrate de que esta URL sea la de tu backend en Render
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

  const handleInscripcion = async () => {
    if (!user) {
      alert("🚫 ¡Frená ahí! Tenés que estar logueado para anotarte.");
      navigate('/login');
      return;
    }

    // Verificamos si ya está inscripto (usando user._id de MongoDB)
    const yaInscripto = tournament.players?.includes(user._id || user.id);

    if (yaInscripto) {
      alert("¡Ya estás en la lista! No te podés anotar dos veces.");
      return;
    }

    setRegistering(true);
    try {
      const token = user.token; 
      
      // 2. RUTA DE INSCRIPCIÓN AL BACKEND
      const res = await axios.post(
        `https://gamehub-praweb.onrender.com/api/tournaments/${id}/join`, 
        {}, 
        { headers: { 'x-auth-token': token } }
      );

      alert("✅ ¡Inscripción exitosa! Preparate para el combate.");
      // Actualizamos el estado con el torneo que devuelve el servidor
      setTournament(res.data.tournament || res.data);

    } catch (error) {
      console.error("Error al anotar:", error);
      alert(error.response?.data?.msg || "Hubo un error al inscribirte.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div style={msgStyle}>Cargando torneo...</div>;
  
  // Si no encuentra el torneo, mostramos el error
  if (!tournament) return <div style={msgStyle}>El torneo no existe o fue eliminado.</div>;

  const yaInscripto = tournament.players?.includes(user?._id || user?.id);

  return (
    <div style={containerStyle}>
      {/* Portada del Torneo */}
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

        {/* Botón de Inscripción */}
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

// --- ESTILOS REFORZADOS ---
const msgStyle = { textAlign: 'center', padding: '100px', fontSize: '1.5rem', color: '#8b5cf6', fontFamily: 'Inter, sans-serif' };
const containerStyle = { minHeight: '100vh', backgroundColor: '#0f0f12', paddingBottom: '50px', color: 'white', fontFamily: 'Inter, sans-serif' };
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