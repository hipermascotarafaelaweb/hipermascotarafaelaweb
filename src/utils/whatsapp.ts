import type { CartItem, CustomerInput } from '@/types';
import { effectivePrice } from '@/utils/format';
import { SITE } from '@/config/site';

function formatNumber(price: number): string {
  return price.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function generateWhatsAppLink(
  items: CartItem[],
  total: number,
  customer?: CustomerInput,
  couponDiscount?: number,
  couponCode?: string
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

  const subtotal = couponDiscount ? total + couponDiscount : total;
  const discountLine = couponDiscount && couponCode
    ? `\n🎟️ Cupón ${couponCode}: -$${formatNumber(couponDiscount)}`
    : couponDiscount
    ? `\n🎟️ Descuento: -$${formatNumber(couponDiscount)}`
    : '';
  const subtotalLine = couponDiscount ? `\n💵 Subtotal: $${formatNumber(subtotal)}` : '';

  const message = `🐾 ¡Hola Hipermascota! Quiero realizar el siguiente pedido:

-----------------------------------------
${itemLines}
-----------------------------------------${subtotalLine}${discountLine}
💰 *Total: $${formatNumber(total)}*
🚚 Envío a domicilio: GRATIS${datosCliente}

¿Me confirman la disponibilidad para coordinar el envío? ¡Muchas gracias!`;

  return `https://wa.me/${SITE.phoneNumber}?text=${encodeURIComponent(message)}`;
}
