// =============================================================
// Pedidos y pagos — lógica de servidor compartida.
//
// Regla principal: el navegador NUNCA decide el precio. Del carrito solo
// se acepta qué postre, qué sabor y cuántos; el precio, el impuesto y el
// total se recalculan aquí con los datos de Sanity.
//
// Este módulo solo se importa desde rutas de servidor (src/pages/api/* y
// páginas con prerender = false). Nunca desde un <script> del navegador:
// usa la clave secreta de Stripe y el token de escritura de Sanity.
// =============================================================

import Stripe from 'stripe';
import { sanityClient, sanityWriteClient } from '../sanity/client';

// --- Configuración -------------------------------------------------

// import.meta.env se resuelve al compilar; process.env cubre el caso de
// variables que solo existen en tiempo de ejecución en Netlify.
const env = {
  pagosTarjeta: import.meta.env.PUBLIC_PAGOS_TARJETA ?? process.env.PUBLIC_PAGOS_TARJETA,
  stripeSecret: import.meta.env.STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: import.meta.env.STRIPE_WEBHOOK_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET,
  sanityToken: import.meta.env.SANITY_API_TOKEN ?? process.env.SANITY_API_TOKEN,
  n8nUrl: import.meta.env.N8N_ORDER_WEBHOOK_URL ?? process.env.N8N_ORDER_WEBHOOK_URL,
};

export const PEDIDO_MINIMO = 30; // USD, sobre el subtotal (igual que el carrito)
const MAX_LINEAS = 50;
const MAX_CANTIDAD = 50;

/** El pago con tarjeta solo se ofrece si está activado explícitamente. */
export function pagosTarjetaActivos(): boolean {
  return env.pagosTarjeta === 'true' && !!env.stripeSecret && !!env.sanityToken;
}

let stripeCache: Stripe | null = null;
export function stripe(): Stripe {
  if (!env.stripeSecret) throw new Error('STRIPE_SECRET_KEY no configurada');
  if (!stripeCache) stripeCache = new Stripe(env.stripeSecret);
  return stripeCache;
}

export function webhookSecret(): string {
  if (!env.stripeWebhookSecret || !env.stripeWebhookSecret.startsWith('whsec_')) {
    throw new Error('STRIPE_WEBHOOK_SECRET no configurada');
  }
  return env.stripeWebhookSecret;
}

function escritor() {
  if (!sanityWriteClient || !env.sanityToken) throw new Error('SANITY_API_TOKEN no configurado');
  return sanityWriteClient;
}

/** Error con mensaje apto para mostrar al cliente (código HTTP 400). */
export class ErrorPedido extends Error {
  constructor(public codigo: string, mensaje: string) {
    super(mensaje);
  }
}

// --- Entrada del navegador ----------------------------------------

export type Idioma = 'es' | 'en';
export type Entrega = 'pickup' | 'delivery';

export interface LineaEntrada {
  dessertId: string;
  sizeEs?: string;
  quantity: number;
}

export interface ClienteEntrada {
  nombre: string;
  email: string;
  telefono: string;
  entrega: Entrega;
  direccion?: string;
  fecha?: string;
  notas?: string;
}

