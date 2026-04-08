export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ answer: 'Método no permitido' });

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ answer: "Error: No hay API Key." });

  try {
    // EL CAMBIO TÉCNICO: Usamos el modelo 1.5-flash-8b (Alta disponibilidad)
    const model = 'gemini-1.5-flash-8b'; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: question }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      // Si este da 404, probaremos con el 'gemini-pro' (el estándar de oro)
      return res.status(200).json({ 
        answer: `Error de Google (${model}): ${data.error.message}` 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ answer: text || "Sin respuesta del asistente." });

  } catch (error: any) {
    return res.status(500).json({ answer: `Falla de red: ${error.message}` });
  }
}