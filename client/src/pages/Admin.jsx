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

export const Admin = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('crear');
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
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
  };

  // --- CORRECCIÓN ELIMINAR ---
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
        
        // Actualización optimista del estado
        setTournaments(prev => prev.filter(t => t._id !== id));
        
        Swal.fire({ ...alertStyle, title: '¡Eliminado!', icon: 'success', timer: 1500, showConfirmButton: false });
      } catch (error) {
        Swal.fire({ 
          ...alertStyle, 
          title: 'Error', 
          text: error.response?.data?.msg || 'No se pudo eliminar el torneo.', 
          icon: 'error' 
        });
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
      // Limpiamos 'hs' para que el input type="time" funcione bien
      time: t.time ? t.time.replace('hs', '').trim() : '' 
    });
    setActiveTab('crear');
  };

  // --- CORRECCIÓN GUARDAR / EDITAR ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.game) return Swal.fire({ ...alertStyle, title: 'Seleccioná un juego', icon: 'warning' });

    setLoading(true);
    try {
      const selectedGame = GAME_OPTIONS.find(g => g.id === formData.game);
      
      const tournamentData = {
        ...formData,
        maxPlayers: Number(formData.maxPlayers),
        // Aseguramos que el tiempo guarde el formato visual deseado
        time: formData.time.includes('hs') ? formData.time : `${formData.time} hs`,
        image: formData.image.trim() !== '' ? formData.image : selectedGame.img
      };

      if (isEditing) {
        // MODO EDICIÓN
        await axios.put(`https://gamehub-praweb.onrender.com/api/tournaments/${isEditing}`, tournamentData, {
          headers: { 'x-auth-token': user?.token }
        });
        Swal.fire({ ...alertStyle, title: '¡TORNEO ACTUALIZADO!', icon: 'success', timer: 2000, showConfirmButton: false });
      } else {
        // MODO CREACIÓN
        await axios.post('https://gamehub-praweb.onrender.com/api/tournaments', tournamentData, {
          headers: { 'x-auth-token': user?.token }
        });
        Swal.fire({ ...alertStyle, title: '¡TORNEO PUBLICADO!', icon: 'success', timer: 2000, showConfirmButton: false });
      }
      
      // Limpiar y resetear
      setFormData({ name: '', game: '', prize: '', maxPlayers: '', image: '', date: '', time: '' });
      setIsEditing(null);
      await fetchTournaments();
      setActiveTab('gestionar');

    } catch (err) {
      console.error(err.response?.data);
      Swal.fire({ 
        ...alertStyle, 
        title: 'ERROR', 
        text: err.response?.data?.msg || "Fallo en el servidor al procesar la solicitud", 
        icon: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <header style={adminHeader}>
        <div style={headerInfo}>
          <div style={{ position: 'relative' }}>
            <img 
              src={user?.photoURL || user?.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
              alt="Admin" 
              style={adminAvatar} 
            />
            <div style={statusBadge}></div>
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <h1 style={headerTitle}>PANEL ADMIN</h1>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: 'clamp(0.8rem, 3vw, 0.9rem)', wordBreak: 'break-all' }}>
              Gestionando como <b>{user?.username}</b>
            </p>
          </div>
        </div>
        <button onClick={handleLogout} style={btnLogout}>CERRAR SESIÓN</button>
      </header>

      <div style={tabsContainer}>
        <button onClick={() => { setActiveTab('crear'); setIsEditing(null); setFormData({name:'',game:'',prize:'',maxPlayers:'',image:'',date:'',time:''}); }} style={activeTab === 'crear' ? tabActive : tabInactive}>
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
                  style={{
                    ...gameCard, 
                    border: formData.game === g.id ? '3px solid #8b5cf6' : '1px solid #333', 
                    transform: formData.game === g.id ? 'scale(1.03)' : 'scale(1)'
                  }}
                >
                  <img src={g.img} alt={g.id} style={{...gameImg, opacity: formData.game === g.id ? 1 : 0.5}} loading="lazy" />
                  <div style={gameNameLabel}>{g.id}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={inputRow}>
            <div style={flexInput}>
              <label style={smallLabel}>Nombre del Torneo</label>
              <input type="text" style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div style={flexInput}>
              <label style={smallLabel}>Premio</label>
              <input type="text" style={inputStyle} value={formData.prize} onChange={e => setFormData({...formData, prize: e.target.value})} required />
            </div>
          </div>

          <div style={inputRow}>
            <div style={flexInput}>
              <label style={smallLabel}>Fecha</label>
              <input type="date" min={today} style={inputStyle} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>
            <div style={flexInput}>
              <label style={smallLabel}>Hora</label>
              <input type="time" style={inputStyle} value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} required />
            </div>
          </div>

          <div style={inputRow}>
            <div style={flexInput}>
              <label style={smallLabel}>Máximo Jugadores</label>
              <input type="number" style={inputStyle} value={formData.maxPlayers} onChange={e => setFormData({...formData, maxPlayers: e.target.value})} required />
            </div>
            <div style={flexInput}>
              <label style={smallLabel}>Imagen URL (Opcional)</label>
              <input type="text" style={inputStyle} value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{...btnSubmit, backgroundColor: loading ? '#2a2a35' : '#8b5cf6'}}>
            {loading ? 'PROCESANDO...' : isEditing ? 'GUARDAR CAMBIOS' : 'PUBLICAR TORNEO'}
          </button>
          
          {isEditing && (
            <button type="button" onClick={() => { setIsEditing(null); setFormData({name:'',game:'',prize:'',maxPlayers:'',image:'',date:'',time:''}); }} style={btnCancelEdit}>
              CANCELAR EDICIÓN
            </button>
          )}
        </form>
      ) : (
        <div style={listContainer}>
          <h3 style={{ color: '#8b5cf6', marginBottom: '20px', fontSize: 'clamp(1rem, 4vw, 1.2rem)' }}>TORNEOS EXISTENTES</h3>
          {fetching ? <p style={{color: '#9ca3af'}}>Cargando lista...</p> : tournaments.length === 0 ? <p style={{color: '#9ca3af'}}>No hay torneos creados.</p> : tournaments.map(t => (
            <div key={t._id} style={itemCard}>
              <img src={t.image} alt="" style={itemImg} loading="lazy" />
              <div style={{ flex: '1 1 150px', minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: 'clamp(0.9rem, 3.5vw, 1rem)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</h4>
                <p style={{ margin: '4px 0 0 0', fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)', color: '#9ca3af' }}>{t.game} • {t.date} • {t.time}</p>
              </div>
              <div style={itemActions}>
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

// --- ESTILOS OPTIMIZADOS PARA MÓVIL ---

const containerStyle = { 
  maxWidth: '800px', 
  margin: 'clamp(10px, 3vw, 40px) auto', 
  padding: 'clamp(15px, 4vw, 20px)', 
  color: 'white', 
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box'
};

const adminHeader = { 
  display: 'flex', 
  flexWrap: 'wrap', 
  alignItems: 'center', 
  justifyContent: 'space-between',
  gap: '15px',
  marginBottom: 'clamp(20px, 5vw, 30px)', 
  backgroundColor: '#16161e', 
  padding: 'clamp(15px, 4vw, 20px)', 
  borderRadius: '20px', 
  border: '1px solid #2a2a35' 
};

const headerInfo = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: 'clamp(10px, 3vw, 20px)', 
  flex: '1 1 250px' 
};

const adminAvatar = { 
  width: 'clamp(50px, 12vw, 60px)', 
  height: 'clamp(50px, 12vw, 60px)', 
  borderRadius: '50%', 
  border: '2px solid #8b5cf6', 
  objectFit: 'cover',
  backgroundColor: '#0f0f12'
};

const statusBadge = { 
  position: 'absolute', 
  bottom: '2px', 
  right: '2px', 
  width: 'clamp(10px, 3vw, 12px)', 
  height: 'clamp(10px, 3vw, 12px)', 
  backgroundColor: '#10b981', 
  borderRadius: '50%', 
  border: '2px solid #16161e' 
};

const headerTitle = { 
  color: '#8b5cf6', 
  fontSize: 'clamp(1.2rem, 5vw, 1.8rem)', 
  margin: 0, 
  fontWeight: '900',
  letterSpacing: '1px'
};

const btnLogout = { 
  backgroundColor: 'transparent', 
  border: '1px solid #ef4444', 
  color: '#ef4444', 
  padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 20px)', 
  borderRadius: '10px', 
  cursor: 'pointer', 
  fontWeight: '800', 
  fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)',
  transition: 'all 0.3s ease',
  flex: '0 1 auto'
};

const tabsContainer = { 
  display: 'flex', 
  gap: 'clamp(6px, 2vw, 10px)', 
  marginBottom: 'clamp(15px, 4vw, 25px)' 
};

const tabActive = { 
  flex: 1, 
  padding: 'clamp(12px, 3vw, 14px)', 
  backgroundColor: '#8b5cf6', 
  border: '1px solid #8b5cf6', 
  color: 'white', 
  borderRadius: '12px', 
  fontWeight: '800', 
  fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)',
  cursor: 'pointer',
  transition: 'all 0.3s ease'
};

const tabInactive = { 
  ...tabActive, 
  backgroundColor: '#1a1a24', 
  border: '1px solid #2a2a35', 
  color: '#9ca3af' 
};

const formStyle = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: 'clamp(15px, 4vw, 20px)', 
  backgroundColor: '#16161e', 
  padding: 'clamp(15px, 4vw, 25px)', 
  borderRadius: '24px', 
  border: '1px solid #2a2a35' 
};

const sectionLabel = { 
  display: 'block', 
  marginBottom: 'clamp(10px, 3vw, 15px)', 
  fontWeight: '800',
  color: '#fff',
  fontSize: 'clamp(0.9rem, 3vw, 1rem)'
};

const gameGrid = { 
  display: 'grid', 
  // Bajé un poco el minmax para que en celus chicos entren al menos 2 cómodos
  gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', 
  gap: 'clamp(8px, 2vw, 12px)' 
};

const gameCard = { 
  position: 'relative', 
  height: 'clamp(80px, 20vw, 100px)', 
  borderRadius: '12px', 
  overflow: 'hidden', 
  cursor: 'pointer', 
  transition: 'all 0.2s ease',
  backgroundColor: '#0f0f12'
};

const gameImg = { width: '100%', height: '100%', objectFit: 'cover' };
const gameNameLabel = { 
  position: 'absolute', 
  bottom: 0, 
  width: '100%', 
  backgroundColor: 'rgba(0,0,0,0.8)', 
  fontSize: 'clamp(0.65rem, 2vw, 0.75rem)', 
  textAlign: 'center', 
  padding: '4px 0',
  fontWeight: '600'
};

const inputRow = { 
  display: 'flex', 
  flexWrap: 'wrap', // CLAVE para móviles: si no hay espacio, se acomodan abajo
  gap: 'clamp(10px, 3vw, 15px)' 
};

const flexInput = { 
  // Esta regla permite que los inputs ocupen la mitad en PC y el 100% en celu
  flex: '1 1 min(100%, 250px)',
  display: 'flex',
  flexDirection: 'column'
};

const smallLabel = { 
  fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)', 
  color: '#9ca3af', 
  marginBottom: '6px',
  fontWeight: '600'
};

const inputStyle = { 
  width: '100%', 
  padding: 'clamp(12px, 3vw, 14px)', 
  borderRadius: '10px', 
  backgroundColor: '#0f0f12', 
  border: '1px solid #2a2a35', 
  color: 'white', 
  outline: 'none',
  fontSize: 'clamp(0.85rem, 3vw, 0.95rem)',
  boxSizing: 'border-box' 
};

const btnSubmit = { 
  padding: 'clamp(14px, 4vw, 16px)', 
  color: 'white', 
  border: 'none', 
  borderRadius: '12px', 
  fontWeight: '900', 
  fontSize: 'clamp(0.9rem, 3vw, 1rem)', 
  cursor: 'pointer',
  marginTop: '10px',
  letterSpacing: '1px',
  transition: 'background-color 0.3s ease'
};

const btnCancelEdit = { 
  background: 'none', 
  color: '#ef4444', 
  border: 'none', 
  cursor: 'pointer', 
  fontWeight: '800',
  padding: '10px',
  fontSize: 'clamp(0.8rem, 3vw, 0.9rem)'
};

const listContainer = { 
  backgroundColor: '#16161e', 
  padding: 'clamp(15px, 4vw, 25px)', 
  borderRadius: '24px', 
  border: '1px solid #2a2a35' 
};

const itemCard = { 
  display: 'flex', 
  flexWrap: 'wrap', // Permite que los botones bajen en pantallas minúsculas
  alignItems: 'center', 
  gap: 'clamp(10px, 3vw, 15px)', 
  padding: 'clamp(12px, 3vw, 15px)', 
  backgroundColor: '#0f0f12', 
  borderRadius: '16px', 
  marginBottom: 'clamp(10px, 3vw, 15px)', 
  border: '1px solid #222' 
};

const itemImg = { 
  width: 'clamp(45px, 12vw, 60px)', 
  height: 'clamp(45px, 12vw, 60px)', 
  borderRadius: '10px', 
  objectFit: 'cover' 
};

const itemActions = { 
  display: 'flex', 
  gap: '10px',
  flex: '0 1 auto' 
};

const btnEdit = { 
  backgroundColor: '#8b5cf6', 
  color: 'white', 
  border: 'none', 
  padding: 'clamp(8px, 2vw, 10px) clamp(10px, 3vw, 15px)', 
  borderRadius: '8px', 
  cursor: 'pointer', 
  fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)', 
  fontWeight: '800' 
};

const btnDelete = { 
  backgroundColor: 'transparent', 
  color: '#ef4444', 
  border: '1px solid #ef4444', 
  padding: 'clamp(8px, 2vw, 10px) clamp(10px, 3vw, 15px)', 
  borderRadius: '8px', 
  cursor: 'pointer', 
  fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)',
  fontWeight: '800'
};