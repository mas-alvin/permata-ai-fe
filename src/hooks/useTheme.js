import { useEffect, useState, useCallback } from 'react';

/**
 * Manajemen tema aplikasi (light / dark / system) via class .dark pada <html>.
 *
 * Tailwind diset darkMode: 'class' (tailwind.config.js), jadi toggling class
 * ini langsung mengaktifkan seluruh varian dark: di kode base.
 *
 * Preferensi disimpan ke localStorage('theme') agar bertahan antar reload.
 * Mode 'system' mengikuti prefers-color-scheme dan direaktifkan jika user
 * mengubah tema OS mereka.
 */
const THEME_KEY = 'theme';
const VALID_THEMES = ['light', 'dark', 'system'];

function getSystemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getStoredTheme() {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(THEME_KEY);
  return VALID_THEMES.includes(stored) ? stored : 'system';
}

function applyTheme(theme) {
  const isDark = theme === 'dark' || (theme === 'system' && getSystemPrefersDark());
  document.documentElement.classList.toggle('dark', isDark);
}

export function useTheme() {
  const [theme, setThemeState] = useState(getStoredTheme);

  // Terapkan tema ke <html> setiap kali berubah.
  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Saat mode 'system', ikuti perubahan preferensi OS secara langsung.
  useEffect(() => {
    if (theme !== 'system') return undefined;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (VALID_THEMES.includes(next)) setThemeState(next);
  }, []);

  const isDarkMode = theme === 'dark' || (theme === 'system' && getSystemPrefersDark());

  return { theme, setTheme, isDarkMode };
}

// Cycler untuk tombol tunggal di footer: light -> dark -> system -> light...
export const THEME_CYCLE = ['light', 'dark', 'system'];

export const THEME_META = {
  light: { label: 'Terang', icon: 'light_mode' },
  dark: { label: 'Gelap', icon: 'dark_mode' },
  system: { label: 'Sistem', icon: 'desktop_windows' },
};
