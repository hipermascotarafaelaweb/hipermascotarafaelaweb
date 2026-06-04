import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * Devuelve `false` durante el render del servidor y `true` tras la hidratación,
 * sin usar setState dentro de un efecto. Reemplaza el patrón
 * `useState(false) + useEffect(() => setMounted(true), [])`, evitando el aviso
 * react-hooks/set-state-in-effect y las cascadas de render.
 *
 * Útil como guard de hidratación para estado que vive en localStorage (carrito),
 * que no debe renderizarse en el servidor para no provocar mismatch.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true, // snapshot en cliente
    () => false // snapshot en servidor
  );
}
