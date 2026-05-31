/** Formatea un número como precio en pesos argentinos: $1.500 */
export function formatPrice(value: number): string {
  return `$${value.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

type Priced = { price: number; sale_price?: number | null };

/** ¿El producto tiene una oferta válida (precio de oferta < precio normal)? */
export function hasDiscount(p: Priced): boolean {
  return p.sale_price != null && p.sale_price > 0 && p.sale_price < p.price;
}

/** Precio que realmente paga el cliente: el de oferta si aplica, si no el normal. */
export function effectivePrice(p: Priced): number {
  return hasDiscount(p) ? (p.sale_price as number) : p.price;
}

/** Porcentaje de descuento redondeado (0 si no hay oferta). */
export function discountPercent(p: Priced): number {
  if (!hasDiscount(p)) return 0;
  return Math.round((1 - (p.sale_price as number) / p.price) * 100);
}

/** Formatea una fecha ISO a formato local argentino legible. */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
