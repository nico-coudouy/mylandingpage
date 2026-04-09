# Nico Coudouy — Landing Page

Portfolio personal de Nico Coudouy, operador de cámara, editor de video y especialista en IT radicado en Mar del Plata.

## Stack

- **React + TypeScript** — Vite
- **Tailwind CSS**
- **Framer Motion** — animaciones
- **Gemini API** — Bot Pilot, asistente de IA integrado

## Funcionalidades

- Hero con presentación profesional
- Grilla de servicios (producción de medios, soporte IT, data entry)
- Bot Pilot: chat con IA entrenado sobre los servicios de Nico
- Sección de proyectos destacados (NEXCO y Bot Pilot)
- Sección personal con foto
- Links a Instagram y Linktree

## Correr localmente

**Requisitos:** Node.js 18+

1. Clonar el repositorio
2. Instalar dependencias:
```bash
   npm install
```
3. Crear un archivo `.env.local` y agregar la API key de Gemini:
VITE_GEMINI_API_KEY=...
4. Correr el servidor de desarrollo:
```bash
   npm run dev
```

## Deploy

Configurado para desplegarse en Vercel. Cada push a `main` genera un deploy automático.
