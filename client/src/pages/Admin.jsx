import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const GAME_OPTIONS = [
  { id: 'Fortnite', img: 'https://wallpapercave.com/wp/wp6082440.png' },
  { id: 'Clash Royale', img: 'https://wallpapercave.com/wp/wp2394983.jpg' },
  { id: 'Rocket League', img: 'https://wallpapercave.com/wp/wp6005289.jpg' },
  { id: 'Valorant', img: 'https://wallpapercave.com/wp/wp16103415.jpg' }
];

// Recibimos user y setUser desde App.js para que todo sea real
export const Admin = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('crear');
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  // Estado para manejar si estamos editando un torneo existente
  const [isEditing, setIsEditing] = useState(null);

  const [formData, setFormData] = useState({
    name: '', game: '', prize: '', maxPlayers: '', image: '', date: '', time: ''
  });

  const alertStyle = {
    background: '#16161e', color: '#fff', confirmButtonColor: '#8b5cf6',
    borderRadius: '15px', border: '1px solid #2a2a35'
  };

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    setFetching(true);
    try {
      const res = await axios.get('https://gamehub-praweb.onrender.com/api/tournaments');
      setTournaments(res.data);
    } catch (error) {
      console.error("Error al traer torneos", error);
    } finally {
      setFetching(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    if (setUser) setUser(null);
    navigate('/');
    window.location.reload(); // Asegura limpieza total
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      ...alertStyle,
      title: '¿Eliminar torneo?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`https://gamehub-praweb.onrender.com/api/tournaments/${id}`, {
          headers: { 'x-auth-token': user?.token }
        });
        Swal.fire({ ...alertStyle, title: '¡Eliminado!', icon: 'success', timer: 1500 });
        fetchTournaments();
      } catch (error) {
        Swal.fire({ ...alertStyle, title: 'Error', text: 'No se pudo eliminar el torneo.', icon: 'error' });
      }
    }
  };

  const startEdit = (t) => {
    setIsEditing(t._id);
    setFormData({
      name: t.name,
      game: t.game,
      prize: t.prize,
      maxPlayers: t.maxPlayers,
      image: t.image,
      date: t.date,
      time: t.time.replace('hs', '')
    });
    setActiveTab('crear');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.game) return Swal.fire({ ...alertStyle, title: 'Seleccioná un juego', icon: 'warning' });

    setLoading(true);
    try {
      const selectedGame = GAME_OPTIONS.find(g => g.id === formData.game);
      const tournamentData = {
        ...formData,
        maxPlayers: Number(formData.maxPlayers),
        time: formData.time.includes('hs') ? formData.time : `${formData.time}hs`,
        image: formData.image.trim() !== '' ? formData.image : selectedGame.img
      };

      if (isEditing) {
        // MODO EDICIÓN (PUT)
        await axios.put(`https://gamehub-praweb.onrender.com/api/tournaments/${isEditing}`, tournamentData, {
          headers: { 'x-auth-token': user?.token }
        });
        Swal.fire({ ...alertStyle, title: '¡TORNEO ACTUALIZADO!', icon: 'success', timer: 2000 });
      } else {
        // MODO CREACIÓN (POST)
        await axios.post('https://gamehub-praweb.onrender.com/api/tournaments', tournamentData, {
          headers: { 'x-auth-token': user?.token }
        });
        Swal.fire({ ...alertStyle, title: '¡TORNEO PUBLICADO!', icon: 'success', timer: 2000 });
      }
      
      setFormData({ name: '', game: '', prize: '', maxPlayers: '', image: '', date: '', time: '' });
      setIsEditing(null);
      fetchTournaments();
      setActiveTab('gestionar');

    } catch (err) {
      Swal.fire({ ...alertStyle, title: 'ERROR', text: err.response?.data?.msg || "Fallo en el servidor", icon: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <header style={adminHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
              alt="Admin" 
              style={adminAvatar} 
            />
            <div style={statusBadge}></div>
          </div>
          <div>
            <h1 style={headerTitle}>PANEL ADMIN</h1>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.9rem' }}>Gestionando como <b>{user?.username}</b></p>
          </div>
        </div>
        <button onClick={handleLogout} style={btnLogout}>CERRAR SESIÓN</button>
      </header>

      <div style={tabsContainer}>
        <button onClick={() => { setActiveTab('crear'); setIsEditing(null); }} style={activeTab === 'crear' ? tabActive : tabInactive}>
          {isEditing ? 'EDITANDO TORNEO' : 'CREAR TORNEO'}
        </button>
        <button onClick={() => setActiveTab('gestionar')} style={activeTab === 'gestionar' ? tabActive : tabInactive}>VER TORNEOS</button>
      </div>

      {activeTab === 'crear' ? (
        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label style={sectionLabel}>1. Seleccioná el Juego:</label>
            <div style={gameGrid}>
              {GAME_OPTIONS.map(g => (
                <div 
                  key={g.id} 
                  onClick={() => setFormData({...formData, game: g.id})}
                  style={{...gameCard, border: formData.game === g.id ? '4px solid #8b5cf6' : '2px solid #333', transform: formData.game === g.id ? 'scale(1.05)' : 'scale(1)'}}
                >
                  <img src={g.img} alt={g.id} style={{...gameImg, opacity: formData.game === g.id ? 1 : 0.6}} />
                  <div style={gameNameLabel}>{g.id}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={inputRow}>
            <div style={{flex: 1}}>
              <label style={smallLabel}>Nombre del Torneo</label>
              <input type="text" style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div style={{flex: 1}}>
              <label style={smallLabel}>Premio</label>
              <input type="text" style={inputStyle} value={formData.prize} onChange={e => setFormData({...formData, prize: e.target.value})} required />
            </div>
          </div>

          <div style={inputRow}>
            <div style={{flex: 1}}>
              <label style={smallLabel}>Fecha</label>
              <input type="date" min={today} style={inputStyle} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>
            <div style={{flex: 1}}>
              <label style={smallLabel}>Hora</label>
              <input type="time" style={inputStyle} value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required />
            </div>
          </div>

          <div style={inputRow}>
            <div style={{flex: 1}}>
              <label style={smallLabel}>Máximo Jugadores</label>
              <input type="number" style={inputStyle} value={formData.maxPlayers} onChange={e => setFormData({...formData, maxPlayers: e.target.value})} required />
            </div>
            <div style={{flex: 1}}>
              <label style={smallLabel}>Imagen URL (Opcional)</label>
              <input type="text" style={inputStyle} value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{...btnSubmit, backgroundColor: loading ? '#444' : '#8b5cf6'}}>
            {loading ? 'PROCESANDO...' : isEditing ? 'GUARDAR CAMBIOS' : 'PUBLICAR TORNEO'}
          </button>
          
          {isEditing && (
            <button type="button" onClick={() => { setIsEditing(null); setFormData({name:'',game:'',prize:'',maxPlayers:'',image:'',date:'',time:''}); }} style={{background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>
              CANCELAR EDICIÓN
            </button>
          )}
        </form>
      ) : (
        <div style={listContainer}>
          <h3 style={{ color: '#8b5cf6', marginBottom: '20px' }}>TORNEOS EXISTENTES</h3>
          {fetching ? <p>Cargando lista...</p> : tournaments.length === 0 ? <p>No hay torneos creados.</p> : tournaments.map(t => (
            <div key={t._id} style={itemCard}>
              <img src={t.image} alt="" style={itemImg} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0 }}>{t.name}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>{t.game} • {t.date}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => startEdit(t)} style={btnEdit}>EDITAR</button>
                <button onClick={() => handleDelete(t._id)} style={btnDelete}>ELIMINAR</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* --- ESTILOS MEJORADOS --- */
const containerStyle = { maxWidth: '800px', margin: '40px auto', padding: '20px', color: 'white', fontFamily: 'Inter, sans-serif' };
const adminHeader = { display: 'flex', alignItems: 'center', marginBottom: '30px', backgroundColor: '#16161e', padding: '20px', borderRadius: '20px', border: '1px solid #2a2a35' };
const adminAvatar = { width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #8b5cf6', objectFit: 'cover' };
const statusBadge = { position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%', border: '2px solid #16161e' };
const headerTitle = { color: '#8b5cf6', fontSize: '1.8rem', margin: 0, fontWeight: '800' };

const btnLogout = { backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' };

const tabsContainer = { display: 'flex', gap: '10px', marginBottom: '25px' };
const tabActive = { flex: 1, padding: '12px', backgroundColor: '#8b5cf6', border: 'none', color: 'white', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };
const tabInactive = { ...tabActive, backgroundColor: '#1a1a24', border: '1px solid #2a2a35', color: '#9ca3af' };

const formStyle = { display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#16161e', padding: '25px', borderRadius: '20px', border: '1px solid #2a2a35' };
const gameGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' };
const gameCard = { position: 'relative', height: '100px', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s' };
const gameImg = { width: '100%', height: '100%', objectFit: 'cover' };
const gameNameLabel = { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'rgba(0,0,0,0.7)', fontSize: '0.7rem', textAlign: 'center', padding: '4px 0' };

const inputRow = { display: 'flex', gap: '15px' };
const smallLabel = { fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '5px' };
const sectionLabel = { display: 'block', marginBottom: '15px', fontWeight: 'bold' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f0f12', border: '1px solid #333', color: 'white', boxSizing: 'border-box' };
const btnSubmit = { padding: '16px', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer' };

const listContainer = { backgroundColor: '#16161e', padding: '25px', borderRadius: '20px', border: '1px solid #2a2a35' };
const itemCard = { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: '#0f0f12', borderRadius: '12px', marginBottom: '10px', border: '1px solid #222' };
const itemImg = { width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' };
const btnDelete = { backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' };
const btnEdit = { backgroundColor: '#8b5cf6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' };