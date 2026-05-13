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
    
    if (!formData.game) return alert("Por favor, seleccioná un juego.");
    if (!formData.name || !formData.date || !formData.time) return alert("Completá los campos obligatorios.");

    setLoading(true);

    try {
      // 1. OBTENER TOKEN DEL LOCALSTORAGE (JWT de nuestro Backend)
      const savedUser = JSON.parse(localStorage.getItem('user'));
      const token = savedUser?.token;

      if (!token) {
        alert("Sesión inválida. Por favor, re-ingresá.");
        setLoading(false);
        return;
      }

      // 2. PREPARACIÓN DE DATOS
      const tournamentData = {
        name: formData.name,
        game: formData.game,
        prize: formData.prize,
        maxPlayers: Number(formData.maxPlayers),
        date: formData.date,
        time: formData.time
      };

      // 3. ENVÍO
      await axios.post('https://gamehub-praweb.onrender.com/api/tournaments', tournamentData, {
        headers: { 'x-auth-token': token }
      });
      
      alert('¡Torneo publicado con éxito! 🚀');
      setFormData({ name: '', game: '', prize: '', maxPlayers: '', image: '', date: '', time: '' });

    } catch (err) {
      console.error("Error al publicar:", err.response?.data || err.message);
      alert(err.response?.data?.msg || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    padding: '12px', borderRadius: '8px', backgroundColor: '#1a1a20',
    border: '1px solid #333', color: 'white', fontSize: '1rem',
    width: '100%', boxSizing: 'border-box'
  };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px', color: 'white' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#8b5cf6', fontSize: '2.5rem' }}>PANEL ADMIN</h1>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '15px' }}>1. Seleccioná el Juego:</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
            {GAME_OPTIONS.map(g => (
              <div 
                key={g.id} 
                onClick={() => setFormData({...formData, game: g.id})}
                style={{
                  height: '140px', borderRadius: '15px', overflow: 'hidden', cursor: 'pointer',
                  border: formData.game === g.id ? '4px solid #8b5cf6' : '2px solid #333',
                  transition: 'all 0.3s'
                }}
              >
                <img src={g.img} alt={g.id} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input type="text" placeholder="Nombre" style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input type="text" placeholder="Premio" style={inputStyle} value={formData.prize} onChange={e => setFormData({...formData, prize: e.target.value})} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <input type="date" style={inputStyle} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          <input type="time" style={inputStyle} value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '18px', backgroundColor: loading ? '#444' : '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>
          {loading ? 'PUBLICANDO...' : 'PUBLICAR TORNEO'}
        </button>
      </form>
    </div>
  );
};