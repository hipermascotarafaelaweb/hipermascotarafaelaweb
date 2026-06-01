export const SITE = {
  name: 'Hipermascota Rafaela',
  description: 'Accesorios para perros y gatos',
  phoneNumber: '5493492330291',
  phoneDisplay: '3492 330291',
  ownerName: 'Mariano Ruffino',
  city: 'Rafaela',
  state: 'Santa Fe',
  country: 'Argentina',
  url: 'https://hipermascotarafaelaweb.vercel.app',
  timezone: 'America/Argentina/Cordoba',
} as const;

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${SITE.phoneNumber}`;
  if (message) {
    return `${base}?text=${encodeURIComponent(message)}`;
  }
  return base;
}
