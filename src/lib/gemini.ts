export async function askBotPilot(question: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ API Key no configurada');
    return "Error: API key no configurada.";
  }

  try {
    // ✅ Endpoint corregido con modelo verificado
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: question }]
        }],
        systemInstruction: {
          parts: [{
            text: `Eres "Bot Pilot", el asistente de IA de Nico Coudouy. 
            Nico es un profesional radicado en Mar del Plata, Argentina.
            Su experiencia incluye:
            - Dirección y Operación de Cámaras
            - Edición de Video
            - Entrada y Procesamiento de Datos
            - Soporte IT
            
            Responde preguntas sobre los servicios de Nico en un tono profesional, servicial y ligeramente tecnológico. 
            Mantén las respuestas concisas (menos de 3 oraciones). 
            Responde siempre en español.
            Si te preguntan por su ubicación, menciona que es de la hermosa ciudad de Mar del Plata.`
          }]
        },
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        }
      })
    });

    // ✅ Leer el cuerpo del error si falla
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ HTTP Error:', response.status, errorBody);
      throw new Error(`HTTP ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude procesar tu pregunta.";
    
  } catch (error) {
    console.error('💥 Error:', error);
    return "Tuve un problema técnico. Intentá de nuevo.";
  }
}