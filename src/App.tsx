import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Video, 
  Database, 
  Monitor, 
  MapPin, 
  Dog, 
  Instagram, 
  ExternalLink, 
  MessageSquare, 
  Send,
  ChevronRight,
  Cpu,
  Waves
} from 'lucide-react';
import { askBotPilot } from './lib/gemini';

export default function App() {
  const [chatInput, setChatInput] = useState('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput;
    setChatInput('');
    setIsTyping(true);
    setChatResponse(null);

    const response = await askBotPilot(query);
    setChatResponse(response);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-blue-500/30 bg-neutral-950 text-neutral-100">
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">NC</span>
            </div>
            <span className="font-display font-semibold tracking-tight text-lg">Nico Coudouy</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://www.instagram.com/nicocoudouy" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors">
              <Instagram size={20} />
            </a>
            <a href="https://linktr.ee/nicocoudouy" target="_blank" rel="noopener noreferrer" className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2">
              Linktree <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-24">
        {/* Hero Section */}
        <section className="relative">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight mb-6">
              Capturando visión, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                Optimizando sistemas.
              </span>
            </h1>
            <p className="text-xl text-neutral-400 leading-relaxed mb-8">
              Operador de Cámara Profesional, Editor de Video y Especialista en IT radicado en Mar del Plata. 
              Cerrando la brecha entre la producción creativa y la infraestructura técnica.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-300">
                <MapPin size={16} className="text-blue-400" /> Mar del Plata, AR
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-300">
                <Waves size={16} className="text-cyan-400" /> Vibras Costeras
              </div>
            </div>
          </motion.div>
        </section>

        {/* Bento Grid Services */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Camera & Video */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/5 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 transition-transform">
                <Camera size={24} />
              </div>
              <h3 className="text-2xl font-display font-semibold mb-3">Producción de Medios</h3>
              <p className="text-neutral-400 leading-relaxed">
                Experiencia en dirección y operación de cámaras para eventos en vivo y producciones de estudio. 
                Edición de video de alta gama y flujos de trabajo de postproducción.
              </p>
            </div>
            <div className="mt-8 flex gap-2">
              <span className="px-3 py-1 rounded-md bg-white/5 text-xs font-mono text-neutral-500">Flujo 4K</span>
              <span className="px-3 py-1 rounded-md bg-white/5 text-xs font-mono text-neutral-500">Streaming en Vivo</span>
              <span className="px-3 py-1 rounded-md bg-white/5 text-xs font-mono text-neutral-500">Corrección de Color</span>
            </div>
          </motion.div>

          {/* IT Support */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl bg-neutral-900 border border-white/5 flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                <Monitor size={24} />
              </div>
              <h3 className="text-2xl font-display font-semibold mb-3">Soporte IT</h3>
              <p className="text-neutral-400 leading-relaxed">
                Resolución de problemas técnicos, configuración de redes y mantenimiento de hardware para entornos multimedia.
              </p>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Disponible para soporte remoto
              </div>
            </div>
          </motion.div>

          {/* Data Processing */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 rounded-3xl bg-neutral-900 border border-white/5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400 group-hover:scale-110 transition-transform">
              <Database size={24} />
            </div>
            <h3 className="text-2xl font-display font-semibold mb-3">Data Entry</h3>
            <p className="text-neutral-400 leading-relaxed">
              Servicios precisos de procesamiento y entrada de datos. Garantizando la integridad y gestión eficiente de la información.
            </p>
          </motion.div>

          {/* Bot Pilot AI */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Cpu size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-semibold">Bot Pilot</h3>
                  <p className="text-xs text-blue-300 font-medium uppercase tracking-wider">Asistente de IA</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <AnimatePresence mode="wait">
                  {chatResponse ? (
                    <motion.div 
                      key="response"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-sm leading-relaxed"
                    >
                      {chatResponse}
                    </motion.div>
                  ) : isTyping ? (
                    <div key="typing" className="flex gap-1 p-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  ) : (
                    <p key="placeholder" className="text-neutral-300 text-sm italic">
                      "Pregúntame lo que quieras sobre los servicios de Nico o su trabajo en Mar del Plata."
                    </p>
                  )}
                </AnimatePresence>
              </div>

              <form onSubmit={handleChat} className="relative">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escribe una pregunta..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
            
            {/* Decorative Grid */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent -mr-32 -mt-32" />
          </motion.div>
        </section>

        {/* Projects / Featured */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-display font-bold">Proyectos Destacados</h2>
            <div className="h-px flex-1 bg-white/5 mx-8" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "NEXCO",
                desc: "Soluciones innovadoras en integración de medios y tecnología.",
                icon: <Cpu className="text-blue-400" />,
                color: "from-blue-500/20 to-transparent",
                link: "https://www.instagram.com/nexco.tech/"
              },
              {
                title: "Bot Pilot",
                desc: "Automatización de IA personalizada para procesamiento de datos e interacción con clientes.",
                icon: <MessageSquare className="text-indigo-400" />,
                color: "from-indigo-500/20 to-transparent",
                link: "https://www.instagram.com/botpilot.app/"
              }
            ].map((project, i) => (
              // ✅ Usamos <a> para enlaces externos - SIN react-router-dom
              <a 
                key={i} 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className={`p-8 rounded-3xl bg-gradient-to-br ${project.color} border border-white/5 hover:border-white/10 transition-all group`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 rounded-xl bg-white/5">
                      {project.icon}
                    </div>
                    <ChevronRight className="text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="text-2xl font-display font-semibold mb-2">{project.title}</h4>
                  <p className="text-neutral-400">{project.desc}</p>
                </motion.div>
              </a>
            ))}
          </div>
        </section>

        {/* Personal Side */}
        <section className="p-12 rounded-[3rem] bg-neutral-900/50 border border-white/5 overflow-hidden relative">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-widest">
                Vida en Mar del Plata
              </div>
              <h2 className="text-4xl font-display font-bold">Más allá del lente</h2>
              <p className="text-neutral-400 text-lg leading-relaxed">
                Cuando no estoy detrás de una cámara o una consola, me encontrarás explorando la costa de Mar del Plata con mi perro. 
                Creo que una vida equilibrada alimenta la creatividad y la precisión técnica.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Dog size={20} className="text-amber-500" />
                  <span>Amante de los perros</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <Waves size={20} className="text-blue-400" />
                  <span>Entusiasta del océano</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3 aspect-square rounded-3xl overflow-hidden bg-neutral-800 relative group">
              <img 
                src="/tyrionroma.jpeg"  // ✅ Sin punto al inicio
                alt="Mar del Plata Vibes" 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </div>
          
          {/* Background Text */}
          <div className="absolute -bottom-12 -right-12 text-[12rem] font-display font-black text-white/[0.02] select-none pointer-events-none">
            MDP
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} Nico Coudouy. Construido con pasión en Mar del Plata.
          </div>
          <div className="flex items-center gap-8">
            <a href="https://www.instagram.com/nicocoudouy" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <Instagram size={16} /> Instagram
            </a>
            <a href="https://linktr.ee/nicocoudouy" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <ExternalLink size={16} /> Linktree
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}