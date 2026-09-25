// Identitas perangkat untuk mode tamu (belum login).
//
// Backend memakai guest_device_id (UUID) untuk:
//  - melacak kuota pesan harian (guest_quotas), dan
//  - menandai conversation tamu agar bisa dihapus saat user login.
//
// Disimpan di localStorage karena cookie httpOnly JWT tidak bisa dibaca JS.
export const GUEST_DEVICE_KEY = 'guest_device_id';

let cached = null;

export function getGuestDeviceId() {
  if (cached) return cached;

  const existing = localStorage.getItem(GUEST_DEVICE_KEY);
  if (existing) {
    cached = existing;
    return cached;
  }

  // generate UUID v4
  cached = crypto.randomUUID();
  localStorage.setItem(GUEST_DEVICE_KEY, cached);
  return cached;
}
