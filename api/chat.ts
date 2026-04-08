export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ answer: 'Método no permitido' });

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ answer: "Error: API Key no configurada en Vercel." });

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: question }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ answer: `Error de Google: ${data.error.message}` });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ answer: text || "Google no devolvió respuesta." });

  } catch (error: any) {
    return res.status(500).json({ answer: `Falla técnica: ${error.message}` });
  }
}