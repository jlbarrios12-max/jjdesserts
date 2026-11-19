# JJ Desserts — Web v2

Sitio web bilingüe (ES/EN) con catálogo dinámico, panel de admin (Sanity) y pago con tarjeta (Stripe).

**Stack:** Astro (render en servidor) + Sanity CMS + Stripe Checkout + Netlify. Los avisos de pedido los manda n8n (`n8n.flowverge.ai`).

> **Estado a 18/11/2026:** el pago con tarjeta está **construido, probado en modo Test y apagado en producción**.
> La web en vivo sigue con el flujo de siempre ("Enviar Pedido" → n8n, sin cobro online).
> Se enciende cuando Jose tenga su cuenta de Stripe en Live: ver [§6 Puesta en producción](#6-puesta-en-producción-de-los-pagos).

---

## 1. Estructura del proyecto

```
JJDesserts/
├── _legacy/                    # Prototipo HTML viejo (referencia, no se toca)
├── assets/                     # Fotos y vídeo de partida (no se suben al repo)
├── public/                     # Archivos estáticos (logo, netlify-forms.html antiguo)
├── docs/                       # Guías de Sanity para Jose (ES/EN, .docx)
├── src/
│   ├── components/             # Header, Hero, Footer, Logo, TopBar
│   ├── i18n/strings.ts         # Textos de la interfaz ES/EN
│   ├── layouts/BaseLayout.astro
│   ├── lib/
│   │   ├── pedidos.ts          # SERVIDOR: precios desde Sanity, pedido, Stripe, aviso a n8n, reembolsos
│   │   └── gracias.ts          # SERVIDOR: estado de la sesión de Stripe para la página de gracias
│   ├── pages/
│   │   ├── index.astro         # / (home en español, por defecto)
│   │   ├── [slug].astro        # /<categoría>
│   │   ├── menu/               # /menu y /menu/<postre>
│   │   ├── cart.astro          # /cart (carrito + formulario)
│   │   ├── pedido/gracias.astro# /pedido/gracias (vuelta desde Stripe)
│   │   ├── api/
│   │   │   ├── checkout.ts     # POST: crea pedido pendiente + sesión de Stripe Checkout
│   │   │   └── stripe-webhook.ts # POST: avisos firmados de Stripe (pago, caducidad, reembolsos)
│   │   └── en/                 # Versión inglesa de todo lo anterior
│   ├── sanity/
│   │   ├── client.ts           # Cliente de lectura y de escritura (token)
│   │   ├── queries.ts          # Consultas GROQ
│   │   ├── types.ts
│   │   ├── estadosPedido.ts    # Lista única de estados de un pedido
│   │   ├── structure.ts        # Menú del Studio (pedidos agrupados por estado)
│   │   ├── accionesPedido.ts   # Botones del pedido en el Studio
│   │   └── schemas/            # dessert, category, siteSettings, order
│   └── styles/global.css
├── astro.config.mjs            # Astro + i18n + Sanity + adaptador de Netlify
├── sanity.config.ts            # Studio: esquemas, menú y acciones de pedidos
├── .env.example                # Plantilla de variables (copiar a .env)
└── README.md
```

---

## 2. Setup inicial

### 2.1 Node.js y dependencias

Node 20 LTS o superior. En la carpeta del proyecto:

```bash
npm install
```

`node_modules` pesa ~500 MB y 55.000 archivos: **no lo copies ni lo sincronices con OneDrive**, se regenera con `npm install`.

### 2.2 Cuentas (todas a nombre del cliente)

| Servicio | Estado | Acceso |
|---|---|---|
| **GitHub** `jlbarrios12-max/jjdesserts` | Activo | Raul hace push con la credencial de `jlbarrios12-max` (el remoto lleva `jlbarrios12-max@` en la URL) |
| **Sanity** proyecto `4yoeszbn`, dataset `production` | Activo | Jose entra con **Google** usando su correo de Yahoo. Hay un segundo proyecto "JJ Desserts" vacío en otra organización: no es el bueno |
| **Netlify** | Activo, despliega automáticamente desde `main` | — |
| **Stripe** | **Pendiente**: Jose tiene que crearla y activarla en Live | Raul como *Developer* |
| **n8n** `n8n.flowverge.ai`, webhook `jj-desserts-order` | Activo | Cuenta de Flowverge |

Para desarrollar, Raul usa el sandbox de Stripe **"Flowverge AI sandbox"** (solo modo Test, no puede cobrar dinero real).

### 2.3 Variables de entorno

Copia `.env.example` a `.env` y rellena. **`.env` no se sube nunca** (está en `.gitignore`).

| Variable | Para qué | Local | Netlify (Live) |
|---|---|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | Proyecto de Sanity | `4yoeszbn` | igual |
| `PUBLIC_SANITY_DATASET` | Dataset | `production` | igual |
| `SANITY_API_TOKEN` | Escritura de pedidos (token *Editor*, Sanity → API → Tokens) | token | token |
| `STRIPE_SECRET_KEY` | Crear sesiones de pago y leer cargos | `sk_test_…` (sandbox) | `sk_live_…` de Jose |
| `STRIPE_WEBHOOK_SECRET` | Verificar la firma de los avisos de Stripe | `whsec_…` de Stripe CLI | `whsec_…` del webhook de producción |
| `PUBLIC_PAGOS_TARJETA` | **Interruptor del pago con tarjeta** (ver §5.2) | `true` para probar | `false`/sin definir hasta el Live |
| `N8N_ORDER_WEBHOOK_URL` | Aviso a n8n de pedidos **pagados** | **vacía** (no avisa a Jose en pruebas) | URL del webhook de n8n |

No se usan en el código (se pueden dejar o quitar): `PUBLIC_STRIPE_PUBLISHABLE_KEY` (Stripe Checkout es una página alojada por Stripe), `SALES_TAX_RATE` (el impuesto sale de Sanity) y `PUBLIC_SITE_URL` (las URLs de vuelta se calculan desde la petición).

---

## 3. Correr el sitio en local

```bash
npm run dev
```

Se abre en http://localhost:4321:

- `/`, `/menu`, `/cart` → español · `/en/…` → inglés
- `/studio` → panel de Sanity (pide iniciar sesión)

`npm run build` compila igual que Netlify. El `.env` solo se lee al arrancar: tras cambiarlo, reinicia el servidor.

---

## 4. Panel de administración (Sanity Studio)

Jose entra en `jjdesserts.com/studio` (o `localhost:4321/studio`).

### 4.1 Contenido

- **Configuración del Sitio**: vídeo y textos del hero, contacto, redes y **tasa de impuesto** (`0.07` = 7 %, Miami-Dade). El pago con tarjeta cobra exactamente la tasa que haya aquí.
- **Categoría**: crear primero.
- **Postre**: nombre y descripción ES/EN, foto, galería, **sabores con su precio**, alérgenos, disponible, destacado.

Al pulsar **Publish** aparece en la web en segundos.

> El carrito todavía muestra el impuesto como "7 %" escrito en el código. Si se cambia la tasa en Sanity, hay que cambiar también `TAX_RATE` en `cart.astro` y `en/cart.astro` para que el carrito y el cobro coincidan.

### 4.2 Pedidos

Los pedidos los crea la web cuando un cliente paga con tarjeta. En **Pedido / Order** salen agrupados:

| Lista | Contenido | Orden |
|---|---|---|
| Por preparar (pagados) | Pagados, aún sin empezar | Más antiguos primero |
| En preparación | — | Más antiguos primero |
| Listos para entregar | — | Más antiguos primero |
| Entregados / Pendientes de pago / Cancelados / Reembolsados / Todos | Historial | Más recientes primero |

Dentro de un pedido, **botones de un clic** (cambian el estado *y* publican, y guardan la hora):

- **Empezar preparación** · **Marcar como listo** · **Marcar como entregado**
- **Cancelar pedido**: pide confirmación. **No devuelve el dinero**: el reembolso se hace en Stripe (§5.4).

Protecciones: productos, totales, cliente y datos de pago son de **solo lectura**. Solo se editan *Estado* (desplegable, para corregir errores), *Notas internas* (el cliente no las ve) y *Motivo de cancelación*. Los pedidos no se crean a mano, ni se duplican, borran o despublican desde el Studio. Los pedidos hechos con Stripe en modo Test salen marcados **`[PRUEBA]`**.

Estados: `pending` Pendiente de pago → `paid` Pagado → `preparing` En preparación → `ready` Listo → `delivered` Entregado; además `cancelled` Cancelado y `refunded` Reembolsado.

---

## 5. Pago con tarjeta (Stripe)

### 5.1 Flujo

```
Cliente: carrito + datos ──► POST /api/checkout
                              · recalcula precios, mínimo $30 e impuesto DESDE SANITY
                              · guarda el pedido en Sanity como "Pendiente de pago"
                              · crea la sesión de Stripe Checkout (1 hora para pagar)
Cliente paga en la página de Stripe (tarjeta, Apple Pay…)
Stripe ──► /pedido/gracias        (solo informa; vacía el carrito si está pagado)
Stripe ──► POST /api/stripe-webhook (firmado: la ÚNICA confirmación fiable)
                              · marca el pedido "Pagado" en Sanity
                              · avisa a n8n → correos a Jose y al cliente
```

- **El precio nunca viene del navegador.** El carrito solo envía qué postre, qué sabor y cuántos. Probado: con el precio manipulado en el navegador, Stripe cobró el real.
- El impuesto va como línea propia en Stripe ("Impuesto sobre ventas (7%)").
- Si el cliente abandona, la sesión caduca y el pedido pasa a **Cancelado**; Jose no recibe nada.
- El webhook es **idempotente**: si Stripe repite un aviso, no se duplica ni el pedido ni el correo.
- Aviso a n8n: mismos campos que el formulario de siempre, más `estado-pago=PAGADO`, `metodo-pago=tarjeta` y `numero-pedido` (`JJ-AAMMDD-XXXX`). Si n8n falla, el webhook responde 500 y Stripe reintenta.

### 5.2 El interruptor `PUBLIC_PAGOS_TARJETA`

| Valor | Lo que ve el cliente en el carrito |
|---|---|
| sin definir / `false` | Solo **"Enviar Pedido"** → n8n, sin cobro (como siempre). `/api/checkout` responde 503 |
| `true` | Solo **"Pagar con tarjeta"** → Stripe. El botón anterior queda oculto como respaldo, y Enter en el formulario lleva al pago |

El carrito se genera al compilar: **cambiar la variable en Netlify exige redesplegar**. Además del interruptor, el pago exige `STRIPE_SECRET_KEY` y `SANITY_API_TOKEN`.

### 5.3 Eventos que escucha el webhook

`checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`, `checkout.session.async_payment_failed`, `charge.refunded`, `charge.refund.updated`.

### 5.4 Reembolsos

Jose reembolsa desde el panel de Stripe (Payments → buscar el número de pedido → Refund). El pedido se actualiza solo:

- **parcial**: conserva su estado y muestra "reembolsado $X";
- **total**: pasa a **Reembolsado**.

Stripe no devuelve su comisión (2,9 % + 30 ¢) al reembolsar. El dinero tarda 5–10 días hábiles en llegar al cliente.

### 5.5 Probar en local

1. En `.env`: claves `sk_test_` del sandbox, `PUBLIC_PAGOS_TARJETA=true` y **`N8N_ORDER_WEBHOOK_URL` vacía** (así no le llega ningún correo a Jose).
2. Reenviar los avisos de Stripe a local con [Stripe CLI](https://github.com/stripe/stripe-cli/releases):
   ```bash
   stripe listen --api-key sk_test_… --forward-to http://localhost:4321/api/stripe-webhook \
     --events checkout.session.completed,checkout.session.expired,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,charge.refunded,charge.refund.updated
   ```
   `stripe listen --api-key sk_test_… --print-secret` da el `whsec_` para `STRIPE_WEBHOOK_SECRET`.
3. `npm run dev`, añadir postres y pagar con la tarjeta de prueba `4242 4242 4242 4242`, cualquier fecha futura y CVC `123`.

**Cuidado:**
- Los pedidos de prueba se guardan en el **Sanity real de Jose** (no hay otro dataset), marcados `[PRUEBA]`. Bórralos al terminar.
- Con `PUBLIC_PAGOS_TARJETA=false`, el botón "Enviar Pedido" llama al **n8n real** (su URL está escrita en `cart.astro`) y **sí le llega el correo a Jose**.

---

## 6. Puesta en producción de los pagos

Cuando Jose tenga su cuenta de Stripe activada en Live (EIN o SSN, cuenta bancaria, descriptor `JJ DESSERTS`) y haya invitado a Raul como *Developer*:

1. **n8n**: exportar el flujo como respaldo. Ajustar los correos para pedidos con `estado-pago=PAGADO` (decir que está pagado, mostrar `numero-pedido`, revisar cómo se pinta la última línea "PAGADO CON TARJETA (Stripe)" del detalle).
2. **Stripe** (cuenta de Jose): elegir métodos de pago (Settings → Payment methods). Crear el webhook hacia `https://jjdesserts.com/api/stripe-webhook` con los **6 eventos** de §5.3.
3. **Netlify** → Site configuration → Environment variables: `STRIPE_SECRET_KEY` (`sk_live_…`), `STRIPE_WEBHOOK_SECRET` (el `whsec_` del paso 2), `SANITY_API_TOKEN`, `N8N_ORDER_WEBHOOK_URL` y `PUBLIC_PAGOS_TARJETA=true`.
4. **Redesplegar** y hacer un pedido real pequeño: comprobar el correo a Jose, el pedido en Studio y un reembolso.
5. Para volver atrás: `PUBLIC_PAGOS_TARJETA=false` y redesplegar.

---

## 7. Deploy

Netlify despliega automáticamente cada push a `main` (build `npm run build`, adaptador de Astro para Netlify). Las variables viven en Netlify, no en el repositorio. Dominio: `jjdesserts.com`.

---

## 8. Pendientes

- [ ] Stripe Live de Jose y puesta en producción (§6)
- [ ] Ajuste de los correos de n8n para pedidos pagados (§6, paso 1)
- [ ] Que el carrito lea el impuesto de Sanity en vez de tener "7 %" fijo
- [ ] Correo al cliente cuando su pedido pase a "Listo" (Sanity → n8n), opcional
- [ ] Comprimir el vídeo del hero
- [ ] Migrar fotos de `/assets` a Sanity

Hecho: catálogo y páginas de producto/categoría, carrito con cantidades y pedido mínimo, pedido por n8n, pago con Stripe Checkout + webhook + pedidos en Sanity, gestión de pedidos en el Studio, reembolsos sincronizados.

---

## 9. Comandos útiles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en http://localhost:4321 |
| `npm run build` | Build de producción (igual que Netlify) |
| `npm run preview` | Sirve el build localmente |
| `npx tsc --noEmit -p .` | Revisa los tipos de TypeScript |

---

## 10. Soporte

Si algo no compila o falla:

1. Comprueba que `.env` tiene valores reales, no los de la plantilla.
2. Borra `node_modules` y vuelve a ejecutar `npm install`.
3. Revisa que el Project ID de Sanity sea `4yoeszbn`.
4. Pagos: mira el log del servidor (líneas `[pagos]`, `[checkout]` y `[webhook]`) y, en Stripe, Developers → Webhooks → intentos de entrega.

Diseño preservado de la v1: paleta naranja (#D54F1B) / crema / negro; tipografías Playfair Display, Dancing Script e Inter.
