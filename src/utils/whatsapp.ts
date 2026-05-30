import type { CartItem } from '@/types';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493492330291';

function formatPrice(price: number): string {
  return price.toLocaleString('es-AR', { minimumFractionDigits: 0 });
}

export function generateWhatsAppLink(items: CartItem[], total: number): string {
  const itemLines = items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.product.name} ($${formatPrice(item.product.price)} c/u)`
    )
    .join('\n');

  const message = `🐾 ¡Hola Hipermascota! Quiero realizar el siguiente pedido:

-----------------------------------------
${itemLines}
-----------------------------------------
💰 Total Pedido: $${formatPrice(total)}

¿Me confirman la disponibilidad para coordinar el retiro/envío? ¡Muchas gracias!`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
