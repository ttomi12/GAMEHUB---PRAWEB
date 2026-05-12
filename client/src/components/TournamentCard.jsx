const TournamentCard = ({ t, onJoin }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/tournament/${t._id}`)} // Redirige a la pestaña de info
      style={{
        backgroundColor: '#1a1a20',
        borderRadius: '12px',
        overflow: 'hidden', // Importante para el zoom
        cursor: 'pointer',
        border: '1px solid #333',
        transition: 'border-color 0.3s ease'
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
    >
      {/* Contenedor de Imagen con Efecto */}
      <div style={{ width: '100%', height: '180px', overflow: 'hidden' }}>
        <img 
          src={t.image || "https://via.placeholder.com/400x200?text=Game+Image"} 
          alt={t.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease' // Suaviza el zoom
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        />
      </div>

      {/* Info debajo de la foto */}
      <div style={{ padding: '15px' }}>
        <h3 style={{ color: '#8b5cf6', margin: '0' }}>{t.name}</h3>
        <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{t.game}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <span style={{ fontWeight: 'bold' }}>${t.prize} USD</span>
          <span style={{ color: '#10b981' }}>Cupos: {t.maxPlayers}</span>
        </div>
      </div>
    </div>
  );
};