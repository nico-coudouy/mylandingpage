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
    // 3. Configuración del Endpoint: Usamos v1 para máxima estabilidad
    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `Sos Bot Pilot, el asistente de IA de Nico Coudouy. 
            Nico vive en Mar del Plata y es experto en Video, IT y Datos. 
            Responde de forma profesional, tecnológica y concisa (máximo 3 oraciones). 
            Pregunta del usuario: ${question}` 
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250,
        }
      })
    });

    const data = await response.json();

    // 4. Manejo de Errores de la API de Google
    if (data.error) {
      return res.status(200).json({ 
        answer: `Google Error: ${data.error.message} (Código: ${data.error.code})` 
      });
    }

    // 5. Extracción de dividendos (la respuesta de texto)
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return res.status(200).json({ 
        answer: "Google no devolvió texto. Podría ser un filtro de seguridad o cuota excedida." 
      });
    }

    // 6. Retorno de inversión exitoso
    return res.status(200).json({ answer: text });

  } catch (error: any) {
    // 7. Contingencia ante errores de red o ejecución
    return res.status(500).json({ 
      answer: `Error crítico en el servidor: ${error.message}` 
    });
  }
}