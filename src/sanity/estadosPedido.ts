// Estados de un pedido: una sola lista para el esquema, las listas del
// Studio y los botones de cambio de estado.

export const ESTADOS = [
  { value: 'pending', title: 'Pendiente de pago' },
  { value: 'paid', title: 'Pagado' },
  { value: 'preparing', title: 'En preparación' },
  { value: 'ready', title: 'Listo' },
  { value: 'delivered', title: 'Entregado' },
  { value: 'cancelled', title: 'Cancelado' },
  // Lo pone el webhook cuando el pago se reembolsa ENTERO en Stripe.
  // Un reembolso parcial no cambia el estado: solo rellena refundedAmount.
  { value: 'refunded', title: 'Reembolsado' },
] as const;

export type Estado = (typeof ESTADOS)[number]['value'];

export const tituloEstado = (v?: string) => ESTADOS.find((e) => e.value === v)?.title ?? v ?? '';
