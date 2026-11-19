// Botones de cambio de estado en un pedido: cambian el Estado y publican
// en un solo clic, para que no se quede un cambio a medias por olvidar
// "Publish". Cada botón solo aparece cuando tiene sentido según el estado.
import { useEffect, useState } from 'react';
import { useDocumentOperation, type DocumentActionComponent, type DocumentActionProps } from 'sanity';
import type { Estado } from './estadosPedido';

type Pedido = { status?: string; paymentMethod?: string };

// Al publicar, el borrador desaparece: es la señal de que terminó.
function usePublicarEstado(props: DocumentActionProps) {
  const { patch, publish } = useDocumentOperation(props.id, props.type);
  const [enCurso, setEnCurso] = useState(false);

  useEffect(() => {
    if (enCurso && !props.draft) {
      setEnCurso(false);
      props.onComplete();
    }
  }, [enCurso, props.draft]);

  const aplicar = (cambios: Record<string, unknown>) => {
    setEnCurso(true);
    patch.execute([{ set: cambios }]);
    publish.execute();
  };
  return { enCurso, aplicar };
}

const pedidoDe = (props: DocumentActionProps) => (props.draft ?? props.published) as Pedido | null;

function accionAvanzar(destino: Estado, desde: Estado[], etiqueta: string, campoFecha?: string): DocumentActionComponent {
  const Accion: DocumentActionComponent = (props) => {
    const { enCurso, aplicar } = usePublicarEstado(props);
    const pedido = pedidoDe(props);
    if (!pedido || !desde.includes(pedido.status as Estado)) return null;
    return {
      label: enCurso ? 'Guardando…' : etiqueta,
      tone: destino === 'delivered' ? 'positive' : 'primary',
      disabled: enCurso,
      onHandle: () =>
        aplicar({ status: destino, ...(campoFecha ? { [campoFecha]: new Date().toISOString() } : {}) }),
    };
  };
  Accion.displayName = `Pedido_${destino}`;
  return Accion;
}

const accionCancelar: DocumentActionComponent = (props) => {
  const { enCurso, aplicar } = usePublicarEstado(props);
  const [confirmando, setConfirmando] = useState(false);
  const pedido = pedidoDe(props);
  if (!pedido || ['delivered', 'cancelled'].includes(pedido.status ?? '')) return null;

  const cobrado = pedido.status !== 'pending';
  return {
    label: enCurso ? 'Guardando…' : 'Cancelar pedido',
    tone: 'critical',
    disabled: enCurso,
    onHandle: () => setConfirmando(true),
    dialog: confirmando && {
      type: 'confirm',
      tone: 'critical',
      message: cobrado
        ? '¿Cancelar este pedido? OJO: cancelar aquí NO devuelve el dinero. Si el cliente pagó con tarjeta, haz el reembolso en el panel de Stripe.'
        : '¿Cancelar este pedido pendiente de pago?',
      onCancel: () => {
        setConfirmando(false);
        props.onComplete();
      },
      onConfirm: () => {
        setConfirmando(false);
        aplicar({ status: 'cancelled', cancelledAt: new Date().toISOString() });
      },
    },
  };
};
accionCancelar.displayName = 'Pedido_cancelar';

export const accionesPedido: DocumentActionComponent[] = [
  accionAvanzar('preparing', ['paid'], 'Empezar preparación'),
  accionAvanzar('ready', ['paid', 'preparing'], 'Marcar como listo', 'readyAt'),
  accionAvanzar('delivered', ['paid', 'preparing', 'ready'], 'Marcar como entregado', 'deliveredAt'),
  accionCancelar,
];

// Acciones de Sanity que no tienen sentido en un pedido: los pedidos no se
// duplican, ni se borran (se cancelan), ni se despublican.
export const ACCIONES_QUITADAS = ['duplicate', 'delete', 'unpublish'];
