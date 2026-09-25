import axios from 'axios';

// Autentikasi berbasis httpOnly cookie (JWT). Browser yang mengelola cookie,
// bukan JavaScript — withCredentials WAJIB true agar cookie dikirim &
// disimpan lintas request. Token tidak lagi disimpan di localStorage.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8011/api',
  withCredentials: true,
  withXSRFToken: false,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Response interceptor — tangani 401 tanpa hard reload.
//
// Sebelumnya interceptor memakai window.location.href = '/login' yang
// me-reload halaman dan menghapus console, sehingga error tak terlihat.
// Sekarang kita hanya membersihkan sisa token lama dan meneruskan error ke
// pemanggil. Redirect ke /login ditangani ProtectedRoute berdasarkan state
// auth (cookie), sehingga mode tamu tetap bisa chat tanpa diusir.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Bersihkan token Sanctum lama jika masih ada (migrasi ke JWT).
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
