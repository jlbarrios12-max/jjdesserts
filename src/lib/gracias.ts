// Estado de una sesión de Stripe Checkout para la página de "gracias".
// Solo lectura y solo para informar al cliente; nunca cambia el pedido.
import { pagosTarjetaActivos, stripe } from './pedidos';

export interface EstadoSesion {
  estado: 'pagado' | 'procesando' | 'desconocido';
  orderNumber?: string;
  nombre?: string;
  email?: string;
}

export async function estadoSesion(sessionId: string | null): Promise<EstadoSesion> {
  if (!sessionId || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId) || !pagosTarjetaActivos()) {
    return { estado: 'desconocido' };
  }
  try {
    const s = await stripe().checkout.sessions.retrieve(sessionId);
    const orderNumber = s.metadata?.orderNumber;
    if (!orderNumber) return { estado: 'desconocido' };
    return {
      estado: s.payment_status === 'paid' ? 'pagado' : 'procesando',
      orderNumber,
      nombre: s.customer_details?.name?.split(' ')[0] ?? undefined,
      email: s.customer_details?.email ?? s.customer_email ?? undefined,
    };
  } catch {
    return { estado: 'desconocido' };
  }
}
