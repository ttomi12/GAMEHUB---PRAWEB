
import { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebaseConfig'; 

const GAME_OPTIONS = [
  { id: 'Fortnite', img: 'https://wallpapercave.com/wp/wp6082440.png' },
  { id: 'Clash Royale', img: 'https://wallpapercave.com/wp/wp2394983.jpg' },
  { id: 'Rocket League', img: 'https://wallpapercave.com/wp/wp6005289.jpg' },
  { id: 'Valorant', img: 'https://wallpapercave.com/wp/wp16103415.jpg' }
];

export const Admin = () => {
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    prize: '',
    maxPlayers: '',
    image: '',
    date: '',
    time: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.game) return alert("Por favor, seleccioná un juego de la lista.");
    if (!formData.name || !formData.date || !formData.time) return alert("Completá los campos obligatorios.");

    setLoading(true);
    try {
      // 1. OBTENER TOKEN DEL LOCALSTORAGE
      const savedUser = JSON.parse(localStorage.getItem('user'));
      const token = savedUser?.token;

      if (!token) {
        alert("Sesión inválida. Por favor, cerrá sesión y volvé a entrar.");
        setLoading(false);
        return;
      }

      // 2. BUSCAR IMAGEN DEFAULT SI NO HAY URL
      const selectedGame = GAME_OPTIONS.find(g => g.id === formData.game);

      // 3. PREPARACIÓN DE DATOS
      const tournamentData = {
        name: formData.name,
        game: formData.game,
        prize: formData.prize,
        maxPlayers: Number(formData.maxPlayers),
        date: formData.date,
        // CORRECCIÓN HORA: Evita duplicar 'hs' y captura el valor real del input
        time: formData.time.includes('hs') ? formData.time : `${formData.time}hs`,
        // CORRECCIÓN IMAGEN: Si está vacío, usa la imagen de GAME_OPTIONS
        image: formData.image.trim() !== '' ? formData.image : selectedGame.img
      };

      // 4. ENVÍO AL BACKEND
      await axios.post('https://gamehub-praweb.onrender.com/api/tournaments', tournamentData, {
        headers: {
          'x-auth-token': token
        }
      });
      
      alert('¡Torneo publicado con éxito! 🚀');
      setFormData({ name: '', game: '', prize: '', maxPlayers: '', image: '', date: '', time: '' });
    } catch (err) {
      console.error("Error al publicar:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.msg || "Error al conectar con el servidor.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#1a1a20',
    border: '1px solid #333',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '5px'
  };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px', color: 'white' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#8b5cf6', fontSize: '2.5rem', marginBottom: '10px', letterSpacing: '2px' }}>PANEL ADMIN</h1>
        <p style={{ color: '#9ca3af' }}>Creá y publicá nuevos torneos para la comunidad.</p>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* 1. SELECCIÓN DE JUEGO CON ZOOM */}
        <div>
          <label style={{ display: 'block', marginBottom: '15px', fontWeight: 'bold', fontSize: '1.1rem' }}>
            1. Seleccioná el Juego:
          </label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '15px' 
          }}>
            {GAME_OPTIONS.map(g => (
              <div 
                key={g.id} 
                onClick={() => setFormData({...formData, game: g.id})}
                style={{
                  position: 'relative',
                  height: '140px',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: formData.game === g.id ? '4px solid #8b5cf6' : '2px solid #333',
                  transition: 'all 0.3s ease',
                  transform: formData.game === g.id ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: formData.game === g.id ? '0 0 20px rgba(139, 92, 246, 0.4)' : 'none'
                }}
              >
                <img 
                  src={g.img} 
                  alt={g.id}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    transition: 'transform 0.5s ease',
                    opacity: formData.game === g.id ? 1 : 0.6
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.15)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                />
                <div style={{
                  position: 'absolute', bottom: 0, width: '100%', padding: '8px 0',
                  backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', textAlign: 'center', fontSize: '0.8rem'
                }}>
                  {g.id}
                </div>
                {formData.game === g.id && (
                  <div style={{
                    position: 'absolute', top: '10px', right: '10px', backgroundColor: '#8b5cf6',
                    borderRadius: '50%', width: '25px', height: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                  }}>
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <hr style={{ border: '0.5px solid #333', width: '100%', margin: '10px 0' }} />

        {/* 2. DATOS DEL TORNEO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Nombre del Torneo</label>
            <input 
              type="text" 
              placeholder="Ej: Gran Final Domingo" 
              style={inputStyle}
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          <div>
            <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Premio</label>
            <input 
              type="text" 
              placeholder="Ej: 100 USD" 
              style={inputStyle}
              value={formData.prize}
              onChange={e => setFormData({...formData, prize: e.target.value})} 
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Fecha</label>
            <input 
              type="date" 
              style={inputStyle}
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})} 
            />
          </div>
          <div>
            <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Hora</label>
            <input 
              type="time" 
              style={inputStyle}
              value={formData.time.replace('hs', '')} 
              onChange={e => setFormData({...formData, time: e.target.value})} 
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>URL de Imagen (Opcional)</label>
          <input 
            type="text" 
            placeholder="https://link-de-la-foto.jpg" 
            style={inputStyle}
            value={formData.image}
            onChange={e => setFormData({...formData, image: e.target.value})} 
          />
        </div>

        <div>
          <label style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Máximo de Jugadores</label>
          <input 
            type="number" 
            placeholder="Ej: 32" 
            style={inputStyle}
            value={formData.maxPlayers}
            onChange={e => setFormData({...formData, maxPlayers: e.target.value})} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: '18px',
            backgroundColor: loading ? '#444' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            marginTop: '10px',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
          }}
          onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#7c3aed')}
          onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#8b5cf6')}
        >
          {loading ? 'PUBLICANDO...' : 'PUBLICAR TORNEO'}
        </button>

      </form>
    </div>
  );
};