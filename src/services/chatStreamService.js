const API_BASE = 'http://localhost:8011/api';

function getAuthHeaders(extra = {}) {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
    Authorization: `Bearer ${token}`,
    ...extra,
  };
}

/**
 * Parse an SSE stream from a fetch Response, invoking callbacks.
 * Handles `data:` payloads and the terminal `done` event which may
 * carry credits info (credits_remaining / credits_deducted).
 */
async function consumeSseStream(response, onChunk, onDone, onError) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let creditsRemaining = null;
  let creditsDeducted = null;

  const flushParts = (parts) => {
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed.startsWith('data:')) continue;

      const jsonStr = trimmed.replace(/^data:\s*/, '');
      if (!jsonStr || jsonStr === '[DONE]') continue;

      let json;
      try {
        json = JSON.parse(jsonStr);
      } catch {
        continue;
      }

      if (json.content) {
        onChunk(json.content);
      }
      if (json.error) {
        onError(new Error(json.error));
        return;
      }
      if (json.done) {
        if (typeof json.credits_remaining === 'number') {
          creditsRemaining = json.credits_remaining;
        }
        if (typeof json.credits_deducted === 'number') {
          creditsDeducted = json.credits_deducted;
        }
      }
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop();
    flushParts(parts);
  }

  // Flush any remaining buffered data
  if (buffer.trim()) {
    flushParts([buffer]);
  }

  onDone({ creditsRemaining, creditsDeducted });
}

export async function sendMessageStream(
  conversationId,
  content,
  modelId,
  onChunk,
  onDone,
  onError,
  attachments = []
) {
  try {
    const response = await fetch(
      `${API_BASE}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content, model_id: modelId, attachments }),
      }
    );

    if (!response.ok) {
      const message = await safeExtractError(response);
      throw new Error(message);
    }

    await consumeSseStream(response, onChunk, onDone, onError);
  } catch (error) {
    onError(error);
  }
}

export async function regenerateMessageStream(
  messageId,
  onChunk,
  onDone,
  onError
) {
  try {
    const response = await fetch(`${API_BASE}/messages/${messageId}/regenerate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const message = await safeExtractError(response);
      throw new Error(message);
    }

    await consumeSseStream(response, onChunk, onDone, onError);
  } catch (error) {
    onError(error);
  }
}

async function safeExtractError(response) {
  try {
    const data = await response.json();
    return data.error || data.message || `HTTP error! status: ${response.status}`;
  } catch {
    return `HTTP error! status: ${response.status}`;
  }
}
