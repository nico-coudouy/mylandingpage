export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ answer: 'Método no permitido' });

  const { question } = req.body;
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
        messages: [{ role: 'user', content: question }],
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