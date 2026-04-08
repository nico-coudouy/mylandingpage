export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ answer: 'Método no permitido' });
  }

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // Auditoría interna: ¿La clave existe en el servidor?
  if (!apiKey) {
    return res.status(500).json({ answer: "Error: La API Key no está configurada en Vercel." });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: question }] }]
      })
    });

    const data = await response.json();

    // Si Google responde con un error (ej. 400, 403, 429)
    if (data.error) {
      return res.status(200).json({ 
        answer: `Google Error: ${data.error.message} (Código: ${data.error.code})` 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return res.status(200).json({ answer: "Google respondió pero el texto está vacío. Revisá tu cuota o filtros de seguridad." });
    }

    return res.status(200).json({ answer: text });

  } catch (error: any) {
    return res.status(500).json({ answer: `Error crítico de red: ${error.message}` });
  }
}