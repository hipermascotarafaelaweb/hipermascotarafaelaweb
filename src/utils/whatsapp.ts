import type { CartItem, CustomerInput } from '@/types';
import { effectivePrice } from '@/utils/format';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5493492330291';

function formatNumber(price: number): string {
  return price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function generateWhatsAppLink(
  items: CartItem[],
  total: number,
  customer?: CustomerInput
): string {
  const itemLines = items
    .map(
      (item) =>
        `• ${item.quantity}x ${item.product.name} ($${formatNumber(effectivePrice(item.product))} c/u)`
    )
    .join('\n');

  const datosCliente = customer
    ? `

👤 *Mis datos:*
Nombre: ${customer.first_name} ${customer.last_name}
DNI: ${customer.dni}
Teléfono: ${customer.phone}
📍 Dirección de envío: ${customer.address}`
    : '';

  const message = `🐾 ¡Hola Hipermascota! Quiero realizar el siguiente pedido:

-----------------------------------------
${itemLines}
-----------------------------------------
💰 Total: $${formatNumber(total)}
🚚 Envío a domicilio: GRATIS${datosCliente}

¿Me confirman la disponibilidad para coordinar el envío? ¡Muchas gracias!`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
