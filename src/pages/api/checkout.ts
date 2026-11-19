// POST /api/checkout — crea el pedido pendiente en Sanity y la sesión de
// Stripe Checkout, y devuelve la URL de pago a la que redirige el carrito.
//
// Recibe solo qué postres, qué sabor y cuántos, más los datos del cliente.
// El precio que traiga el navegador se ignora: ver src/lib/pedidos.ts.

import type { APIRoute } from 'astro';
import {
  ErrorPedido,
  anotarSesion,
  calcularPedido,
  cancelarPedidoPendiente,
  crearPedidoPendiente,
  pagosTarjetaActivos,
  stripe,
  validarEntrada,
} from '../../lib/pedidos';

export const prerender = false;

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  if (!pagosTarjetaActivos()) {
    return json({ error: 'PAGOS_DESACTIVADOS', message: 'El pago con tarjeta no está disponible.' }, 503);
  }

  let orderId: string | null = null;
  try {
    const { lineas, cliente, idioma } = validarEntrada(await request.json().catch(() => null));
    const calc = await calcularPedido(lineas);
    const pedido = await crearPedidoPendiente(calc, cliente, idioma);
    orderId = pedido._id;

    const en = idioma === 'en';
    const origen = new URL(request.url).origin;
    const pct = `${+(calc.taxRate * 100).toFixed(2)}%`;

    const lineItems = calc.lineas.map((l) => {
      const nombre = en ? l.nameEn : l.nameEs;
      const sabor = en ? l.sizeEn : l.sizeEs;
      return {
        quantity: l.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: l.unitCents,
          product_data: { name: sabor ? `${nombre} (${sabor})` : nombre },
        },
      };
    });
    // El impuesto va como línea propia: el total cobrado es exactamente el
    // del pedido guardado, sin depender de Stripe Tax.
    if (calc.taxCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: calc.taxCents,
          product_data: { name: en ? `Sales tax (${pct})` : `Impuesto sobre ventas (${pct})` },
        },
      });
    }

    const metadata = { orderId: pedido._id, orderNumber: pedido.orderNumber };
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: cliente.email,
      client_reference_id: pedido.orderNumber,
      metadata,
      payment_intent_data: { metadata, description: `JJ Desserts ${pedido.orderNumber}` },
      locale: en ? 'en' : 'es',
      // Una hora para pagar; después Stripe envía checkout.session.expired.
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
      success_url: `${origen}${en ? '/en' : ''}/pedido/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origen}${en ? '/en' : ''}/cart`,
    });

    await anotarSesion(pedido._id, session.id, !session.livemode);
    return json({ url: session.url, orderNumber: pedido.orderNumber });
  } catch (e) {
    if (orderId) {
      await cancelarPedidoPendiente(orderId, 'Error al crear la sesión de pago').catch(() => {});
    }
    if (e instanceof ErrorPedido) {
      return json({ error: e.codigo, message: e.message }, 400);
    }
    console.error('[checkout] error', e);
    return json({ error: 'INTERNO', message: 'No se pudo iniciar el pago. Intenta de nuevo.' }, 500);
  }
};
