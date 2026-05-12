import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from 'react-router-dom';

export const Profile = ({ user }) => {
  const [misTorneos, setMisTorneos] = useState([]);
  const [loading, setLoading] = useState(true);

  // EFECTO: Buscar torneos donde el usuario está inscripto
  useEffect(() => {
    const fetchMisTorneos = async () => {
      if (!user) return;

      try {
        // Consultamos la colección 'tournaments' buscando el UID en el array 'participantes'
        const q = query(
          collection(db, "tournaments"), 
          where("participantes", "array-contains", user.uid)
        );

        const querySnapshot = await getDocs(q);
        const torneos = [];
        querySnapshot.forEach((doc) => {
          // Guardamos el ID de Firebase y los datos
          torneos.push({ id: doc.id, ...doc.data() });
        });

        setMisTorneos(torneos);
      } catch (error) {
        console.error("Error al traer torneos del perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMisTorneos();
  }, [user]);

  if (!user) return <div style={msgStyle}>Cargando perfil...</div>;

  return (
    <div style={containerStyle}>
      {/* SECCIÓN INFORMACIÓN DE USUARIO */}
      <div style={profileCard}>
        <img 
          src={user.photo || "https://cdn-icons-png.flaticon.com/512/633/633779.png"} 
          alt="Avatar" 
          style={avatarStyle} 
        />
        <h2 style={{ margin: '10px 0' }}>{user.name}</h2>
        <p style={{ color: '#8b5cf6', margin: '0' }}>{user.email}</p>
        <p style={{ fontSize: '0.8rem', color: '#555', marginTop: '5px' }}>ID: {user.uid}</p>
      </div>

      {/* SECCIÓN MIS INSCRIPCIONES (DINÁMICA) */}
      <div style={sectionStyle}>
        <h3 style={titleSection}>🏆 MIS TORNEOS</h3>
        
        {loading ? (
          <p style={textCenter}>Buscando tus inscripciones...</p>
        ) : misTorneos.length > 0 ? (
          <div style={gridStyle}>
            {misTorneos.map((torneo) => (
              <Link to={`/tournament/${torneo.id}`} key={torneo.id} style={cardLink}>
                <div style={miniCard}>
                  <img src={torneo.image} alt={torneo.name} style={miniImg} />
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#fff' }}>{torneo.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#8b5cf6', margin: 0 }}>
                      {torneo.game} • {torneo.date}
                    </p>
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

/* --- ESTILOS (Mantenemos la estética Gaming) --- */
const containerStyle = { padding: '40px 20px', maxWidth: '800px', margin: '0 auto', color: 'white' };
const profileCard = { textAlign: 'center', backgroundColor: '#16161e', padding: '30px', borderRadius: '20px', border: '1px solid #2a2a35', marginBottom: '40px' };
const avatarStyle = { width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #8b5cf6', objectFit: 'cover' };
const sectionStyle = { marginTop: '20px' };
const titleSection = { borderBottom: '2px solid #8b5cf6', paddingBottom: '10px', marginBottom: '20px', letterSpacing: '1px' };
const gridStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const cardLink = { textDecoration: 'none' };
const miniCard = { display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#16161e', padding: '15px', borderRadius: '12px', border: '1px solid #2a2a35', transition: '0.3s' };
const miniImg = { width: '100px', height: '60px', objectFit: 'cover', borderRadius: '8px' };
const emptyState = { textAlign: 'center', padding: '40px', backgroundColor: '#16161e', borderRadius: '15px', border: '1px dashed #444' };
const exploreBtn = { display: 'inline-block', backgroundColor: '#8b5cf6', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' };
const msgStyle = { textAlign: 'center', color: 'white', marginTop: '100px' };
const textCenter = { textAlign: 'center', color: '#aaa' };