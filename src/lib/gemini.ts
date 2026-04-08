const SYSTEM_PROMPT = `Sos Bot Pilot, el asistente de IA de Nico Coudouy. 
Nico es de Mar del Plata, Argentina. Servicios: Dirección/Cámaras, Edición de Video, Soporte IT. 
Responde profesional, tecnológico y breve (máximo 3 oraciones). Idioma: Español.`;

export async function askBotPilot(question: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return "Error: API key no configurada.";

  // Intentamos con el activo más rentable primero
  return executeQuery(question, 'gemini-3-flash', apiKey)
    .catch(() => executeQuery(question, 'gemini-1.5-flash', apiKey))
    .catch(() => "Tuve un problema técnico. Intentá de nuevo.");
}

async function executeQuery(question: string, model: string, key: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${SYSTEM_PROMPT}\n\nPregunta: ${question}` }]
      }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
    })
  });

  if (!response.ok) throw new Error("API Error");
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";
}