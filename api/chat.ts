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
    // CAMBIO CLAVE: Usamos gemini-1.5-flash-latest en v1beta
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
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
      // Esto nos dirá si el error 404 persiste o si cambió a otro (como 403)
      return res.status(200).json({ 
        answer: `Reporte de Google: ${data.error.message} (Código: ${data.error.code})` 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ answer: text || "Google no devolvió contenido." });

  } catch (error: any) {
    return res.status(500).json({ answer: `Falla de red: ${error.message}` });
  }
}