function texto(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

/** Valida y normaliza el cuerpo de /api/checkout. Lanza ErrorPedido. */
export function validarEntrada(cuerpo: any): { lineas: LineaEntrada[]; cliente: ClienteEntrada; idioma: Idioma } {
  if (!cuerpo || typeof cuerpo !== 'object') throw new ErrorPedido('INVALIDO', 'Petición inválida');
  if (texto(cuerpo.botField, 100)) throw new ErrorPedido('INVALIDO', 'Petición inválida'); // honeypot

  const idioma: Idioma = cuerpo.lang === 'en' ? 'en' : 'es';

  if (!Array.isArray(cuerpo.items) || cuerpo.items.length === 0) {
    throw new ErrorPedido('CARRITO_VACIO', 'El carrito está vacío');
  }
  if (cuerpo.items.length > MAX_LINEAS) throw new ErrorPedido('INVALIDO', 'Demasiados productos');

  const lineas: LineaEntrada[] = cuerpo.items.map((i: any) => {
    const cantidad = Number(i?.quantity);
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_CANTIDAD) {
      throw new ErrorPedido('INVALIDO', 'Cantidad inválida');
    }
    const dessertId = texto(i?.dessertId, 100);
    if (!dessertId) throw new ErrorPedido('INVALIDO', 'Producto inválido');
    return { dessertId, sizeEs: texto(i?.sizeEs, 100) || undefined, quantity: cantidad };
  });

  const c = cuerpo.customer ?? {};
  const entrega: Entrega = c.entrega === 'delivery' ? 'delivery' : c.entrega === 'pickup' ? 'pickup' : (null as any);
  const cliente: ClienteEntrada = {
    nombre: texto(c.nombre, 120),
    email: texto(c.email, 200),
    telefono: texto(c.telefono, 40),
    entrega,
    direccion: texto(c.direccion, 300) || undefined,
    fecha: texto(c.fecha, 10) || undefined,
    notas: texto(c.notas, 1000) || undefined,
  };
  if (!cliente.nombre || !cliente.telefono) throw new ErrorPedido('DATOS', 'Faltan nombre o teléfono');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email)) throw new ErrorPedido('DATOS', 'Correo inválido');
  if (!cliente.entrega) throw new ErrorPedido('DATOS', 'Falta el tipo de entrega');
  if (cliente.entrega === 'delivery' && !cliente.direccion) throw new ErrorPedido('DATOS', 'Falta la dirección de entrega');
  if (cliente.fecha && !/^\d{4}-\d{2}-\d{2}$/.test(cliente.fecha)) cliente.fecha = undefined;

  return { lineas, cliente, idioma };
}

// --- Precios desde Sanity -----------------------------------------

export interface LineaPrecio {
  dessertId: string;
  nameEs: string;
  nameEn: string;
  sizeEs?: string;
  sizeEn?: string;
  quantity: number;
  unitCents: number;
  lineCents: number;
}

export interface Calculo {
  lineas: LineaPrecio[];
  subtotalCents: number;
  taxRate: number;
  taxCents: number;
  totalCents: number;
}

interface PostreSanity {
  _id: string;
  nameEs: string;
  nameEn: string;
  price?: number;
  available?: boolean;
  sizes?: { _key: string; labelEs: string; labelEn: string; price: number }[];
}

const aCentavos = (usd: number) => Math.round(usd * 100);

/** Recalcula el pedido con precios e impuesto de Sanity. Lanza ErrorPedido. */
export async function calcularPedido(entrada: LineaEntrada[]): Promise<Calculo> {
  if (!sanityClient) throw new Error('Sanity no configurado');
  const ids = [...new Set(entrada.map((l) => l.dessertId))];

  // Sin CDN: los precios tienen que ser los publicados ahora, no los de caché.
  const lector = sanityClient.withConfig({ useCdn: false });
  const [postres, taxRate] = await Promise.all([
    lector.fetch<PostreSanity[]>(
      `*[_type == "dessert" && _id in $ids]{ _id, nameEs, nameEn, price, available, sizes[]{ _key, labelEs, labelEn, price } }`,
      { ids }
    ),
    lector.fetch<number | null>(`*[_type == "siteSettings"][0].salesTaxRate`),
  ]);

  // El impuesto lo decide Jose en Sanity. Si falta o es absurdo, no se cobra.
  if (typeof taxRate !== 'number' || !(taxRate >= 0 && taxRate < 0.2)) {
    throw new Error(`salesTaxRate inválido en Sanity: ${taxRate}`);
  }

  const porId = new Map(postres.map((p) => [p._id, p]));
  const lineas: LineaPrecio[] = entrada.map((l) => {
    const p = porId.get(l.dessertId);
    if (!p || p.available === false) {
      throw new ErrorPedido('NO_DISPONIBLE', 'Un producto del carrito ya no está disponible. Revisa tu carrito.');
    }
    let precio: number | undefined;
    let sizeEs: string | undefined;
    let sizeEn: string | undefined;
    if (p.sizes && p.sizes.length > 0) {
      const s = p.sizes.find((x) => x.labelEs.trim() === (l.sizeEs ?? '').trim());
      if (!s) throw new ErrorPedido('NO_DISPONIBLE', 'Un sabor del carrito ya no está disponible. Revisa tu carrito.');
      precio = s.price;
      // En Sanity hay etiquetas con espacios al final ("Original "): se limpian
      // para que no salgan como "(Original )" en Stripe ni en el correo.
      sizeEs = s.labelEs.trim();
      sizeEn = s.labelEn?.trim() || sizeEs;
    } else {
      precio = p.price;
    }
    if (typeof precio !== 'number' || !(precio > 0)) {
      throw new ErrorPedido('NO_DISPONIBLE', 'Un producto del carrito no tiene precio. Revisa tu carrito.');
    }
    const unitCents = aCentavos(precio);
    return {
      dessertId: p._id, nameEs: p.nameEs.trim(), nameEn: (p.nameEn ?? p.nameEs).trim(), sizeEs, sizeEn,
      quantity: l.quantity, unitCents, lineCents: unitCents * l.quantity,
    };
  });

  const subtotalCents = lineas.reduce((s, l) => s + l.lineCents, 0);
  if (subtotalCents < PEDIDO_MINIMO * 100) {
    throw new ErrorPedido('MINIMO', `El pedido mínimo es de $${PEDIDO_MINIMO.toFixed(2)}`);
  }
  const taxCents = Math.round(subtotalCents * taxRate);
  return { lineas, subtotalCents, taxRate, taxCents, totalCents: subtotalCents + taxCents };
}

