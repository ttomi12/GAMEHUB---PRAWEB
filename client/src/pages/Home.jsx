import React from 'react';
import { useNavigate } from 'react-router-dom';

const games = [
  { name: 'Fortnite', img: 'https://wallpapercave.com/wp/wp6082440.png' },
  { name: 'Clash Royale', img: 'https://wallpapercave.com/wp/wp2394983.jpg' },
  { name: 'Rocket League', img: 'https://wallpapercave.com/wp/wp6005289.jpg' },
  { name: 'Valorant', img: 'https://wallpapercave.com/wp/wp16103415.jpg' }
];

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ color: 'white', backgroundColor: '#0f0f12', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* --- SECCIÓN BIENVENIDA --- */}
      <section style={{ textAlign: 'center', padding: '100px 20px', background: 'linear-gradient(to bottom, #1a1a2e, #0f0f12)' }}>
        <h1 style={{ fontSize: '4.5rem', marginBottom: '10px', fontWeight: '900', letterSpacing: '-2px' }}>
          Bienvenido a <span style={{ color: '#8b5cf6' }}>GAMEHUB</span>
        </h1>
        <p style={{ fontSize: '1.4rem', color: '#9ca3af', maxWidth: '700px', margin: '0 auto' }}>
          La plataforma definitiva para competir, ganar y dominar la escena de los Esports.
        </p>
      </section>

      {/* --- SECCIÓN BENEFICIOS  --- */}
      <section style={{ display: 'flex', justifyContent: 'center', gap: '40px', padding: '60px 20px', flexWrap: 'wrap' }}>
        <div style={detailBox}>
          <img src="https://api.dicebear.com/7.x/icons/svg?seed=trophy" alt="win" style={{ width: '55px', margin: '0 auto' }} />
          <h3 style={{ marginTop: '20px', fontSize: '1.5rem' }}>Competí</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.5' }}>Sumate a torneos diarios y demostrá tu nivel ante los mejores.</p>
        </div>
        <div style={detailBox}>
          <img src="https://api.dicebear.com/7.x/icons/svg?seed=cash" alt="prize" style={{ width: '55px', margin: '0 auto' }} />
          <h3 style={{ marginTop: '20px', fontSize: '1.5rem' }}>Ganá</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.5' }}>Premios reales en dólares y reconocimiento para los ganadores.</p>
        </div>
      </section>

      {/* --- SECCIÓN JUEGOS --- */}
      <section style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '40px', fontSize: '2.2rem', fontWeight: '800', textTransform: 'uppercase', fontStyle: 'italic' }}>
          Elegí tu <span style={{ color: '#8b5cf6' }}>Juego</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' }}>
          {games.map(game => (
            <div 
              key={game.name}
              onClick={() => navigate(`/tournaments/${game.name}`)}
              style={gameCardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.querySelector('img').style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.querySelector('img').style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <img src={game.img} alt={game.name} style={gameImgStyle} />
              <div style={gameLabelStyle}>
                <span style={{ fontSize: '1.6rem', fontWeight: '900', textTransform: 'uppercase' }}>{game.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECCIÓN SHOWCASE --- */}
      <section style={{ marginTop: '120px', padding: '60px 20px', borderTop: '1px solid #1f1f23', backgroundColor: '#0a0a0c' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h4 style={{ color: '#8b5cf6', fontSize: '0.8rem', letterSpacing: '4px', marginBottom: '40px', opacity: 0.6, fontWeight: '900', textTransform: 'uppercase' }}>
            Design System Showcase
          </h4>
          
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Botón Primario con Tailwind Classes */}
            <button className="bg-[#8b5cf6] text-white px-9 py-3 rounded-xl font-black text-sm hover:bg-[#7c3aed] transition-all transform hover:-translate-y-1 shadow-lg shadow-purple-500/30 uppercase tracking-wider">
              Botón Primario
            </button>
            
            {/* Botón Secundario con Tailwind Classes */}
            <button className="border-2 border-[#8b5cf6] text-[#8b5cf6] px-9 py-3 rounded-xl font-black text-sm hover:bg-[#8b5cf6] hover:text-white transition-all transform hover:-translate-y-1 uppercase tracking-wider">
              Botón Secundario
            </button>

            <p style={{ color: '#4b5563', fontSize: '0.85rem', fontStyle: 'italic', marginLeft: '10px' }}>
              — Interactive components (Hover & Transitions enabled)
            </p>
          </div>
        </div>
      </section>

      {/* --- FOOTER PROFESIONAL --- */}
      <footer style={{ padding: '50px 20px', textAlign: 'center', backgroundColor: '#050505', borderTop: '1px solid #111' }}>
        <p style={{ color: '#6b7280', fontSize: '1rem', margin: 0, fontWeight: '500' }}>
          &copy; {new Date().getFullYear()} <span style={{ color: '#8b5cf6', fontWeight: '800' }}>GAMEHUB</span> — Todos los derechos reservados.
        </p>
        <p style={{ color: '#374151', fontSize: '0.75rem', marginTop: '12px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>
          Taller de Desarrollo de Aplicaciones | Proyecto Esports
        </p>
      </footer>

    </div>
  );
};

// ESTILOS EN OBJETOS
const detailBox = { 
  textAlign: 'center', 
  backgroundColor: '#1a1a20', 
  padding: '40px 30px', 
  borderRadius: '20px', 
  width: '280px',
  border: '1px solid #2d2d35',
  transition: 'border-color 0.3s ease'
};

const gameCardStyle = { 
  position: 'relative', 
  borderRadius: '20px', 
  overflow: 'hidden', 
  cursor: 'pointer', 
  height: '380px', 
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  backgroundColor: '#1a1a20'
};

const gameImgStyle = { 
  width: '100%', 
  height: '100%', 
  objectFit: 'cover', 
  transition: 'transform 0.5s ease' 
};

const gameLabelStyle = { 
  position: 'absolute', 
  bottom: 0, 
  width: '100%', 
  padding: '30px 20px', 
  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)', 
  textAlign: 'left',
  display: 'flex',
  alignItems: 'flex-end'
};