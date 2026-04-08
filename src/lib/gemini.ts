import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function askBotPilot(question: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction: `Eres "Bot Pilot", el asistente de IA de Nico Coudouy. 
        Nico es un profesional radicado en Mar del Plata, Argentina.
        Su experiencia incluye:
        - Dirección y Operación de Cámaras
        - Edición de Video
        - Entrada y Procesamiento de Datos
        - Soporte IT
        
        Responde preguntas sobre los servicios de Nico en un tono profesional, servicial y ligeramente tecnológico. 
        Mantén las respuestas concisas (menos de 3 oraciones). 
        Responde siempre en español.
        Si te preguntan por su ubicación, menciona que es de la hermosa ciudad de Mar del Plata.`,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Lo siento, estoy teniendo problemas técnicos. ¡Vuelve a intentarlo pronto!";
  }
}
