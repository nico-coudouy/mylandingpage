export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ answer: 'Método no permitido' });
  }

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ answer: "Error: API Key no configurada en Vercel." });
  }

  try {
    // Ajuste de Auditoría: Usamos el modelo exacto que tu prueba confirmó
    const model = 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `Sos Bot Pilot, asistente de Nico Coudouy. Responde de forma técnica y breve. Pregunta: ${question}` 
          }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        answer: `Error de Google: ${data.error.message} (Código: ${data.error.code})` 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ answer: text || "Google no devolvió contenido." });

  } catch (error: any) {
    return res.status(500).json({ answer: `Falla técnica de red: ${error.message}` });
  }
}