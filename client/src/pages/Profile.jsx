import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export const Profile = ({ user }) => {
  const [misTorneos, setMisTorneos] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- CONFIGURACIÓN DISCORD ---
  const CLIENT_ID = '1504173791872290816'; 
  const REDIRECT_URI = encodeURIComponent(window.location.origin + '/profile');

  useEffect(() => {
    const handleDiscordAndTournaments = async () => {
      const userId = user?._id || user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      // 1. Lógica para detectar y procesar el código de Discord
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          const savedUser = JSON.parse(localStorage.getItem('user'));
          const token = savedUser?.token;

          if (token) {
            const res = await axios.post(
              'https://gamehub-praweb.onrender.com/api/auth/discord',
              { code },
              { headers: { 'x-auth-token': token } }
            );

            alert("¡Cuenta de Discord vinculada con éxito! 🚀");
            
            // Actualizamos el objeto user en el localStorage
            const updatedUser = { ...savedUser, ...res.data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Limpiamos la URL y recargamos para aplicar cambios
            window.history.replaceState({}, document.title, "/profile");
            window.location.reload(); 
            return; // Salimos para evitar doble carga
          }
        } catch (err) {
          console.error("Error al vincular Discord:", err.response?.data || err.message);
          alert("Hubo un error al conectar con Discord.");
          window.history.replaceState({}, document.title, "/profile");
        }
      }

      // 2. Lógica para traer tus torneos
      try {
        const res = await axios.get('https://gamehub-praweb.onrender.com/api/tournaments');
        const torneosFiltrados = res.data.filter(torneo => 
          torneo.players?.some(p => (p._id === userId || p === userId))
        );
        setMisTorneos(torneosFiltrados);
      } catch (error) {
        console.error("Error al traer torneos del perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    handleDiscordAndTournaments();
  }, [user]);

  const handleDiscordConnect = () => {
    const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=identify`;
    window.location.href = discordUrl;
  };

  if (!user) return <div style={msgStyle}>Cargando perfil...</div>;

  const userIdToShow = user._id || user.id || "Sin ID";

  return (
    <div style={containerStyle}>
      {/* SECCIÓN INFORMACIÓN DE USUARIO */}
      <div style={profileCard}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <img 
              src={user.photoURL || user.photo || "https://cdn-icons-png.flaticon.com/512/633/633779.png"} 
              alt="Avatar" 
              style={avatarStyle} 
            />
            {user.discordId && (
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/2111/2111370.png" 
                    alt="Discord Icon" 
                    style={badgeDiscord} 
                />
            )}
        </div>
        
        <h2 style={{ margin: '10px 0', textTransform: 'capitalize' }}>{user.username || user.name}</h2>
        <p style={{ color: '#8b5cf6', margin: '0', fontWeight: 'bold' }}>{user.email}</p>
        <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '5px' }}>ID: {userIdToShow}</p>

        {/* BOTÓN O INFO DE DISCORD */}
        <div style={{ marginTop: '20px' }}>
          {user.discordTag ? (
            <div style={discordStatusActive}>
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111370.png" width="18" alt="" />
              <span>{user.discordTag}</span>
            </div>
          ) : (
            <button onClick={handleDiscordConnect} style={btnDiscord}>
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111370.png" width="20" alt="" />
              CONECTAR DISCORD
            </button>
          )}
        </div>
      </div>

      {/* SECCIÓN MIS INSCRIPCIONES */}
      <div style={sectionStyle}>
        <h3 style={titleSection}>🏆 MIS TORNEOS</h3>
        
        {loading ? (
          <p style={textCenter}>Buscando tus inscripciones...</p>
        ) : misTorneos.length > 0 ? (
          <div style={gridStyle}>
            {misTorneos.map((torneo) => (
              <Link to={`/tournament/${torneo._id || torneo.id}`} key={torneo._id || torneo.id} style={cardLink}>
                <div style={miniCard}>
                  <img src={torneo.image} alt={torneo.name} style={miniImg} />
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#fff' }}>{torneo.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#8b5cf6', margin: 0 }}>
                      {torneo.game} • {torneo.date} • {torneo.time}
                    </p>
                  </div>
                  <div style={{ marginLeft: 'auto', color: '#10b981', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    ✓ INSCRIPTO
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={emptyState}>
            <p style={{ marginBottom: '15px' }}>No figuras en ningún torneo todavía.</p>
            <Link to="/" style={exploreBtn}>VER TORNEOS DISPONIBLES</Link>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- ESTILOS --- */
const containerStyle = { padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: 'white', fontFamily: 'Inter, sans-serif' };
const profileCard = { textAlign: 'center', backgroundColor: '#16161e', padding: '30px', borderRadius: '20px', border: '1px solid #2a2a35', marginBottom: '40px' };
const avatarStyle = { width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #8b5cf6', objectFit: 'cover' };
const badgeDiscord = { position: 'absolute', bottom: '5px', right: '5px', width: '30px', backgroundColor: '#5865F2', borderRadius: '50%', padding: '5px', border: '2px solid #16161e' };
const btnDiscord = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '0 auto', backgroundColor: '#5865F2', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' };
const discordStatusActive = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: 'rgba(88, 101, 242, 0.1)', color: '#5865F2', padding: '10px 20px', borderRadius: '8px', border: '1px solid #5865F2', width: 'fit-content', margin: '0 auto' };
const sectionStyle = { marginTop: '20px' };
const titleSection = { borderBottom: '2px solid #8b5cf6', paddingBottom: '10px', marginBottom: '20px', letterSpacing: '1px', fontWeight: '800' };
const gridStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const cardLink = { textDecoration: 'none' };
const miniCard = { display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#16161e', padding: '15px', borderRadius: '12px', border: '1px solid #2a2a35', transition: '0.3s' };
const miniImg = { width: '100px', height: '60px', objectFit: 'cover', borderRadius: '8px' };
const emptyState = { textAlign: 'center', padding: '40px', backgroundColor: '#16161e', borderRadius: '15px', border: '1px dashed #444' };
const exploreBtn = { display: 'inline-block', backgroundColor: '#8b5cf6', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' };
const msgStyle = { textAlign: 'center', color: 'white', marginTop: '100px' };
const textCenter = { textAlign: 'center', color: '#aaa' };