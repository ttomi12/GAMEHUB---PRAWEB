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
        <h2 style={{ color: 'white', margin: 0, fontSize: '1.6rem', fontWeight: '900', letterSpacing: '1px' }}>
          GAME<span style={{ color: '#8b5cf6' }}>HUB</span>
        </h2>
      </Link>

      {/* 2. BUSCADOR CENTRAL CON SUGERENCIAS */}
      <div ref={searchRef} style={{ width: '35%', position: 'relative' }}>
        <form onSubmit={handleSearch} style={searchFormStyle}>
          <span style={{ color: '#9ca3af' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Buscar juegos..." 
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

      {/* 3. SECCIÓN DE USUARIO / LOGIN */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {user ? (
          /* SI EL USUARIO ESTÁ LOGUEADO */
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div 
              onClick={() => navigate('/profile')} 
              style={profileTriggerStyle}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'white' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#10b981' }}>En línea</div>
              </div>
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt="Avatar" 
                style={avatarStyle} 
              />
            </div>
            <button onClick={logout} style={logoutButtonStyle}>Salir</button>
          </div>
        ) : (
          /* SI NO HAY USUARIO (INVITADO) */
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/login')} style={loginButtonStyle}>
              Iniciar Sesión
            </button>
            <button onClick={() => navigate('/register')} style={registerButtonStyle}>
              Crear Cuenta
            </button>
          </div>
        )}
      </div>

    </nav>
  );
};

/* --- ESTILOS EN OBJETOS --- */

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 40px',
  height: '70px',
  backgroundColor: '#16161e',
  borderBottom: '1px solid #2a2a35',
  position: 'sticky',
  top: 0,
  zIndex: 1000
};

const searchFormStyle = {
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#0f0f12',
  borderRadius: '12px',
  padding: '8px 15px',
  border: '1px solid #333'
};

const searchInputStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  color: 'white',
  outline: 'none',
  width: '100%',
  marginLeft: '10px',
  fontSize: '0.9rem'
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
  padding: '12px 20px',
  color: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontSize: '0.9rem'
};

const profileTriggerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
  padding: '5px 10px',
  borderRadius: '8px',
  transition: 'background 0.3s'
};

const avatarStyle = {
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  border: '2px solid #8b5cf6',
  backgroundColor: '#2a2a35'
};

const loginButtonStyle = {
  background: 'transparent',
  color: 'white',
  border: '1px solid #8b5cf6',
  padding: '8px 18px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  transition: '0.3s'
};

const registerButtonStyle = {
  background: '#8b5cf6',
  color: 'white',
  border: 'none',
  padding: '8px 18px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
};

const logoutButtonStyle = {
  background: '#333',
  color: '#ff4d4d',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 'bold'
};