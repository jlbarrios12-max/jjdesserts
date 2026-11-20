import { defineType, defineField } from 'sanity';
import { ESTADOS, tituloEstado } from '../estadosPedido';

// Los pedidos los escriben la web y el webhook de Stripe, no las personas.
// En el Studio solo se editan el Estado (normalmente con los botones de
// src/sanity/accionesPedido.ts), las notas internas y el motivo de
// cancelación. Todo lo demás es de solo lectura para que no se cambie sin
// querer el total, los productos o los datos del cliente.
//
// readOnly solo afecta al Studio: la web sigue pudiendo escribir con el token.
const RO = { readOnly: true } as const;

export const order = defineType({
  name: 'order',
  title: 'Pedido / Order',
  type: 'document',
  fields: [
    // --- Gestión (lo que Jose toca) ---
    defineField({
      name: 'status',
      title: 'Estado',
      description: 'Usa los botones de abajo ("Marcar como listo", "Marcar como entregado"...). El desplegable queda para corregir errores.',
      type: 'string',
      options: { list: ESTADOS.map((e) => ({ title: e.title, value: e.value })), layout: 'dropdown' },
      initialValue: 'pending',
    }),
    defineField({
      name: 'internalNotes',
      title: 'Notas internas',
      description: 'Solo para JJ Desserts. El cliente no las ve.',
      type: 'text',
      rows: 3,
    }),
    defineField({ name: 'cancelReason', title: 'Motivo de cancelación', type: 'string' }),
    defineField({ name: 'readyAt', title: 'Marcado como listo', type: 'datetime', ...RO }),
    defineField({ name: 'deliveredAt', title: 'Entregado el', type: 'datetime', ...RO }),
    defineField({ name: 'cancelledAt', title: 'Cancelado el', type: 'datetime', ...RO }),

    // --- Pedido ---
    defineField({ name: 'orderNumber', title: 'Número de pedido', type: 'string', ...RO }),
    defineField({ name: 'createdAt', title: 'Fecha del pedido', type: 'datetime', ...RO }),
    defineField({
      name: 'items',
      title: 'Productos pedidos',
      type: 'array',
      ...RO,
      of: [
        {
          type: 'object',
          fields: [
            { name: 'dessertId', title: 'ID del postre', type: 'string' },
            { name: 'dessertName', title: 'Nombre', type: 'string' },
            { name: 'size', title: 'Sabor', type: 'string' },
            { name: 'quantity', title: 'Cantidad', type: 'number' },
            { name: 'unitPrice', title: 'Precio unitario', type: 'number' },
            { name: 'lineTotal', title: 'Total línea', type: 'number' },
          ],
          preview: {
            select: { n: 'dessertName', s: 'size', q: 'quantity', t: 'lineTotal' },
            prepare: ({ n, s, q, t }) => ({
              title: `${q ?? 1}× ${n ?? ''}${s ? ` (${s})` : ''}`,
              subtitle: typeof t === 'number' ? `$${t.toFixed(2)}` : '',
            }),
          },
        },
      ],
    }),
    defineField({ name: 'subtotal', title: 'Subtotal (USD)', type: 'number', ...RO }),
    defineField({ name: 'taxRate', title: 'Tasa de impuesto aplicada', type: 'number', ...RO }),
    defineField({ name: 'tax', title: 'Impuesto (USD)', type: 'number', ...RO }),
    defineField({ name: 'deliveryFee', title: 'Envío (USD)', description: 'Sin impuesto.', type: 'number', ...RO }),
    defineField({ name: 'total', title: 'Total (USD)', type: 'number', ...RO }),

    // --- Cliente y entrega ---
    defineField({ name: 'customerName', title: 'Nombre del cliente', type: 'string', ...RO }),
    defineField({ name: 'customerEmail', title: 'Email del cliente', type: 'string', ...RO }),
    defineField({ name: 'customerPhone', title: 'Teléfono del cliente', type: 'string', ...RO }),
    defineField({
      name: 'fulfillmentType',
      title: 'Tipo de entrega',
      type: 'string',
      ...RO,
      options: {
        list: [
          { title: 'Pickup (recogida)', value: 'pickup' },
          { title: 'Delivery (entrega)', value: 'delivery' },
        ],
      },
    }),
    defineField({
      name: 'deliveryZone',
      title: 'Distancia de entrega (la elige el cliente)',
      description: 'Revisa la dirección: si el cliente eligió mal, ajusta el cobro en Stripe.',
      type: 'string',
      ...RO,
      options: {
        list: [
          { title: 'Hasta 15 millas ($15)', value: 'cerca' },
          { title: 'Más de 15 millas ($25)', value: 'lejos' },
        ],
      },
    }),
    defineField({ name: 'deliveryAddress', title: 'Dirección de entrega', type: 'text', rows: 3, ...RO }),
    defineField({ name: 'preferredDate', title: 'Fecha preferida', type: 'date', ...RO }),
    defineField({ name: 'notes', title: 'Notas del cliente', type: 'text', rows: 3, ...RO }),
    defineField({
      name: 'lang',
      title: 'Idioma del cliente',
      type: 'string',
      ...RO,
      options: { list: [{ title: 'Español', value: 'es' }, { title: 'English', value: 'en' }] },
    }),

    // --- Pago ---
    defineField({
      name: 'paymentMethod',
      title: 'Método de pago',
      type: 'string',
      ...RO,
      options: { list: [{ title: 'Tarjeta (Stripe)', value: 'card' }, { title: 'Al recoger', value: 'pickup' }] },
    }),
    defineField({ name: 'amountPaid', title: 'Importe cobrado por Stripe (USD)', type: 'number', ...RO }),
    defineField({ name: 'paidAt', title: 'Fecha de pago', type: 'datetime', ...RO }),
    defineField({
      name: 'testMode',
      title: 'Pedido de prueba (Stripe Test)',
      description: 'Si está marcado, no hubo dinero real.',
      type: 'boolean',
      ...RO,
    }),
    defineField({
      name: 'refundedAmount',
      title: 'Reembolsado (USD)',
      description: 'Lo actualiza Stripe automáticamente al reembolsar desde su panel.',
      type: 'number',
      ...RO,
    }),
    defineField({ name: 'refundedAt', title: 'Último reembolso', type: 'datetime', ...RO }),
    defineField({ name: 'stripeSessionId', title: 'Stripe Checkout Session ID', type: 'string', ...RO }),
    defineField({ name: 'stripePaymentIntentId', title: 'Stripe Payment Intent ID', type: 'string', ...RO }),
    defineField({ name: 'notifiedAt', title: 'Aviso enviado a n8n', type: 'datetime', ...RO }),
  ],
  orderings: [
    { title: 'Más recientes', name: 'createdAtDesc', by: [{ field: 'createdAt', direction: 'desc' }] },
    { title: 'Más antiguos', name: 'createdAtAsc', by: [{ field: 'createdAt', direction: 'asc' }] },
    { title: 'Fecha preferida', name: 'preferredDateAsc', by: [{ field: 'preferredDate', direction: 'asc' }] },
  ],
  preview: {
    select: {
      title: 'orderNumber',
      subtitle: 'customerName',
      total: 'total',
      status: 'status',
      testMode: 'testMode',
      fecha: 'preferredDate',
      reembolso: 'refundedAmount',
    },
    prepare({ title, subtitle, total, status, testMode, fecha, reembolso }) {
      const parcial = status !== 'refunded' && reembolso > 0 ? ` · reembolsado $${reembolso.toFixed(2)}` : '';
      return {
        title: `${testMode ? '[PRUEBA] ' : ''}#${title || 'sin número'} · ${tituloEstado(status)}${parcial}`,
        subtitle: `${subtitle || 'Cliente sin nombre'} — $${total?.toFixed(2) || '0.00'}${fecha ? ` · para ${fecha}` : ''}`,
      };
    },
  },
});
