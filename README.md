# Personal Landing — Nicolás Coudouy

Personal portfolio and landing page for **Nicolás Coudouy** — Frontend Developer, broadcast technical operator, and founder of Bot Pilot. Features an integrated AI chat assistant trained on my services and background, built to let visitors ask anything and get a contextual answer in real time.

🔗 **Live:** [mylandingpage-one.vercel.app](https://mylandingpage-one.vercel.app)

---

## 📸 Preview
<img width="1889" height="883" alt="image" src="https://github.com/user-attachments/assets/4668aea9-8638-4ac5-aefb-5e1d9166d9c8" />

<!-- Agregá acá una captura del hero o de la integración del chat IA -->
<!-- Ejemplo: ![Personal Landing — Hero](./public/preview.png) -->

---

## ✨ Features

- **Hero section** — Professional introduction with clear positioning
- **Services grid** — Media production, IT support, and data entry offerings
- **Bot Pilot integration** — AI chat assistant trained on my services and background
- **Featured projects** — Showcase of selected work (NEXCO, Bot Pilot, and more)
- **About me** — Personal section with photo and short bio
- **Social links** — Instagram and Linktree for extended presence
- **Smooth animations** — Framer Motion transitions throughout
- **Responsive design** — Mobile-first layout

---

## 🛠 Tech Stack

- **Framework:** React 18 + TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **AI:** Gemini API (integrated chat assistant)
- **Deployment:** Vercel

---

## 🚀 Getting Started

**Requirements:** Node.js 18+

### 1. Clone and install

```bash
git clone https://github.com/nico-coudouy/mylandingpage.git
cd mylandingpage
npm install
```

### 2. Environment variables

Create a `.env.local` file in the project root:

```
VITE_GEMINI_API_KEY=your_api_key_here
```

Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Run the development server

```bash
npm run dev
```

The site will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
npm run preview
```

---

## 📦 Deployment

Configured for automatic deployment on **Vercel**. Every push to `main` triggers a new production deploy. Remember to set `VITE_GEMINI_API_KEY` in the Vercel environment variables.

---

## 📝 Project Structure

```
.
├── api/                # Serverless functions (AI endpoints)
├── public/             # Static assets (images, favicon)
├── src/
│   ├── components/     # Reusable React components
│   ├── sections/       # Page sections (Hero, Services, Bot Pilot, About)
│   ├── hooks/          # Custom React hooks
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 💡 About the AI Assistant

The integrated chat assistant ("Bot Pilot") uses the Gemini API with a custom system prompt describing my services, background, and typical questions. Visitors can ask anything — pricing, technologies I use, availability — and get an instant contextual answer. This is a live demo of the same approach I offer commercially through [Bot Pilot](https://instagram.com/botpilot.app).

---

## 👤 Author

**Nicolás Coudouy** — Frontend Developer · Broadcast Tech
📍 Mar del Plata, Argentina
💼 [LinkedIn](https://www.linkedin.com/in/nicocoudouy) · 📧 nicocoudouy@gmail.com
🐙 [GitHub](https://github.com/nico-coudouy)

---

> Personal project · Mar del Plata, Argentina · 2025
