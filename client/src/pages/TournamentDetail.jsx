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
        // CORRECCIÓN: Ahora pedimos los datos a nuestra API de MongoDB
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

    // El backend usa 'participantes' como un array de IDs o Objetos
    const yaInscripto = tournament.participantes?.some(p => 
      (typeof p === 'string' ? p === user.uid : p._id === user._id)
    );

    if (yaInscripto) {
      alert("¡Ya estás en la lista! No te podés anotar dos veces.");
      return;
    }

    setRegistering(true);
    try {
      const token = user.token; // Sacamos el token que guardamos en App.jsx
      
      // CORRECCIÓN: Inscripción mediante el Backend
      const res = await axios.post(
        `https://gamehub-praweb.onrender.com/api/tournaments/${id}/join`, 
        {}, 
        { headers: { 'x-auth-token': token } }
      );

      alert("✅ ¡Inscripción exitosa! Preparate para el combate.");
      setTournament(res.data); // Actualizamos con la respuesta del server

    } catch (error) {
      console.error("Error al anotar:", error);
      alert(error.response?.data?.msg || "Hubo un error al inscribirte.");
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div style={msgStyle}>Cargando torneo...</div>;
  if (!tournament) return <div style={msgStyle}>El torneo no existe o fue eliminado.</div>;

  // Verificamos si el ID del usuario actual está en la lista de participantes
  const yaInscripto = tournament.participantes?.some(p => 
    (typeof p === 'string' ? p === user?.uid : p._id === user?._id || p === user?._id)
  );

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
            <p>{tournament.participantes?.length || 0} / {tournament.maxPlayers || '∞'} inscriptos</p>
          </div>
        </div>

        {yaInscripto && (
          <div style={rivalCardStyle}>
            <h3 style={{ color: '#8b5cf6', marginBottom: '15px', fontSize: '1.4rem' }}>🎮 Tu Próxima Partida</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#9ca3af', textTransform: 'uppercase' }}>Rival</p>
                <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'white' }}>GamerPro_99</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '5px' }}>ID de {tournament.game}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <code style={idBadgeStyle}>765611980345678</code>
                  <button 
                    style={copyBtnStyle} 
                    onClick={() => {
                        navigator.clipboard.writeText("765611980345678");
                        alert("ID del rival copiado");
                    }}
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
            <p style={warningStyle}>
              * El chat se habilitará 10 minutos antes. Coordiná con tu rival.
            </p>
          </div>
        )}

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

// --- ESTILOS ACTUALIZADOS ---
const msgStyle = { textAlign: 'center', padding: '100px', fontSize: '1.5rem', color: '#8b5cf6', fontFamily: 'inherit' };
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
const rivalCardStyle = { backgroundColor: '#1c1c27', padding: '25px', borderRadius: '15px', border: '2px solid #8b5cf6', marginTop: '30px', textAlign: 'left' };
const idBadgeStyle = { backgroundColor: '#2d2d3d', padding: '8px 12px', borderRadius: '8px', color: '#a78bfa', fontSize: '1rem', border: '1px solid #444' };
const copyBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem' };
const warningStyle = { fontSize: '0.85rem', color: '#9ca3af', marginTop: '20px', fontStyle: 'italic', borderTop: '1px solid #333', paddingTop: '10px' };