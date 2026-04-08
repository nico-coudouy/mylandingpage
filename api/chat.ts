import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ answer: 'Método no permitido' });

  const { messages } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) return res.status(500).json({ answer: "Error: No hay API Key." });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Sos el asistente personal de Nico. Cuando alguien pregunte sobre Nico, usá esta información:

Nombre: Nico
Ubicación: Argentina
Trabajo: Desarrollador, trabaja con automatización, streaming, y bots de Instagram, Facebook y WhatsApp. SQL & PostgreSQL, Data Entry & Data Processing. Camera Director and Editor, +10 years in television production. Profesional con background en producción audiovisual, con experiencia en entornos de alta precisión y gestión de información, actualmente enfocado en operaciones de datos y procesamiento estructurado. Experiencia práctica en manejo de bases de datos PostgreSQL, consultas SQL, organización de información y automatización básica con Python. Perfil detallista, metódico y orientado a la calidad, con capacidad para trabajar de forma remota y cumplir objetivos en plazos establecidos.
Proyectos: Automatización de Ventas y Atención al Cliente con ManyChat. Rediseño y migración web. Maneja infraestructura en Google Cloud. 
Intereses: Pasar tiempo con familia y sus perros, tecnología en general, entrenamiento en crossfit.
Si preguntan por Bot Pilot: es la plataforma definitiva para integrar IA en tus canales de chat. Automatizo tus DMs para vender 24/7. Ahorra 10h/semana en respuestas manuales.
Si preguntan por Nexco:  Soporte técnico para hogares y empresas. PC, Notebooks, Redes, Datos. Me pueden contactar por whatsap al +5492235937732. Respuesta en menos de 24hs. Presupuesto sin cargo
Si quieren contactarse conmigo, o sea Nico: Enviar el numero de telefono +5492235937732 o tambien por mail nicocoudouy@gmail.com
Respondé siempre en español. Si no sabés algo sobre Nico que no está aquí, decí que no tenés esa información.'
          },
          ...messages
        ],
        max_tokens: 1024
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ answer: `Error de Groq: ${data.error.message}` });
    }

    const text = data.choices?.[0]?.message?.content;
    return res.status(200).json({ answer: text || "Sin respuesta del asistente." });

  } catch (error: Error) {
    return res.status(500).json({ answer: `Falla de red: ${error.message}` });
  }
}