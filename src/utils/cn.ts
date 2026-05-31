type ClassValue = string | number | boolean | undefined | null;

/** Une clases condicionales filtrando valores vacíos. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
