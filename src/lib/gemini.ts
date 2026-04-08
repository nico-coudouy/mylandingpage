const conversationHistory: { role: string; content: string }[] = [];

export async function askBotPilot(question: string): Promise<string> {
  try {
    // Agregamos la pregunta al historial
    conversationHistory.push({ role: 'user', content: question });

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversationHistory })
    });

    const data = await response.json();
    const answer = data.answer || "No pude procesar la respuesta.";

    // Agregamos la respuesta al historial
    conversationHistory.push({ role: 'assistant', content: answer });

    return answer;
  } catch (error) {
    return "Error de conexión con el asistente.";
  }
}