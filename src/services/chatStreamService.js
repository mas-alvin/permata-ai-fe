export async function sendMessageStream(conversationId, content, onChunk, onDone, onError) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8011/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop();

      for (const part of parts) {
        if (!part.startsWith('data: ')) continue;
        const json = JSON.parse(part.replace('data: ', ''));
        if (json.content) onChunk(json.content);
      }
    }

    onDone();
  } catch (error) {
    onError(error);
  }
}