// --- Pedido en Sanity ---------------------------------------------

/** Número legible: JJ-AAMMDD-XXXX (hora de Florida). */
export function nuevoNumeroPedido(): string {
  const f = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: '2-digit', month: '2-digit', day: '2-digit' })
    .format(new Date())
    .replace(/-/g, '');
  const sufijo = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, '0');
  return `JJ-${f}-${sufijo}`;
}

export async function crearPedidoPendiente(calc: Calculo, cliente: ClienteEntrada, idioma: Idioma) {
  const orderNumber = nuevoNumeroPedido();
  const _id = `pedido-${orderNumber.toLowerCase()}`;
  await escritor().create({
    _id,
    _type: 'order',
    orderNumber,
    customerName: cliente.nombre,
    customerEmail: cliente.email,
    customerPhone: cliente.telefono,
    items: calc.lineas.map((l, i) => ({
      _key: `l${i}`,
      dessertId: l.dessertId,
      dessertName: l.nameEs,
      size: l.sizeEs,
      quantity: l.quantity,
      unitPrice: l.unitCents / 100,
      lineTotal: l.lineCents / 100,
    })),
    subtotal: calc.subtotalCents / 100,
    taxRate: calc.taxRate,
    tax: calc.taxCents / 100,
    total: calc.totalCents / 100,
    fulfillmentType: cliente.entrega,
    deliveryAddress: cliente.entrega === 'delivery' ? cliente.direccion : undefined,
    preferredDate: cliente.fecha,
    notes: cliente.notas,
    lang: idioma,
    paymentMethod: 'card',
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  return { _id, orderNumber };
}

export async function anotarSesion(orderId: string, sessionId: string, testMode: boolean) {
  await escritor().patch(orderId).set({ stripeSessionId: sessionId, testMode }).commit();
}

export async function cancelarPedidoPendiente(orderId: string, motivo: string) {
  const w = escritor();
  const pedido = await w.getDocument(orderId);
  if (pedido && pedido.status === 'pending') {
    await w.patch(orderId).set({ status: 'cancelled', cancelReason: motivo }).commit();
  }
}

// --- Confirmación de pago (webhook) -------------------------------

interface PedidoGuardado {
  _id: string;
  _rev: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: { dessertName: string; size?: string; quantity: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  fulfillmentType: Entrega;
  deliveryAddress?: string;
  preferredDate?: string;
  notes?: string;
  lang: Idioma;
  status: string;
  notifiedAt?: string;
}

/**
 * Marca el pedido como pagado y avisa a n8n. Idempotente: Stripe puede
 * repetir el mismo evento, y un pedido ya pagado y avisado no se toca.
 * Devuelve false si n8n falló (el webhook responde 500 y Stripe reintenta).
 */
export async function confirmarPago(session: Stripe.Checkout.Session): Promise<boolean> {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.error('[pagos] sesión sin orderId en metadata', session.id);
    return true; // nada que reintentar
  }
  const w = escritor();
  const pedido = await w.getDocument<PedidoGuardado>(orderId);
  if (!pedido) {
    console.error('[pagos] pedido no encontrado', orderId, session.id);
    return true;
  }

  if (pedido.status === 'pending' || pedido.status === 'cancelled') {
    const pagado = session.amount_total ?? 0;
    const esperado = Math.round(pedido.total * 100);
    if (pagado !== esperado) {
      console.error(`[pagos] importe distinto en ${pedido.orderNumber}: pagado ${pagado} esperado ${esperado}`);
    }
    const piId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;
    await w
      .patch(orderId)
      .set({
        status: 'paid',
        paidAt: new Date().toISOString(),
        amountPaid: pagado / 100,
        stripePaymentIntentId: piId,
        stripeSessionId: session.id,
      })
      .unset(['cancelReason'])
      .commit();
  }

  if (pedido.notifiedAt) return true;
  const aviso = await avisarN8n(pedido);
  if (aviso === 'enviado') await w.patch(orderId).set({ notifiedAt: new Date().toISOString() }).commit();
  return aviso !== 'fallo';
}

const usd = (n: number) => '$' + n.toFixed(2);

/** Mismos campos que el formulario actual del carrito, más el estado del pago. */
async function avisarN8n(p: PedidoGuardado): Promise<'enviado' | 'omitido' | 'fallo'> {
  if (!env.n8nUrl) {
    // En local se deja vacía a propósito. No se marca notifiedAt: el pedido
    // queda visible como "pagado pero sin avisar".
    console.warn(`[pagos] N8N_ORDER_WEBHOOK_URL vacía: no se avisa del pedido ${p.orderNumber}`);
    return 'omitido';
  }
  const en = p.lang === 'en';
  const pct = `${+(p.taxRate * 100).toFixed(2)}%`;
  const lineas = p.items.map((i) => {
    const sabor = i.size ? ` (${i.size})` : '';
    return `${i.quantity}x ${i.dessertName}${sabor} - ${usd(i.unitPrice)} ${en ? 'ea' : 'c/u'} = ${usd(i.lineTotal)}`;
  });
  lineas.push('---');
  lineas.push(`Subtotal: ${usd(p.subtotal)}`);
  lineas.push(`${en ? 'Tax' : 'Impuesto'} (${pct}): ${usd(p.tax)}`);
  lineas.push(`TOTAL: ${usd(p.total)}`);
  lineas.push(en ? 'PAID BY CARD (Stripe)' : 'PAGADO CON TARJETA (Stripe)');

  const datos = new URLSearchParams({
    'form-name': 'order',
    lang: p.lang,
    pedido: lineas.join('\n'),
    total: usd(p.total),
    nombre: p.customerName,
    email: p.customerEmail,
    telefono: p.customerPhone,
    'tipo-entrega': p.fulfillmentType === 'delivery'
      ? (en ? 'Delivery' : 'Entrega a domicilio')
      : (en ? 'Pickup' : 'Recogida en sitio'),
    direccion: p.deliveryAddress ?? '',
    'fecha-preferida': p.preferredDate ?? '',
    notas: p.notes ?? '',
    'metodo-pago': 'tarjeta',
    'estado-pago': 'PAGADO',
    'numero-pedido': p.orderNumber,
  });

  try {
    const r = await fetch(env.n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: datos.toString(),
    });
    if (!r.ok) console.error(`[pagos] n8n respondió ${r.status} para ${p.orderNumber}`);
    return r.ok ? 'enviado' : 'fallo';
  } catch (e) {
    console.error(`[pagos] n8n inaccesible para ${p.orderNumber}`, e);
    return 'fallo';
  }
}
