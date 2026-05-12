#  GAMEHUB - Plataforma de Torneos Esports

**Estudiante:** Tomas Bosco 
**Materia:** Taller de Desarrollo de Aplicaciones  
**Entrega:** Etapa 2 - Design System & Maquetación Estática

---

##  Descripción del Proyecto
GAMEHUB es una plataforma diseñada para la gestión y participación en torneos de Esports. Esta etapa se centra en la definición de la identidad visual (Design System) y la creación de una Landing Page funcional y atractiva.

##  Tecnologías Utilizadas
* **React.js**: Framework para la interfaz de usuario.
* **Vite**: Herramienta de construcción y servidor de desarrollo.
* **Tailwind CSS v4**: Framework de estilos para la implementación del Design System.
* **React Router Dom**: Gestión de navegación entre páginas.
* **Lucide React / DiceBear**: Iconografía y recursos visuales.

##  Design System
Se implementó un sistema de diseño basado en una estética "Dark Gaming":
- **Colores Primarios:** `#8b5cf6` (Violeta vibrante) para acciones principales.
- **Fondo:** `#0f0f12` (Negro profundo) para resaltar el contenido.
- **Tipografía:** Inter/Sans-serif para máxima legibilidad.
- **Componentes:** Botones con estados interactivos (`hover`, `transition`, `transform`).

## 📁 Arquitectura de Carpetas
```text
src/
 ├── assets/      # Imágenes y recursos estáticos
 ├── components/  # Componentes reutilizables (UI)
 ├── pages/       # Vistas principales (Home, Tournaments)
 ├── App.jsx      # Componente raíz y rutas
 ├── index.css    # Configuración de Tailwind y variables globales
 └── main.jsx     # Punto de entrada de React