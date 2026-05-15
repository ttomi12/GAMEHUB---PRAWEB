import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Lista para el buscador
const AVAILABLE_GAMES = ['Fortnite', 'Clash Royale', 'Rocket League', 'Valorant', 'League of Legends', 'CS:GO'];

export const Navbar = ({ user, logout }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Lógica de búsqueda y sugerencias
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = AVAILABLE_GAMES.filter(game =>
        game.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectGame = (gameName) => {
    navigate(`/tournaments/${gameName}`);
    setSearchTerm("");
    setShowSuggestions(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const found = AVAILABLE_GAMES.find(g => g.toLowerCase() === searchTerm.toLowerCase());
      navigate(`/tournaments/${found || searchTerm}`);
      setSearchTerm("");
      setShowSuggestions(false);
    }
  };

  return (
    <nav style={navStyle}>
      
      {/* 1. LOGO */}
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h2 style={logoStyle}>
          GAME<span style={{ color: '#8b5cf6' }}>HUB</span>
        </h2>
      </Link>

      {/* 2. BUSCADOR CENTRAL CON SUGERENCIAS */}
      <div ref={searchRef} style={searchContainerStyle}>
        <form onSubmit={handleSearch} style={searchFormStyle}>
          <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Buscar..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
            style={searchInputStyle}
          />
        </form>

        {showSuggestions && suggestions.length > 0 && (
          <div style={suggestionBoxStyle}>
            {suggestions.map((game, index) => (
              <div 
                key={index}
                onClick={() => handleSelectGame(game)}
                style={suggestionItemStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#8b5cf6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                🎮 {game}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. SECCIÓN DE USUARIO */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {user ? (
          <div 
            onClick={() => navigate('/profile')} 
            style={profileTriggerStyle}
          >
            <div style={userInfoStyle}>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'white', textTransform: 'capitalize' }}>
                {user.username || user.name}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#10b981' }}>● En línea</div>
            </div>
            <img 
              // PRIORIDAD: photoURL del perfil > photo del login > avatar por defecto
              src={user.photoURL || user.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
              alt="Avatar" 
              style={avatarStyle} 
            />
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => navigate('/login')} style={loginButtonStyle}>Entrar</button>
          </div>
        )}
      </div>

    </nav>
  );
};

/* --- ESTILOS EN OBJETOS ACTUALIZADOS --- */

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  height: '70px',
  backgroundColor: '#16161e',
  borderBottom: '1px solid #2a2a35',
  position: 'sticky',
  top: 0,
  zIndex: 1000
};

const logoStyle = {
  color: 'white',
  margin: 0,
  fontSize: '1.2rem',
  fontWeight: '900',
  letterSpacing: '1px'
};

const searchContainerStyle = {
  width: '40%',
  maxWidth: '300px',
  position: 'relative'
};

const searchFormStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#0f0f12',
  borderRadius: '10px',
  padding: '6px 12px',
  border: '1px solid #333'
};

const searchInputStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  color: 'white',
  outline: 'none',
  width: '100%',
  marginLeft: '8px',
  fontSize: '0.85rem'
};

const suggestionBoxStyle = {
  position: 'absolute',
  top: '120%',
  left: 0,
  width: '100%',
  backgroundColor: '#16161e',
  borderRadius: '10px',
  border: '1px solid #8b5cf6',
  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
  overflow: 'hidden',
  zIndex: 1100
};

const suggestionItemStyle = {
  padding: '10px 15px',
  color: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontSize: '0.8rem'
};

const profileTriggerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  padding: '5px',
  borderRadius: '12px',
  transition: '0.3s'
};

const userInfoStyle = {
  textAlign: 'right',
  display: 'block', // Se puede ocultar en móviles muy pequeños si quieres
};

const avatarStyle = {
  width: '35px',
  height: '35px',
  borderRadius: '50%',
  border: '2px solid #8b5cf6',
  backgroundColor: '#2a2a35',
  objectFit: 'cover'
};

const loginButtonStyle = {
  background: '#8b5cf6',
  color: 'white',
  border: 'none',
  padding: '8px 15px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '0.85rem'
};