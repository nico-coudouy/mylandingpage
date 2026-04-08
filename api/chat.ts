// api/chat.ts - Versión de Auditoría Final
export default async function handler(req: any, res: any) {
  // 1. Verificación de Seguridad: Solo aceptamos transacciones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ answer: 'Método no permitido' });
  }

  const { question } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  // 2. Control de Activos: Verificación de la API Key
  if (!apiKey) {
    return res.status(500).json({ 
      answer: "Error Crítico: La API Key no está configurada en Vercel. Revisá Settings > Environment Variables." 
    });
  }

  try {
    // 3. Selección de Activo: Usamos gemini-1.5-flash en la versión v1beta
    // Esta es la nomenclatura más compatible para cuentas nuevas en 2026
    const model = 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
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

    // 4. Análisis de Riesgos: Si Google devuelve un error
    if (data.error) {
      // Si vuelve a dar 404, este mensaje te dará la instrucción de auditoría
      if (data.error.code === 404) {
        return res.status(200).json({ 
          answer: `Error 404: El modelo '${model}' no fue encontrado. Por favor, verificá en Google AI Studio que tu API Key tenga acceso a este modelo o generá una nueva clave en un 'Nuevo Proyecto'.` 
        });
      }
      return res.status(200).json({ 
        answer: `Reporte de Google: ${data.error.message} (Código: ${data.error.code})` 
      });
    }

    // 5. Liquidación de Ganancias: Extracción del texto
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return res.status(200).json({ answer: "El asistente recibió la consulta pero no generó respuesta. Revisá los filtros de seguridad de Google." });
    }

    return res.status(200).json({ answer: text });

  } catch (error: any) {
    // 6. Fondo de Reserva: Error de red o ejecución
    return res.status(500).json({ 
      answer: `Falla técnica en el servidor: ${error.message}` 
    });
  }
}