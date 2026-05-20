
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

export const Profile = ({ user, setUser }) => {
  const [misTorneos, setMisTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('torneos');
  const [uploading, setUploading] = useState(false);

  // Inicializamos incorporando clashroyale directamente desde el objeto del usuario
  const [gameIds, setGameIds] = useState({
    fortnite: user?.gameIds?.fortnite || '',
    valorant: user?.gameIds?.valorant || '',
    lol: user?.gameIds?.lol || '',
    clashroyale: user?.gameIds?.clashroyale || '' // AGREGADO: Estado inicial
  });

  // Efecto para mantener sincronizados los inputs de Game IDs si el usuario cambia
  useEffect(() => {
    if (user?.gameIds) {
      setGameIds({
        fortnite: user.gameIds.fortnite || '',
        valorant: user.gameIds.valorant || '',
        lol: user.gameIds.lol || '',
        clashroyale: user.gameIds.clashroyale || '' // AGREGADO: Sincronización
      });
    }
  }, [user]);

  const CLIENT_ID = '1504173791872290816';
  const REDIRECT_URI = encodeURIComponent(window.location.origin + '/profile');

  // CORRECCIÓN SWEETALERT: Quitamos borderRadius y border directos para que no tire warning en consola
  const alertStyle = {
    background: '#16161e', 
    color: '#fff', 
    confirmButtonColor: '#8b5cf6'
  };

  useEffect(() => {
    const handleDiscordAndTournaments = async () => {
      const userId = user?._id || user?.id;
      if (!userId) { setLoading(false); return; }

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      // --- LOGICA DE VINCULACIÓN DISCORD ---
      if (code) {
        try {
          const res = await axios.post(
            'https://gamehub-praweb.onrender.com/api/auth/discord',
            { code },
            { headers: { 'x-auth-token': user?.token || localStorage.getItem('token') } }
          );
          
          const updatedUser = { ...user, ...res.data.user };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);

          Swal.fire({ ...alertStyle, title: '¡VINCULADO!', text: 'Discord conectado 🚀', icon: 'success' });
          window.history.replaceState({}, document.title, "/profile");
        } catch (err) {
          Swal.fire({ ...alertStyle, title: 'ERROR', text: 'No se pudo conectar Discord.', icon: 'error' });
        }
      }

      // --- CARGAR TORNEOS DEL USUARIO ---
      try {
        const res = await axios.get('https://gamehub-praweb.onrender.com/api/tournaments');
        const torneosFiltrados = res.data.filter(torneo => 
          torneo.players?.some(p => (p._id === userId || p === userId))
        );
        setMisTorneos(torneosFiltrados);
      } catch (error) {
        console.error("Error al traer torneos:", error);
      } finally {
        setLoading(false);
      }
    };
    handleDiscordAndTournaments();
  }, [user?.token, user?._id, user?.id]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.location.replace('/');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    Swal.fire({
      title: 'Procesando imagen...',
      background: '#16161e', color: '#fff',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const formData = new FormData();
    formData.append('image', file);

    try {
      const tokenActivo = user?.token || localStorage.getItem('token');
      
      const res = await axios.put(
        `https://gamehub-praweb.onrender.com/api/auth/update-profile`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': tokenActivo,
            'Authorization': `Bearer ${tokenActivo}`
          }
        }
      );

      const updatedUserFromDB = { ...user, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUserFromDB));
      setUser(updatedUserFromDB);

      setUploading(false);
      Swal.close();
      Swal.fire({ ...alertStyle, title: '¡Foto actualizada!', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (error) {
      console.error("Error completo de subida:", error.response || error);
      setUploading(false);
      Swal.close();
      Swal.fire({ 
        ...alertStyle, 
        title: 'Error', 
        text: error.response?.data?.msg || 'Fallo al subir la imagen en el servidor', 
        icon: 'error' 
      });
    }
  };

  // --- LOGICA DE GUARDADO FIABLE Y PERSISTENTE ---
  const saveGameIds = async () => {
    try {
      const tokenActivo = user?.token || localStorage.getItem('token');

      const res = await axios.put(
        `https://gamehub-praweb.onrender.com/api/auth/update-profile`, 
        { gameIds: gameIds }, 
        { 
          headers: { 
            'x-auth-token': tokenActivo,
            'Authorization': `Bearer ${tokenActivo}`
          } 
        }
      );

      // CRÍTICO: Reestructuramos el objeto combinando el token actual y forzando la inyección de gameIds
      const updatedUserFromBackend = res.data.user || res.data;
      
      const fullUpdatedUser = {
        ...user,
        ...updatedUserFromBackend,
        gameIds: gameIds // Inyección directa del estado local para blindar la consistencia
      };

      // Guardado explícito para evitar pérdidas en el refresh
      localStorage.setItem('user', JSON.stringify(fullUpdatedUser));
      setUser(fullUpdatedUser);
      
      Swal.fire({ ...alertStyle, title: '¡IDs Guardadas!', icon: 'success', timer: 2000, showConfirmButton: false });
    } catch (error) {
      console.error(error);
      Swal.fire({ ...alertStyle, title: 'Error', text: 'No se pudieron guardar las IDs.', icon: 'error' });
    }
  };

  const handleDiscordConnect = () => {
    if (user.discordId || user.discordTag) return;
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=identify`;
  };

  if (!user) return <div style={msgStyle}>Cargando perfil...</div>;

  return (
    <div style={containerStyle}>
      <div style={profileCard}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img 
            src={user.photoURL || user.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
            alt="Avatar" style={avatarStyle} 
          />
          <label style={uploadLabelStyle}>
            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" disabled={uploading} />
            {uploading ? '...' : '📷'}
          </label>

          {(user.discordId || user.discordTag) && (
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111370.png" alt="Discord" style={badgeDiscord} />
          )}
        </div>
        <h2 style={{ margin: '10px 0', textTransform: 'capitalize' }}>{user.username || user.name}</h2>
        <p style={{ color: '#8b5cf6', margin: '0', fontWeight: 'bold', fontSize: '0.9rem' }}>{user.email}</p>
        
        <div style={{ marginTop: '15px' }}>
          <button 
            onClick={handleDiscordConnect} 
            disabled={!!user.discordId || !!user.discordTag}
            style={{
              ...btnDiscord,
              backgroundColor: (user.discordId || user.discordTag) ? '#2a2a35' : '#5865F2',
              cursor: (user.discordId || user.discordTag) ? 'default' : 'pointer'
            }}
          >
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111370.png" width="16" alt="" />
            {(user.discordId || user.discordTag) ? `VINCULADO: ${user.discordTag || 'Discord OK'}` : 'CONECTAR DISCORD'}
          </button>
        </div>
      </div>

      <div style={tabsContainer}>
        <button onClick={() => setActiveTab('torneos')} style={activeTab === 'torneos' ? tabActive : tabInactive}>MIS TORNEOS</button>
        <button onClick={() => setActiveTab('ids')} style={activeTab === 'ids' ? tabActive : tabInactive}>IDS JUEGOS</button>
        <button onClick={() => setActiveTab('datos')} style={activeTab === 'datos' ? tabActive : tabInactive}>MIS DATOS</button>
      </div>

      <div style={contentSection}>
        {activeTab === 'torneos' && (
          <div>
            <h3 style={titleSection}>🏆 MIS INSCRIPCIONES</h3>
            {loading ? <p style={textCenter}>Buscando...</p> : misTorneos.length > 0 ? (
              <div style={gridStyle}>
                {misTorneos.map((torneo) => (
                  <Link to={`/tournament/${torneo._id}`} key={torneo._id} style={cardLink}>
                    <div style={miniCard}>
                      <img src={torneo.image} alt="" style={miniImg} />
                      <div style={{flex: 1}}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{torneo.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: '#8b5cf6', margin: 0 }}>{torneo.date} • {torneo.time}</p>
                      </div>
                      <div style={{ color: '#10b981', fontSize: '0.7rem', fontWeight: 'bold' }}>CONFIRMADO</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
                <div style={{textAlign: 'center', padding: '20px'}}>
                    <p style={{color: '#666', fontSize: '0.9rem'}}>No estás inscripto en ningún torneo.</p>
                    <Link to="/" style={{color: '#8b5cf6', fontSize: '0.8rem', fontWeight: 'bold'}}>Explorar Torneos</Link>
                </div>
            )}
          </div>
        )}

        {activeTab === 'ids' && (
          <div>
            <h3 style={titleSection}>🎮 IDENTIDADES DE JUEGO</h3>
            <div style={formStyle}>
              <div style={inputGroup}>
                <label style={labelStyle}>Fortnite</label>
                <input type="text" value={gameIds.fortnite} onChange={(e) => setGameIds({...gameIds, fortnite: e.target.value})} style={inputStyle} placeholder="Tu Epic Name" />
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>Valorant</label>
                <input type="text" value={gameIds.valorant} onChange={(e) => setGameIds({...gameIds, valorant: e.target.value})} style={inputStyle} placeholder="Usuario#Tag" />
              </div>
              <div style={inputGroup}>
                <label style={labelStyle}>League of Legends</label>
                <input type="text" value={gameIds.lol} onChange={(e) => setGameIds({...gameIds, lol: e.target.value})} style={inputStyle} placeholder="Invocador#Region" />
              </div>
              
              {/* SECCIÓN AGREGADA: CLASH ROYALE */}
              <div style={inputGroup}>
                <label style={labelStyle}>Clash Royale</label>
                <input type="text" value={gameIds.clashroyale} onChange={(e) => setGameIds({...gameIds, clashroyale: e.target.value})} style={inputStyle} placeholder="Tu Tag de Jugador (Ej: #9URV8G2)" />
              </div>

              <button style={btnSave} onClick={saveGameIds}>GUARDAR CONFIGURACIÓN</button>
            </div>
          </div>
        )}

        {activeTab === 'datos' && (
          <div>
            <h3 style={titleSection}>👤 DETALLES DE CUENTA</h3>
            <div style={formStyle}>
              <div style={dataRow}><span style={dataKey}>Email</span><span style={dataValue}>{user.email}</span></div>
              <div style={dataRow}><span style={dataKey}>Usuario</span><span style={dataValue}>{user.username}</span></div>
              <div style={dataRow}><span style={dataKey}>Rol</span><span style={{...dataValue, color: user.role === 'admin' ? '#8b5cf6' : '#fff'}}>{user.role || 'Usuario'}</span></div>
              
              <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <button type="button" style={{...btnDanger, borderColor: '#ff4444', color: '#ff4444'}} onClick={handleLogout}>
                  CERRAR SESIÓN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- ESTILOS EN OBJETOS (Mantenidos al 100%) --- */
const containerStyle = { padding: '20px 10px', maxWidth: '700px', margin: '0 auto', color: 'white', fontFamily: 'Inter, sans-serif', minHeight: '100vh' };
const profileCard = { textAlign: 'center', backgroundColor: '#16161e', padding: '25px 15px', borderRadius: '20px', border: '1px solid #2a2a35', marginBottom: '20px' };
const avatarStyle = { width: '90px', height: '90px', borderRadius: '50%', border: '3px solid #8b5cf6', objectFit: 'cover' };
const uploadLabelStyle = { position: 'absolute', bottom: '0', right: '0', backgroundColor: '#8b5cf6', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #16161e', fontSize: '0.8rem', color: 'white', zIndex: 3 };
const badgeDiscord = { position: 'absolute', top: '0', right: '0', width: '22px', backgroundColor: '#5865F2', borderRadius: '50%', padding: '4px', border: '2px solid #16161e', zIndex: 2 };
const tabsContainer = { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '15px', width: '100%' };
const tabActive = { flex: '1 1 100px', padding: '10px 4px', backgroundColor: '#8b5cf6', border: 'none', color: 'white', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.75rem', textAlign: 'center', cursor: 'pointer' };
const tabInactive = { ...tabActive, backgroundColor: '#1a1a24', border: '1px solid #2a2a35', color: '#9ca3af' };
const contentSection = { backgroundColor: '#16161e', padding: '20px 15px', borderRadius: '20px', border: '1px solid #2a2a35', minHeight: '300px' };
const titleSection = { fontSize: '0.85rem', color: '#8b5cf6', borderBottom: '1px solid #2a2a35', paddingBottom: '10px', marginBottom: '20px', textTransform: 'uppercase' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };
const labelStyle = { fontSize: '0.75rem', color: '#9ca3af', textAlign: 'left' };
const inputStyle = { padding: '12px', backgroundColor: '#0f0f12', border: '1px solid #333', borderRadius: '10px', color: 'white', outline: 'none', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' };
const btnSave = { backgroundColor: '#8b5cf6', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', fontSize: '0.9rem' };
const btnDanger = { backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.75rem', width: '100%' };
const dataRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1f1f27', gap: '10px' };
const dataKey = { color: '#9ca3af', fontSize: '0.8rem' };
const dataValue = { color: '#fff', fontSize: '0.8rem', wordBreak: 'break-all' };
const miniCard = { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#0f0f12', padding: '10px', borderRadius: '12px', border: '1px solid #2a2a35' };
const miniImg = { width: '50px', height: '35px', objectFit: 'cover', borderRadius: '4px' };
const btnDiscord = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'white', padding: '10px 15px', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.8rem', width: '100%', maxWidth: '250px', margin: '0 auto', border: 'none' };
const gridStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const cardLink = { textDecoration: 'none', color: 'inherit' };
const textCenter = { textAlign: 'center', color: '#666', fontSize: '0.8rem' };
const msgStyle = { textAlign: 'center', color: 'white', marginTop: '100px' };