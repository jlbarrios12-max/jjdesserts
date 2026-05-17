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
      name: 'notes',
      title: 'Notas del cliente',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'stripePaymentIntentId',
      title: 'Stripe Payment Intent ID',
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
  preview: {
    select: {
      title: 'orderNumber',
      subtitle: 'customerName',
      total: 'total',
    },
    prepare({ title, subtitle, total }) {
      return {
        title: `#${title || 'sin número'}`,
        subtitle: `${subtitle || 'Cliente sin nombre'} — $${total?.toFixed(2) || '0.00'}`,
      };
    },
  },
});
