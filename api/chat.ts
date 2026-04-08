// api/chat.ts
// Este es tu BFF (Backend For Frontend) que corre seguro en Vercel

export default async function handler(req: any, res: any) {
  // 1. Auditoría de Método: Solo aceptamos POST para proteger el recurso
  if (req.method !== 'POST') {
    return res.status(405).json({ answer: 'Método no permitido' });
  }

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // 2. Verificación de Activos: ¿La API Key está cargada en Vercel?
  if (!apiKey) {
    return res.status(500).json({ 
      answer: "Error: La API Key no está configurada en el Dashboard de Vercel." 
    });
  }

  try {
    // 1. Usamos el nombre técnico exacto: gemini-1.5-flash-latest o gemini-1.5-flash
    // 2. Volvemos a v1beta si v1 falla, ya que Flash 1.5 a veces vive ahí en ciertas regiones
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `Sos Bot Pilot, asistente de Nico Coudouy. Pregunta: ${question}` 
          }]
        }]
      })
    });

    const data = await response.json();

    // Si sigue dando 404, Google nos dirá por qué en este bloque
    if (data.error) {
      return res.status(200).json({ 
        answer: `Error de Google: ${data.error.message} (Código: ${data.error.code})` 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return res.status(200).json({ answer: text || "Sin texto de respuesta" });

  } catch (error: any) {
    return res.status(500).json({ answer: `Error de red: ${error.message}` });
  }
}