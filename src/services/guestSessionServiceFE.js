import api from './api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8011/api';

/**
 * Layanan sesi tamu berbasis Redis (guest.md §4).
 *
 * Sesi tamu ephemeral: backend menyimpan kuota token + histori di Redis
 * dengan TTL otomatis — TIDAK ditulis ke MySQL. Frontend hanya menyimpan
 * guest_session_id (UUID) untuk dipakai sebagai header X-Guest-Session.
 */
export const guestSessionService = {
  /**
   * Buat sesi tamu baru. Backend memberi kuota token penuh & TTL.
   * Rate limited per IP agar tamu tak bisa membuat sesi tanpa batas.
   *
   * @returns {Promise<{session_id, tokens_limit, tokens_used, ttl_minutes, model}>}
   */
  create: () => api.post('/guest/v2/session').then((res) => res.data),

  /**
   * Cek sisa kuota & validitas sesi.
   *
   * @returns {Promise<{session_id, tokens_used, tokens_limit, tokens_remaining, model}>}
   */
  status: (sessionId) =>
    api
      .get('/guest/v2/session/status', { headers: { 'X-Guest-Session': sessionId } })
      .then((res) => res.data),
};

/**
 * Kirim pesan sebagai tamu → SSE stream.
 *
 * Respons terminal (`done: true`) membawa payload `usage` dengan jumlah
 * token aktual (prompt + completion) untuk memperbarui indikator kuota.
 *
 * @param {string} sessionId      UUID dari backend
 * @param {string} content        Teks pesan tamu
 * @param {(chunk: string) => void} onChunk
 * @param {(usage: object) => void} onDone  Dipanggil dengan {tokens_used, tokens_limit, tokens_remaining, ...}
 * @param {(err: Error) => void} onError
 */
export async function sendGuestMessageStreamV2(sessionId, content, onChunk, onDone, onError) {
  try {
    const response = await fetch(`${API_BASE}/guest/v2/messages`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        'X-Guest-Session': sessionId,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const message = await safeExtractError(response);
      const error = new Error(message);
      // Sertakan kode machine-readable (mis. GUEST_QUOTA_EXCEEDED) supaya
      // UI bisa menampilkan modal upgrade alih-alih error generik.
      error.code = await safeExtractCode(response);
      throw error;
    }

    await consumeSseStream(response, onChunk, onDone);
  } catch (error) {
    onError(error);
  }
}

async function consumeSseStream(response, onChunk, onDone) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let usage = null;

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
        throw new Error(json.error);
      }
      if (json.done) {
        if (json.usage) {
          usage = json.usage;
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

  onDone(usage ?? {});
}

async function safeExtractError(response) {
  try {
    const data = await response.json();
    return data.error || data.message || `HTTP error! status: ${response.status}`;
  } catch {
    return `HTTP error! status: ${response.status}`;
  }
}

async function safeExtractCode(response) {
  try {
    const data = await response.json();
    return data.code || null;
  } catch {
    return null;
  }
}
