export async function askBotPilot(question: string): Promise<string> {
  try {
    const response = await fetch('/api/chat', { // Ruta relativa a tu dominio
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });

    const data = await response.json();
    return data.answer || "No pude procesar la respuesta.";
  } catch (error) {
    return "Error de conexión con el asistente.";
  }
}