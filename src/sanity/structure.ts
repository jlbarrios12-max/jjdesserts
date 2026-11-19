// Menú del Studio. Igual que antes para postres, categorías y configuración;
// los pedidos se separan por estado para que Jose vea de un vistazo qué le
// queda pendiente.
import type { StructureResolver, StructureBuilder } from 'sanity/structure';
import type { Estado } from './estadosPedido';

function listaPedidos(
  S: StructureBuilder,
  id: string,
  titulo: string,
  estados: Estado[] | null,
  orden: 'asc' | 'desc'
) {
  const filtro = estados ? '_type == "order" && status in $estados' : '_type == "order"';
  return S.listItem()
    .id(id)
    .title(titulo)
    .schemaType('order')
    .child(
      S.documentList()
        .id(id)
        .title(titulo)
        .schemaType('order')
        .filter(filtro)
        .params(estados ? { estados } : {})
        .defaultOrdering([{ field: 'createdAt', direction: orden }])
        // Sin botón "+": los pedidos solo los crea la web.
        .initialValueTemplates([])
    );
}

export const estructura: StructureResolver = (S) =>
  S.list()
    .title('Contenido')
    .items([
      S.documentTypeListItem('dessert').title('Postre / Dessert'),
      S.documentTypeListItem('category').title('Categoría / Category'),
      S.documentTypeListItem('siteSettings').title('Configuración del Sitio / Site Settings'),
      S.divider(),
      S.listItem()
        .id('pedidos')
        .title('Pedido / Order')
        .schemaType('order')
        .child(
          S.list()
            .id('pedidos-por-estado')
            .title('Pedidos')
            .items([
              // Cola de trabajo: los más antiguos primero.
              listaPedidos(S, 'por-preparar', 'Por preparar (pagados)', ['paid'], 'asc'),
              listaPedidos(S, 'en-preparacion', 'En preparación', ['preparing'], 'asc'),
              listaPedidos(S, 'listos', 'Listos para entregar', ['ready'], 'asc'),
              S.divider(),
              // Historial: los más recientes primero.
              listaPedidos(S, 'entregados', 'Entregados', ['delivered'], 'desc'),
              listaPedidos(S, 'pendientes-pago', 'Pendientes de pago', ['pending'], 'desc'),
              listaPedidos(S, 'cancelados', 'Cancelados', ['cancelled'], 'desc'),
              listaPedidos(S, 'reembolsados', 'Reembolsados', ['refunded'], 'desc'),
              S.divider(),
              listaPedidos(S, 'todos', 'Todos los pedidos', null, 'desc'),
            ])
        ),
    ]);
