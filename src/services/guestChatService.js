import api from './api';
import { getGuestDeviceId } from '../utils/guestDevice';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8011/api';

/**
 * Chat untuk tamu (user belum login).
 *
 * Backend membatasi pesan per hari per device_id dan selalu memakai model
 * murah. Pesan tamu disimpan dengan user_id NULL dan akan dihapus permanen
 * saat user login (AuthController::purgeGuestChats).
 */
export async function sendGuestMessageStream(
  content,
  onChunk,
  onDone,
  onError,
  signal
) {
  const deviceId = getGuestDeviceId();

  try {
    const response = await fetch(`${API_BASE}/guest/chat`, {
      method: 'POST',
      credentials: 'include',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'X-Guest-Device-Id': deviceId,
      },
      body: JSON.stringify({ content, device_id: deviceId }),
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

async function consumeSseStream(response, onChunk, onDone, onError) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let quota = null;

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
        if (json.quota) {
          quota = json.quota;
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

  if (buffer.trim()) {
    flushParts([buffer]);
  }

  onDone({ quota });
}

async function safeExtractError(response) {
  try {
    const data = await response.json();
    return data.error || data.message || `HTTP error! status: ${response.status}`;
  } catch {
    return `HTTP error! status: ${response.status}`;
  }
}
