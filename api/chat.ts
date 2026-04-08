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
Intereses: River Plate, tecnología, desarrollo de software.

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