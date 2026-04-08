export default async function handler(req: any, res: any) {
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
Trabajo: Desarrollador, trabaja con automatización, streaming, apps Android TV y bots de WhatsApp.
Proyectos: Construyó una app Android TV para Canal 8 Mar del Plata, integra Claude con WhatsApp via MCP, maneja infraestructura en Google Cloud.
Intereses: Pasar tiempo con familia y sus perros, tecnología en general, entrenamiento en crossfit.
Si preguntan por Bot Pilot: es la plataforma definitiva para integrar IA en tus canales de chat. Automatizo tus DMs para vender 24/7. Ahorra 10h/semana en respuestas manuales.
Si preguntan por Nexco:  Soporte técnico para hogares y empresas. PC, Notebooks, Redes, Datos. Me pueden contactar por whatsap al +5492235937732. Respuesta en menos de 24hs. Presupuesto sin cargo
Respondé siempre en español. Si no sabés algo sobre Nico que no está aquí, decí que no tenés esa información.`
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

  } catch (error: any) {
    return res.status(500).json({ answer: `Falla de red: ${error.message}` });
  }
}