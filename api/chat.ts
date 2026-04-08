export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ answer: 'Método no permitido' });
  }

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ answer: "Error: API Key no configurada." });
  }

  try {
    // Usamos 'gemini-pro', que es el modelo más estable para v1beta
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: question }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ 
        answer: `Google sigue reportando error: ${data.error.message} (Código: ${data.error.code}). Probá cambiar el nombre del modelo a 'gemini-1.5-pro' en el código.` 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ answer: text || "Google no devolvió texto." });

  } catch (error: any) {
    return res.status(500).json({ answer: `Error de red: ${error.message}` });
  }
}