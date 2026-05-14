
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

export const Profile = ({ user, setUser }) => {
  const [misTorneos, setMisTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('torneos');

  const [gameIds, setGameIds] = useState({
    fortnite: user?.gameIds?.fortnite || '',
    valorant: user?.gameIds?.valorant || '',
    lol: user?.gameIds?.lol || ''
  });

  const CLIENT_ID = '1504173791872290816';
  const REDIRECT_URI = encodeURIComponent(window.location.origin + '/profile');

  const alertStyle = {
    background: '#16161e', color: '#fff', confirmButtonColor: '#8b5cf6',
    borderRadius: '15px', border: '1px solid #2a2a35'
  };

  const AVATARES = [
    { id: 1, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { id: 2, url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Zoe' },
    { id: 3, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Warrior' },
    { id: 4, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max' },
    { id: 5, url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Buster' },
    { id: 6, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Hero' },
    { id: 7, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
    { id: 8, url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Gamer' },
    { id: 9, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Dragon' },
    { id: 10, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ghost' }
  ];

  useEffect(() => {
    const handleDiscordAndTournaments = async () => {
      const userId = user?._id || user?.id;
      if (!userId) { setLoading(false); return; }

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        try {
          const token = user?.token;
          if (token) {
            const res = await axios.post(
              'https://gamehub-praweb.onrender.com/api/auth/discord',
              { code },
              { headers: { 'x-auth-token': token } }
            );
            await Swal.fire({ ...alertStyle, title: '¡VINCULADO!', text: 'Discord conectado 🚀', icon: 'success' });
            const updatedUser = { ...user, ...res.data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            window.history.replaceState({}, document.title, "/profile");
          }
        } catch (err) {
          Swal.fire({ ...alertStyle, title: 'ERROR', text: 'No se pudo conectar Discord.', icon: 'error' });
        }
      }

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
  }, [user]);

  const handleAvatarSelect = async (url) => {
    try {
      Swal.fire({ title: 'Actualizando...', background: '#16161e', color: '#fff', didOpen: () => Swal.showLoading() });
      await axios.put(`https://gamehub-praweb.onrender.com/api/auth/update-avatar`, { photoURL: url }, { headers: { 'x-auth-token': user.token } });
      const updatedUser = { ...user, photoURL: url };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      Swal.fire({ ...alertStyle, title: '¡Avatar actualizado!', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (error) {
      const updatedUser = { ...user, photoURL: url };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      Swal.fire({ ...alertStyle, title: 'Actualizado', text: 'Cambio guardado localmente.', icon: 'info', timer: 1500 });
    }
  };

  const saveGameIds = () => {
    const updatedUser = { ...user, gameIds: gameIds };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    Swal.fire({ ...alertStyle, title: '¡IDs Guardadas!', icon: 'success', timer: 2000, showConfirmButton: false });
  };

  const handleDiscordConnect = () => {
    if (user.discordId) return; // Evita disparar si ya existe
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=identify`;
  };

  if (!user) return <div style={msgStyle}>Cargando perfil...</div>;

  return (
    <div style={containerStyle}>
      <div style={profileCard}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img 
            src={user.photoURL || user.photo || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
            alt="Avatar" style={avatarStyle} 
          />
          {/* CÍRCULO DE DISCORD (EL QUE HABÍA DESAPARECIDO) */}
          {(user.discordId || user.discordTag) && (
            <img 
              src="https://cdn-icons-png.flaticon.com/512/2111/2111370.png" 
              alt="Discord Connected" 
              style={badgeDiscord} 
            />
          )}
        </div>
        <h2 style={{ margin: '10px 0', textTransform: 'capitalize' }}>{user.username || user.name}</h2>
        <p style={{ color: '#8b5cf6', margin: '0', fontWeight: 'bold', fontSize: '0.9rem' }}>{user.email}</p>
        
        <div style={{ marginTop: '15px' }}>
          {/* BOTÓN CON LÓGICA DE BLOQUEO */}
          <button 
            onClick={handleDiscordConnect} 
            disabled={!!user.discordId || !!user.discordTag}
            style={{
              ...btnDiscord,
              backgroundColor: (user.discordId || user.discordTag) ? '#2a2a35' : '#5865F2',
              cursor: (user.discordId || user.discordTag) ? 'not-allowed' : 'pointer',
              opacity: (user.discordId || user.discordTag) ? 0.8 : 1,
              border: (user.discordId || user.discordTag) ? '1px solid #444' : 'none'
            }}
          >
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111370.png" width="16" alt="" />
            {(user.discordId || user.discordTag) ? `VINCULADO: ${user.discordTag || 'OK'}` : 'CONECTAR DISCORD'}
          </button>
        </div>

        <div style={{ marginTop: '20px', borderTop: '1px solid #2a2a35', paddingTop: '15px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', justifyContent: 'center' }}>
            {AVATARES.map(av => (
              <img 
                key={av.id} src={av.url} alt="opción" 
                onClick={() => handleAvatarSelect(av.url)}
                style={{ 
                    width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', 
                    border: user.photoURL === av.url ? '2px solid #8b5cf6' : '1px solid #333'
                }} 
              />
            ))}
          </div>
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
              <div style={inputGroup}><label style={labelStyle}>Fortnite</label>
              <input type="text" value={gameIds.fortnite} onChange={(e) => setGameIds({...gameIds, fortnite: e.target.value})} style={inputStyle} placeholder="Tu Epic Name" /></div>
              <div style={inputGroup}><label style={labelStyle}>Valorant</label>
              <input type="text" value={gameIds.valorant} onChange={(e) => setGameIds({...gameIds, valorant: e.target.value})} style={inputStyle} placeholder="Usuario#Tag" /></div>
              <div style={inputGroup}><label style={labelStyle}>League of Legends</label>
              <input type="text" value={gameIds.lol} onChange={(e) => setGameIds({...gameIds, lol: e.target.value})} style={inputStyle} placeholder="Invocador#Region" /></div>
              <button style={btnSave} onClick={saveGameIds}>GUARDAR CONFIGURACIÓN</button>
            </div>
          </div>
        )}

        {activeTab === 'datos' && (
          <div>
            <h3 style={titleSection}>👤 DETALLES DE CUENTA</h3>
            <div style={formStyle}>
              <div style={dataRow}><span style={dataKey}>Email</span><span style={dataValue}>{user.email}</span></div>
              <div style={dataRow}><span style={dataKey}>Usuario</span><span style={dataValue}>{user.username || user.displayName}</span></div>
              <div style={dataRow}><span style={dataKey}>GameHub ID</span><span style={dataValue}>{user._id || user.uid}</span></div>
              <button style={btnDanger} onClick={() => Swal.fire({...alertStyle, title: 'Seguridad', text: 'Revisá tu email para restablecer contraseña.', icon: 'info'})}>RESTABLECER CONTRASEÑA</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- ESTILOS --- */
const containerStyle = { padding: '40px 20px', maxWidth: '700px', margin: '0 auto', color: 'white', fontFamily: 'Inter, sans-serif' };
const profileCard = { textAlign: 'center', backgroundColor: '#16161e', padding: '30px', borderRadius: '24px', border: '1px solid #2a2a35', marginBottom: '20px' };
const avatarStyle = { width: '100px', height: '100px', borderRadius: '50%', border: '3px solid #8b5cf6', objectFit: 'cover' };
const badgeDiscord = { position: 'absolute', bottom: '0', right: '0', width: '25px', backgroundColor: '#5865F2', borderRadius: '50%', padding: '5px', border: '2px solid #16161e', zIndex: 2 };
const tabsContainer = { display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '15px' };
const tabActive = { flex: 1, padding: '12px', backgroundColor: '#8b5cf6', border: 'none', color: 'white', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' };
const tabInactive = { flex: 1, padding: '12px', backgroundColor: '#1a1a24', border: '1px solid #2a2a35', color: '#9ca3af', borderRadius: '12px', cursor: 'pointer' };
const contentSection = { backgroundColor: '#16161e', padding: '25px', borderRadius: '24px', border: '1px solid #2a2a35', minHeight: '320px' };
const titleSection = { fontSize: '0.9rem', color: '#8b5cf6', borderBottom: '1px solid #2a2a35', paddingBottom: '10px', marginBottom: '20px', textTransform: 'uppercase' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '6px' };
const labelStyle = { fontSize: '0.8rem', color: '#9ca3af' };
const inputStyle = { padding: '12px', backgroundColor: '#0f0f12', border: '1px solid #333', borderRadius: '10px', color: 'white', outline: 'none' };
const btnSave = { backgroundColor: '#8b5cf6', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };
const btnDanger = { backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '10px', borderRadius: '10px', cursor: 'pointer', marginTop: '20px', fontSize: '0.8rem' };
const dataRow = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #1f1f27' };
const dataKey = { color: '#9ca3af', fontSize: '0.9rem' };
const dataValue = { color: '#fff', fontSize: '0.9rem' };
const miniCard = { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#0f0f12', padding: '12px', borderRadius: '15px', border: '1px solid #2a2a35' };
const miniImg = { width: '55px', height: '35px', objectFit: 'cover', borderRadius: '6px' };
const btnDiscord = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'white', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.85rem', width: 'fit-content', margin: '0 auto', transition: '0.3s' };
const gridStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const cardLink = { textDecoration: 'none', color: 'inherit' };
const textCenter = { textAlign: 'center', color: '#666' };
const msgStyle = { textAlign: 'center', color: 'white', marginTop: '100px' };