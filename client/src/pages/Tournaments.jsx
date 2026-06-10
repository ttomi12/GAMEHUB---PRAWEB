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
    axios.get('https://gamehub-praweb.onrender.com/api/tournaments')
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
      <header style={headerStyle}>
        <h1 style={mainTitleStyle}>
          Torneos de <span style={{ color: '#8b5cf6' }}>{gameName}</span>
        </h1>
        <p style={subtitleStyle}>Explora las próximas competencias disponibles</p>
      </header>

      <div style={gridStyle}>
        {tournaments.length > 0 ? (
          tournaments.map(t => (
            <div 
              key={t._id} 
              onClick={() => navigate(`/tournament/${t._id}`)}
              style={cardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(139, 92, 246, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
              }}
            >
              <div style={imageContainer}>
                <img src={t.image} alt={t.name} style={imageStyle} loading="lazy" />
                <div style={prizeBadge}>💰 {t.prize}</div>
              </div>
              
              <div style={infoPadding}>
                <h3 style={tournamentTitle}>{t.name}</h3>
                <div style={detailsContainer}>
                  <p style={detailItem}>
                    🕒 <span style={{color: 'white', fontWeight: 'bold'}}>{t.time || "20:00"} HS</span>
                  </p>
                  <p style={detailItem}>
                    📅 <span style={{color: 'white', fontWeight: 'bold'}}>{t.date}</span>
                  </p>
                </div>
                <div style={btnFakeStyle}>Ver Detalles</div>
              </div>
            </div>
          ))
        ) : (
          <div style={noDataStyle}>
            <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', marginBottom: '15px' }}>
              No hay torneos de {gameName} por ahora.
            </h2>
            <button 
              onClick={() => navigate('/')} 
              style={backBtnStyle}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Volver al Inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- ESTILOS OPTIMIZADOS PARA MÓVIL ---

const containerStyle = { 
  maxWidth: '1200px', 
  margin: '0 auto', 
  // Reducido el padding superior en móviles para que el título entre más rápido en foco
  padding: 'clamp(30px, 6vw, 60px) 20px', 
  minHeight: '100vh',
  backgroundColor: '#0f0f12', 
  color: 'white',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box'
};

const headerStyle = { 
  marginBottom: 'clamp(25px, 5vw, 40px)',
  textAlign: 'center' // Centramos el header para que se vea más prolijo en celular
};

const mainTitleStyle = { 
  // clamp permite que baje a 2rem en móviles pero crezca hasta 2.5rem en escritorio
  fontSize: 'clamp(2rem, 7vw, 2.5rem)', 
  marginBottom: '10px', 
  textTransform: 'uppercase', 
  letterSpacing: '1px',
  lineHeight: '1.1'
};

const subtitleStyle = { 
  color: '#9ca3af', 
  fontSize: 'clamp(0.9rem, 3vw, 1rem)',
  margin: '0'
};

const gridStyle = { 
  display: 'grid', 
  // min(100%, 280px) es un truco clave: si la pantalla es menor a 280px, la tarjeta ocupa el 100% y no rompe el layout horizontal.
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', 
  gap: 'clamp(20px, 4vw, 30px)' 
};

const cardStyle = { 
  backgroundColor: '#16161e', 
  borderRadius: 'clamp(16px, 4vw, 20px)', // Bordes un poquito más sutiles en pantallas chicas
  overflow: 'hidden', 
  cursor: 'pointer', 
  border: '1px solid #2a2a35',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  display: 'flex',
  flexDirection: 'column' // Asegura que el contenido se estire correctamente
};

const imageContainer = { 
  position: 'relative', 
  // Altura dinámica para que no ocupe media pantalla en celulares largos
  height: 'clamp(160px, 40vw, 200px)', 
  width: '100%' 
};

const imageStyle = { 
  width: '100%', 
  height: '100%', 
  objectFit: 'cover',
  objectPosition: 'center'
};

const prizeBadge = {
  position: 'absolute',
  top: '12px',
  right: '12px',
  backgroundColor: 'rgba(16, 185, 129, 0.95)',
  padding: '6px 14px',
  borderRadius: '12px',
  fontWeight: '900',
  fontSize: 'clamp(0.75rem, 3vw, 0.85rem)', // Se achica un pelín en móvil
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
  letterSpacing: '0.5px'
};

const infoPadding = { 
  padding: 'clamp(15px, 4vw, 20px)', // Menos padding interior en móviles para ahorrar espacio
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1
};

const tournamentTitle = { 
  fontSize: 'clamp(1.1rem, 4vw, 1.25rem)', 
  margin: '0 0 15px 0', 
  color: 'white',
  fontWeight: '800',
  lineHeight: '1.3'
};

const detailsContainer = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center',
  marginBottom: 'clamp(15px, 4vw, 20px)',
  flexWrap: 'wrap', // Permite que los elementos bajen de línea si el cel es extremadamente angosto
  gap: '10px'
};

const detailItem = { 
  margin: 0, 
  color: '#9ca3af', 
  fontSize: 'clamp(0.85rem, 3vw, 0.95rem)',
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};

const btnFakeStyle = {
  backgroundColor: '#8b5cf6',
  textAlign: 'center',
  padding: '12px', // Un poco más alto (touch target) para que sea fácil tapearlo con el dedo
  borderRadius: '12px',
  fontWeight: '800',
  fontSize: 'clamp(0.85rem, 3vw, 0.95rem)',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginTop: 'auto' // Empuja el botón siempre abajo si los títulos tienen distintas alturas
};

const loadingStyle = { 
  textAlign: 'center', 
  padding: '100px 20px', 
  color: '#8b5cf6', 
  fontSize: 'clamp(1rem, 4vw, 1.2rem)',
  fontWeight: 'bold'
};

const noDataStyle = { 
  gridColumn: '1/-1', 
  textAlign: 'center', 
  padding: 'clamp(40px, 8vw, 60px) 20px',
  backgroundColor: '#16161e',
  borderRadius: '20px',
  border: '1px dashed #2a2a35'
};

const backBtnStyle = { 
  backgroundColor: 'transparent', 
  border: '2px solid #8b5cf6', 
  color: '#8b5cf6', 
  padding: '12px 24px', 
  borderRadius: '12px', 
  cursor: 'pointer', 
  marginTop: '10px',
  fontWeight: 'bold',
  transition: 'all 0.3s ease'
};