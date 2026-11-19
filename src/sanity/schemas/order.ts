import { defineType, defineField } from 'sanity';

export const order = defineType({
  name: 'order',
  title: 'Pedido / Order',
  type: 'document',
  // Orders are written by the Stripe webhook, not by humans
  readOnly: false,
  fields: [
    defineField({
      name: 'orderNumber',
      title: 'Número de pedido',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'customerName',
      title: 'Nombre del cliente',
      type: 'string',
    }),
    defineField({
      name: 'customerEmail',
      title: 'Email del cliente',
      type: 'string',
    }),
    defineField({
      name: 'customerPhone',
      title: 'Teléfono del cliente',
      type: 'string',
    }),
    defineField({
      name: 'items',
      title: 'Productos pedidos',
      type: 'array',
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
        },
      ],
    }),
    defineField({
      name: 'subtotal',
      title: 'Subtotal (USD)',
      type: 'number',
    }),
    defineField({
      name: 'taxRate',
      title: 'Tasa de impuesto aplicada',
      type: 'number',
    }),
    defineField({
      name: 'tax',
      title: 'Impuesto (USD)',
      type: 'number',
    }),
    defineField({
      name: 'total',
      title: 'Total (USD)',
      type: 'number',
    }),
    defineField({
      name: 'fulfillmentType',
      title: 'Tipo de entrega',
      type: 'string',
      options: {
        list: [
          { title: 'Pickup (recogida)', value: 'pickup' },
          { title: 'Delivery (entrega)', value: 'delivery' },
        ],
      },
    }),
    defineField({
      name: 'deliveryAddress',
      title: 'Dirección de entrega',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'preferredDate',
      title: 'Fecha preferida',
      type: 'date',
    }),
    defineField({
      name: 'notes',
      title: 'Notas del cliente',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'lang',
      title: 'Idioma del cliente',
      type: 'string',
      options: { list: [{ title: 'Español', value: 'es' }, { title: 'English', value: 'en' }] },
    }),
    defineField({
      name: 'paymentMethod',
      title: 'Método de pago',
      type: 'string',
      options: { list: [{ title: 'Tarjeta (Stripe)', value: 'card' }, { title: 'Al recoger', value: 'pickup' }] },
    }),
    defineField({
      name: 'amountPaid',
      title: 'Importe cobrado por Stripe (USD)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'paidAt',
      title: 'Fecha de pago',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'testMode',
      title: 'Pedido de prueba (Stripe Test)',
      description: 'Si está marcado, no hubo dinero real.',
      type: 'boolean',
      readOnly: true,
    }),
    defineField({
      name: 'stripeSessionId',
      title: 'Stripe Checkout Session ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'stripePaymentIntentId',
      title: 'Stripe Payment Intent ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'notifiedAt',
      title: 'Aviso enviado a n8n',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'cancelReason',
      title: 'Motivo de cancelación',
      type: 'string',
    }),
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          { title: 'Pendiente de pago', value: 'pending' },
          { title: 'Pagado', value: 'paid' },
          { title: 'En preparación', value: 'preparing' },
          { title: 'Listo', value: 'ready' },
          { title: 'Entregado', value: 'delivered' },
          { title: 'Cancelado', value: 'cancelled' },
        ],
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'createdAt',
      title: 'Fecha de creación',
      type: 'datetime',
    }),
  ],
  orderings: [
    { title: 'Más recientes', name: 'createdAtDesc', by: [{ field: 'createdAt', direction: 'desc' }] },
  ],
  preview: {
    select: {
      title: 'orderNumber',
      subtitle: 'customerName',
      total: 'total',
      status: 'status',
      testMode: 'testMode',
    },
    prepare({ title, subtitle, total, status, testMode }) {
      const estados: Record<string, string> = {
        pending: 'Pendiente de pago', paid: 'Pagado', preparing: 'En preparación',
        ready: 'Listo', delivered: 'Entregado', cancelled: 'Cancelado',
      };
      return {
        title: `${testMode ? '[PRUEBA] ' : ''}#${title || 'sin número'} · ${estados[status] ?? status ?? ''}`,
        subtitle: `${subtitle || 'Cliente sin nombre'} — $${total?.toFixed(2) || '0.00'}`,
      };
    },
  },
});
