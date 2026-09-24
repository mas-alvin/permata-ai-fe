import { useEffect } from 'react';

/**
 * Menjaga <link rel="icon"> tetap sesuai tema aktif.
 *
 * Tema dikelola oleh useTheme.js yang menambah/menghapus class `.dark`
 * pada <html>. Hook ini mengawati class tersebut (bukan state React)
 * supaya favicon ikut berubah bahkan saat tema berubah karena mengikuti
 * preferensi OS (mode "system").
 *
 * - Terang → /permata.svg
 * - Gelap   → /logodark.png
 */
const FAVICON_LIGHT = '/permata.svg';
const FAVICON_DARK = '/logodark.png';

function setFavicon(isDark) {
  const link = document.querySelector('link[rel="icon"]');
  if (!link) return;
  link.setAttribute('href', isDark ? FAVICON_DARK : FAVICON_LIGHT);
}

export function useFaviconTheme() {
  useEffect(() => {
    const root = document.documentElement;

    // Pasang kondisi awal sekali saja.
    setFavicon(root.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setFavicon(root.classList.contains('dark'));
    });

    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
}
