export default async function handler(req: any, res: any) {
    // El resto del código se mantiene igual
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    const { question } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

  try {
    // Cambiamos el modelo en la URL: de gemini-2.0 o gemini-3 a gemini-1.5-flash
    const model = 'gemini-1.5-flash'; 
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: `Sos Bot Pilot, asistente de Nico Coudouy (Mar del Plata). 
            Sé breve (máx 3 oraciones), profesional y servicial. 
            Pregunta: ${question}` 
          }]
        }]
      })
    });

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";
    
    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({ error: 'Error en la conexión con la IA' });
  }
}