import api from './api';

/**
 * Service untuk membungkus konten AI menjadi file fisik (PDF / Word)
 * yang di-generate oleh backend Laravel.
 */
export const documentService = {
  /**
   * Unduh dokumen fisik dari teks atau konten markdown.
   *
   * @param {Object} params
   * @param {'pdf' | 'word' | 'docx'} params.format
   * @param {string} [params.title]
   * @param {string} params.content
   * @param {Object} [params.meta]
   */
  async exportDocument({ format = 'pdf', title = 'Dokumen Permata AI', content, meta = {} }) {
    if (!content) {
      throw new Error('Konten dokumen tidak boleh kosong.');
    }

    const response = await api.post(
      '/documents/export',
      {
        format,
        title,
        content,
        meta,
      },
      {
        responseType: 'blob',
      }
    );

    // Ambil filename dari header Content-Disposition jika tersedia
    let filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'dokumen-permata'}.${
      format === 'pdf' ? 'pdf' : 'docx'
    }`;

    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    const blobType =
      format === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    const blob = new Blob([response.data], { type: blobType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);

    return { success: true, filename };
  },

  /**
   * Unduh pesan tertentu (misal jawaban AI) langsung sebagai PDF atau Word.
   */
  async exportMessage(messageId, format = 'pdf', title = '') {
    const response = await api.post(
      `/messages/${messageId}/export`,
      { format, title },
      { responseType: 'blob' }
    );

    let filename = `pesan-${messageId}.${format === 'pdf' ? 'pdf' : 'docx'}`;
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);

    return { success: true, filename };
  },

  /**
   * Unduh seluruh percakapan aktif sebagai dokumen PDF atau Word.
   */
  async exportConversation(conversationId, format = 'pdf') {
    const response = await api.post(
      `/conversations/${conversationId}/export`,
      { format },
      { responseType: 'blob' }
    );

    let filename = `percakapan-${conversationId}.${format === 'pdf' ? 'pdf' : 'docx'}`;
    const disposition = response.headers['content-disposition'];
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }

    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);

    return { success: true, filename };
  },
};

