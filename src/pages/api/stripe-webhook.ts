// POST /api/stripe-webhook — avisos firmados de Stripe.
//
// Es la ÚNICA confirmación fiable de un pago: que el cliente llegue a la
// página de "gracias" no prueba nada. Aquí se verifica la firma con
// STRIPE_WEBHOOK_SECRET, se marca el pedido como pagado en Sanity y se
// avisa a n8n, que manda los emails de siempre.
//
// Respuestas: 400 si la firma no vale (Stripe no reintenta), 500 si algo
// falló y conviene que Stripe reintente, 200 en el resto de casos.

import type { APIRoute } from 'astro';
import type Stripe from 'stripe';
import { cancelarPedidoPendiente, confirmarPago, stripe, webhookSecret } from '../../lib/pedidos';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const firma = request.headers.get('stripe-signature');
  // El cuerpo tiene que ser el texto exacto que firmó Stripe: nada de parsearlo antes.
  const cuerpo = await request.text();

  let evento: Stripe.Event;
  try {
    if (!firma) throw new Error('sin cabecera stripe-signature');
    evento = stripe().webhooks.constructEvent(cuerpo, firma, webhookSecret());
  } catch (e) {
    console.error('[webhook] firma inválida:', (e as Error).message);
    return new Response('Firma inválida', { status: 400 });
  }

  try {
    switch (evento.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = evento.data.object as Stripe.Checkout.Session;
        // Con métodos de pago diferidos, "completed" llega antes de cobrar.
        if (session.payment_status !== 'paid') break;
        const ok = await confirmarPago(session);
        if (!ok) return new Response('Aviso a n8n pendiente', { status: 500 });
        break;
      }
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const session = evento.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        if (orderId) {
          const motivo = evento.type === 'checkout.session.expired' ? 'Sesión de pago caducada' : 'Pago rechazado';
          await cancelarPedidoPendiente(orderId, motivo);
        }
        break;
      }
      default:
        // Otros eventos no se usan; se aceptan para que Stripe no reintente.
        break;
    }
  } catch (e) {
    console.error(`[webhook] error procesando ${evento.type} ${evento.id}`, e);
    return new Response('Error interno', { status: 500 });
  }

  return new Response('ok', { status: 200 });
};
