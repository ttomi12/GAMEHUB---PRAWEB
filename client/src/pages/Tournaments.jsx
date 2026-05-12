import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function Tournaments() {
  const { gameName } = useParams(); 
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:5000/api/tournaments')
      .then(res => {
        // 1. Filtramos por el juego seleccionado
        let filtered = res.data.filter(t => t.game === gameName);
        
        // 2. Ordenamos por fecha
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setTournaments(filtered);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
  }, [gameName]);

  if (loading) return <div style={loadingStyle}>Buscando torneos activos...</div>;

  return (
    <div style={containerStyle}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={mainTitleStyle}>
          Torneos de <span style={{ color: '#8b5cf6' }}>{gameName}</span>
        </h1>
        <p style={{ color: '#9ca3af' }}>Explora las próximas competencias disponibles</p>
      </header>

      <div style={gridStyle}>
        {tournaments.length > 0 ? (
          tournaments.map(t => (
            <div 
              key={t._id} 
              onClick={() => navigate(`/tournament/${t._id}`)}
              style={cardStyle}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={imageContainer}>
                <img src={t.image} alt={t.name} style={imageStyle} />
                <div style={prizeBadge}>💰 {t.prize}</div>
              </div>
              
              <div style={infoPadding}>
                <h3 style={tournamentTitle}>{t.name}</h3>
                <div style={detailsContainer}>
                  <p style={detailItem}>🕒 <span style={{color: 'white'}}>{t.time || "20:00"} HS</span></p>
                  <p style={detailItem}>📅 <span style={{color: 'white'}}>{t.date}</span></p>
                </div>
                <div style={btnFakeStyle}>Ver Detalles</div>
              </div>
            </div>
          ))
        ) : (
          <div style={noDataStyle}>
            <h2>No hay torneos de {gameName} por ahora.</h2>
            <button onClick={() => navigate('/')} style={backBtnStyle}>Volver al Inicio</button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- ESTILOS MEJORADOS ---
const containerStyle = { 
  maxWidth: '1200px', 
  margin: '0 auto', 
  padding: '60px 20px', 
  minHeight: '100vh',
  backgroundColor: '#0f0f12', // Mismo fondo que Detail
  color: 'white',
  fontFamily: 'sans-serif'
};

const mainTitleStyle = { fontSize: '2.5rem', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' };

const gridStyle = { 
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
  gap: '30px' 
};

const cardStyle = { 
  backgroundColor: '#16161e', 
  borderRadius: '20px', 
  overflow: 'hidden', 
  cursor: 'pointer', 
  border: '1px solid #2a2a35',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
};

const imageContainer = { position: 'relative', height: '180px' };
const imageStyle = { width: '100%', height: '100%', objectFit: 'cover' };

const prizeBadge = {
  position: 'absolute',
  top: '15px',
  right: '15px',
  backgroundColor: 'rgba(16, 185, 129, 0.9)',
  padding: '5px 12px',
  borderRadius: '10px',
  fontWeight: 'bold',
  fontSize: '0.85rem'
};

const infoPadding = { padding: '20px' };
const tournamentTitle = { fontSize: '1.2rem', margin: '0 0 15px 0', color: 'white' };
const detailsContainer = { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' };
const detailItem = { margin: 0, color: '#9ca3af', fontSize: '0.9rem' };

const btnFakeStyle = {
  backgroundColor: '#8b5cf6',
  textAlign: 'center',
  padding: '10px',
  borderRadius: '10px',
  fontWeight: 'bold',
  fontSize: '0.9rem'
};

const loadingStyle = { textAlign: 'center', padding: '100px', color: '#8b5cf6', fontSize: '1.2rem' };
const noDataStyle = { gridColumn: '1/-1', textAlign: 'center', padding: '50px' };
const backBtnStyle = { backgroundColor: 'transparent', border: '1px solid #8b5cf6', color: '#8b5cf6', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', marginTop: '20px' };