import React from 'react';
import { useNavigate } from 'react-router-dom';

// 1. IMPORTACIONES OBLIGATORIAS DE SWIPER
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Importación de los estilos nativos de Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const games = [
  { name: 'Fortnite', img: 'https://wallpapercave.com/wp/wp6082440.png' },
  { name: 'Clash Royale', img: 'https://wallpapercave.com/wp/wp2394983.jpg' },
  { name: 'Rocket League', img: 'https://wallpapercave.com/wp/wp6005289.jpg' },
  { name: 'Valorant', img: 'https://wallpapercave.com/wp/wp16103415.jpg' }
];

const anuncios = [
  {
    id: 1,
    img: 'https://res.cloudinary.com/djzzhiksb/image/upload/v1779295175/ChatGPT_Image_20_may_2026_13_30_30_m8ar9k.png',
    alt: 'Grandes Torneos'
  },
  {
    id: 2,
    img: 'https://res.cloudinary.com/djzzhiksb/image/upload/v1779295176/ChatGPT_Image_20_may_2026_13_32_09_exxr5b.png',
    alt: 'Premios y Clasificatorias'
  },
  {
    id: 3,
    img: 'https://res.cloudinary.com/djzzhiksb/image/upload/v1779295175/ChatGPT_Image_20_may_2026_13_33_57_pa04wu.png',
    alt: 'Comunidad Gamehub'
  }
];

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ color: 'white', backgroundColor: '#0f0f12', minHeight: '100vh', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      
      {/* --- SECCIÓN BIENVENIDA --- */}
      {/* Se usa clamp() para ajustar el padding dinámicamente entre móvil y escritorio */}
      <section style={{ textAlign: 'center', padding: 'clamp(50px, 10vw, 100px) 20px', background: 'linear-gradient(to bottom, #1a1a2e, #0f0f12)' }}>
        {/* clamp(min, val, max) evita que el título sea gigante en móviles y rompa la pantalla */}
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', marginBottom: '10px', fontWeight: '900', letterSpacing: '-2px', lineHeight: '1.1' }}>
          Bienvenido a <span style={{ color: '#8b5cf6' }}>GAMEHUB</span>
        </h1>
        <p style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)', color: '#9ca3af', maxWidth: '700px', margin: '15px auto 0', lineHeight: '1.5' }}>
          La plataforma definitiva para competir, ganar y dominar la escena de los Esports.
        </p>
      </section>

      {/* --- CARRUSEL DE ANUNCIOS --- */}
      <section style={{ display: 'flex', justifyContent: 'center', padding: '20px 20px clamp(30px, 8vw, 60px) 20px' }}>
        <div style={carouselContainerStyle}>
          <Swiper
            spaceBetween={0}
            centeredSlides={true}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            navigation={true}
            modules={[Autoplay, Pagination, Navigation]}
            style={{ width: '100%', height: '100%' }}
          >
            {anuncios.map((anuncio) => (
              <SwiperSlide key={anuncio.id}>
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <img src={anuncio.img} alt={anuncio.alt} style={carouselImgStyle} loading="lazy" />
                  {/* Sombra estética inferior */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    height: '50%',
                    background: 'linear-gradient(to top, rgba(15,15,18,1) 0%, transparent 100%)',
                    pointerEvents: 'none'
                  }} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* --- SECCIÓN JUEGOS --- */}
      <section style={{ padding: 'clamp(30px, 5vw, 60px) 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: 'clamp(20px, 4vw, 40px)', fontSize: 'clamp(1.8rem, 5vw, 2.2rem)', fontWeight: '800', textTransform: 'uppercase', fontStyle: 'italic', textAlign: 'center' }}>
          Elegí tu <span style={{ color: '#8b5cf6' }}>Juego</span>
        </h2>
        {/* CSS Grid responsivo: en móviles bajará a 1 columna automáticamente si es menor a 260px, o se ajustará fluidamente */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '20px' }}>
          {games.map(game => (
            <div 
              key={game.name}
              onClick={() => navigate(`/tournaments/${game.name}`)}
              style={gameCardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.querySelector('img').style.transform = 'scale(1.08)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.querySelector('img').style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <img src={game.img} alt={game.name} style={gameImgStyle} loading="lazy" />
              <div style={gameLabelStyle}>
                <span style={{ fontSize: 'clamp(1.3rem, 4vw, 1.6rem)', fontWeight: '900', textTransform: 'uppercase', textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}>
                  {game.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECCIÓN SHOWCASE --- */}
      {/* Se ajustó el margen superior e inferior para móviles */}
      <section style={{ marginTop: 'clamp(60px, 10vw, 120px)', padding: 'clamp(40px, 8vw, 60px) 20px', borderTop: '1px solid #1f1f23', backgroundColor: '#0a0a0c' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h4 style={{ color: '#8b5cf6', fontSize: '0.8rem', letterSpacing: '4px', marginBottom: '30px', opacity: 0.6, fontWeight: '900', textTransform: 'uppercase', textAlign: 'center' }}>
            Showcase
          </h4>
          
          {/* Se añadió flex-col para móviles y flex-row para escritorio mediante Tailwind si está configurado, o comportamiento wrap */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Clases Tailwind adaptadas para ocupar todo el ancho en móviles muy pequeños si es necesario */}
            <button className="w-full sm:w-auto bg-[#8b5cf6] text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-[#7c3aed] transition-all transform hover:-translate-y-1 shadow-lg shadow-purple-500/30 uppercase tracking-wider">
              Botón Primario
            </button>
            
            <button className="w-full sm:w-auto border-2 border-[#8b5cf6] text-[#8b5cf6] px-8 py-3 rounded-xl font-black text-sm hover:bg-[#8b5cf6] hover:text-white transition-all transform hover:-translate-y-1 uppercase tracking-wider">
              Botón Secundario
            </button>

            <p style={{ color: '#4b5563', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', width: '100%', marginTop: '10px' }}>
              — Interactive components (Hover & Transitions enabled)
            </p>
          </div>
        </div>
      </section>

      {/* --- FOOTER PROFESIONAL --- */}
      <footer style={{ padding: '40px 20px', textAlign: 'center', backgroundColor: '#050505', borderTop: '1px solid #111' }}>
        <p style={{ color: '#6b7280', fontSize: 'clamp(0.85rem, 3vw, 1rem)', margin: 0, fontWeight: '500' }}>
          &copy; {new Date().getFullYear()} <span style={{ color: '#8b5cf6', fontWeight: '800' }}>GAMEHUB</span> — Todos los derechos reservados.
        </p>
        <p style={{ color: '#374151', fontSize: '0.70rem', marginTop: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
          Taller de Desarrollo de Aplicaciones | Proyecto Esports
        </p>
      </footer>

    </div>
  );
};

// --- ESTILOS EN OBJETOS ADAPTADOS PARA MÓVIL ---

const carouselContainerStyle = {
  width: '100%',
  maxWidth: '1000px',
  // Se cambia una altura fija por un clamp y aspect-ratio para que escale perfecto en móviles sin achatarse
  height: 'clamp(200px, 50vw, 380px)', 
  borderRadius: 'clamp(12px, 4vw, 24px)', // Bordes más suaves en pantallas chicas
  overflow: 'hidden',
  border: '1px solid #2d2d35',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)', // Sombra ligeramente más sutil para móvil
  backgroundColor: '#16161c',
  // Previene que el carrusel cause scroll horizontal en dispositivos pequeños
  maxWidth: 'calc(100vw - 40px)' 
};

const carouselImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover', // cover asegura que la imagen llene el espacio sin deformarse
  objectPosition: 'center' // Mantiene el centro de la imagen visible al recortar en móvil
};

const gameCardStyle = { 
  position: 'relative', 
  borderRadius: '16px', // Ligeramente reducido para móviles
  overflow: 'hidden', 
  cursor: 'pointer', 
  // Altura dinámica que se reduce en móviles para no ocupar toda la pantalla por tarjeta
  height: 'clamp(280px, 60vw, 380px)', 
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  backgroundColor: '#1a1a20'
};

const gameImgStyle = { 
  width: '100%', 
  height: '100%', 
  objectFit: 'cover', 
  objectPosition: 'center top', // Ideal para posters de juegos, prioriza la parte superior/rostros
  transition: 'transform 0.5s ease' 
};

const gameLabelStyle = { 
  position: 'absolute', 
  bottom: 0, 
  width: '100%', 
  padding: 'clamp(15px, 4vw, 30px) clamp(15px, 4vw, 20px)', // Padding dinámico
  background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)', 
  textAlign: 'left',
  display: 'flex',
  alignItems: 'flex-end',
  boxSizing: 'border-box' // Evita que el padding sume ancho extra y rompa el layout
};