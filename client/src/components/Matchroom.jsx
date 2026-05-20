import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

// CONEXIÓN AL BACKEND: Apunta directamente a tu servidor de Render
const socket = io('https://gamehub-praweb.onrender.com');

export const Matchroom = ({ user }) => {
  const { id: tournamentId } = useParams(); // Extraemos el ID del torneo desde la URL de la ruta
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Protección de ruta: Si no hay usuario logueado, lo mandamos afuera
    if (!user) {
      navigate('/login');
      return;
    }

    // 1. Unirse a la sala privada del torneo en tiempo real
    socket.emit('join_matchroom', { tournamentId });

    // 2. Escuchar el historial de chats viejos que nos envía el servidor
    socket.on('chat_history', (history) => {
      setMessages(history);
    });

    // 3. Escuchar los nuevos mensajes de otros usuarios en vivo
    socket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Limpieza de los listeners del socket cuando el usuario sale de la pantalla
    return () => {
      socket.off('chat_history');
      socket.off('receive_message');
    };
  }, [tournamentId, user, navigate]);

  // Scroll automático hacia el final del chat cuando se renderiza un nuevo mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      tournamentId,
      sender: {
        id: user._id || user.id,
        username: user.username || user.name,
        role: user.role || 'user'
      },
      text: newMessage
    };

    // Emitir el mensaje al servidor por WebSockets
    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  return (
    <div style={containerStyle}>
      {/* HEADER DEL CHAT */}
      <div style={headerStyle}>
        <button onClick={() => navigate(-1)} style={btnBack}>← VOLVER</button>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', letterSpacing: '0.5px' }}>
          🎮 MATCHROOM EN VIVO
        </h2>
        <span style={badgeLive}>● TIEMPO REAL</span>
      </div>

      {/* ÁREA DE MENSAJES (BURBUJAS) */}
      <div style={chatBoxStyle}>
        {messages.map((msg, index) => {
          const isMe = msg.sender.id === (user._id || user.id);
          const isAdmin = msg.sender.role === 'admin';

          return (
            <div key={index} style={{ ...messageRow, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                ...bubbleStyle,
                backgroundColor: isMe ? '#8b5cf6' : '#1e1e28',
                border: isAdmin ? '1px solid #10b981' : '1px solid #2d2d3d',
                borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px'
              }}>
                <div style={senderNameStyle}>
                  {msg.sender.username} {isAdmin && <span style={{ color: '#10b981', fontSize: '0.65rem', marginLeft: '4px' }}>[ADMIN]</span>}
                </div>
                <div style={{ fontSize: '0.95rem', wordBreak: 'break-word', lineHeight: '1.4' }}>
                  {msg.text}
                </div>
                <div style={timeStyle}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        {/* Referencia invisible para forzar el scroll down */}
        <div ref={chatEndRef} />
      </div>

      {/* BARRA INFERIOR PARA ENVIAR MENSAJES */}
      <form onSubmit={handleSendMessage} style={formStyle}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Coordiná la partida con los rivales o hablá con el organizador..."
          style={inputStyle}
        />
        <button type="submit" style={btnSend}>ENVIAR</button>
      </form>
    </div>
  );
};

/* --- ESTILOS EN OBJETOS (DISEÑO EXCLUSIVO GAMEHUB) --- */
const containerStyle = { 
  maxWidth: '800px', 
  margin: '30px auto', 
  backgroundColor: '#16161e', 
  borderRadius: '24px', 
  border: '1px solid #2a2a35', 
  overflow: 'hidden', 
  height: '75vh', 
  display: 'flex', 
  flexDirection: 'column', 
  color: 'white', 
  fontFamily: 'Inter, sans-serif',
  boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
};

const headerStyle = { 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'space-between', 
  padding: '18px 24px', 
  borderBottom: '1px solid #2a2a35', 
  backgroundColor: '#111118' 
};

const btnBack = { 
  backgroundColor: 'transparent', 
  border: 'none', 
  color: '#9ca3af', 
  fontWeight: 'bold', 
  cursor: 'pointer', 
  fontSize: '0.85rem',
  transition: 'color 0.2s'
};

const badgeLive = { 
  color: '#10b981', 
  fontSize: '0.75rem', 
  fontWeight: 'black', 
  letterSpacing: '1px',
  backgroundColor: 'rgba(16, 185, 129, 0.1)',
  padding: '6px 12px',
  borderRadius: '20px'
};

const chatBoxStyle = { 
  flex: 1, 
  padding: '24px', 
  overflowY: 'auto', 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '16px', 
  backgroundColor: '#0f0f14' 
};

const messageRow = { 
  display: 'flex', 
  width: '100%' 
};

const bubbleStyle = { 
  maxWidth: '70%', 
  padding: '12px 16px', 
  position: 'relative', 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '4px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
};

const senderNameStyle = { 
  fontSize: '0.75rem', 
  color: '#a855f7', // Color morado para los nombres de usuario
  fontWeight: 'bold', 
  textTransform: 'capitalize' 
};

const timeStyle = { 
  fontSize: '0.65rem', 
  color: '#6b7280', 
  textAlign: 'right', 
  marginTop: '4px' 
};

const formStyle = { 
  display: 'flex', 
  padding: '18px 24px', 
  borderTop: '1px solid #2a2a35', 
  backgroundColor: '#111118', 
  gap: '12px' 
};

const inputStyle = { 
  flex: 1, 
  padding: '14px 18px', 
  backgroundColor: '#0f0f12', 
  border: '1px solid #333', 
  borderRadius: '12px', 
  color: 'white', 
  outline: 'none',
  fontSize: '0.95rem',
  transition: 'border-color 0.2s'
};

const btnSend = { 
  backgroundColor: '#8b5cf6', 
  color: 'white', 
  border: 'none', 
  padding: '0 24px', 
  borderRadius: '12px', 
  fontWeight: 'black', 
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'background-color 0.2s'
};