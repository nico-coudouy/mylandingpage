export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ answer: 'Método no permitido' });
  }

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ answer: "Error: API Key faltante en Vercel." });
  }

  try {
    // Usamos la versión v1 y el modelo 2.0 Flash
    const model = 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
    
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
      // Si esto vuelve a dar 404, el problema es la región de la IP o la cuenta de Google
      return res.status(200).json({ 
        answer: `Google insiste: ${data.error.message} (Cod: ${data.error.code})` 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ answer: text || "Google no devolvió texto." });

  } catch (error: any) {
    return res.status(500).json({ answer: `Falla de red: ${error.message}` });
  }
}