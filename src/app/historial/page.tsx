import { Metadata } from 'next';
import ClientHistorial from './ClientHistorial';

export const metadata: Metadata = {
  title: 'Mi historial de compras',
  description: 'Consulta tus pedidos anteriores con tu DNI.',
};

export default function HistorialPage() {
  return <ClientHistorial />;
}
