# JJ Desserts — Web v2

Sitio web bilingüe (ES/EN) con catálogo dinámico, panel de admin (Sanity), y pagos online (Stripe).

**Stack:** Astro + Sanity CMS + Stripe + Netlify

---

## 1. Estructura del proyecto

```
JJDesserts/
├── _legacy/                 # Prototipo HTML viejo (referencia, no se toca)
├── assets/                  # Fotos y video que sube Raul (placeholders iniciales)
├── public/                  # Archivos estáticos servidos directamente
├── src/
│   ├── components/          # Componentes Astro (Header, Hero, Footer, Logo, TopBar)
│   ├── i18n/                # Strings de UI ES/EN
│   ├── layouts/             # BaseLayout.astro (wrapper común)
│   ├── pages/               # Rutas del sitio
│   │   ├── index.astro      # / (home en español, default)
│   │   ├── menu/            # /menu
│   │   └── en/              # versión inglesa (/en/, /en/menu/)
│   ├── sanity/
│   │   ├── client.ts        # Cliente de lectura/escritura de Sanity
│   │   ├── queries.ts       # Queries GROQ
│   │   ├── types.ts         # TypeScript types
│   │   └── schemas/         # Definición del modelo de contenido
│   │       ├── dessert.ts
│   │       ├── category.ts
│   │       ├── siteSettings.ts
│   │       └── order.ts
│   └── styles/global.css    # Estilos globales (palette + componentes)
├── astro.config.mjs         # Configuración de Astro + i18n + Sanity + Netlify
├── sanity.config.ts         # Configuración de Sanity Studio
├── package.json
├── .env.example             # Plantilla — copia a .env y rellena
└── README.md                # Este archivo
```

---

## 2. Setup inicial (paso a paso)

### 2.1 Instalar Node.js

Si no lo tienes, descarga Node 20 LTS desde https://nodejs.org

Verifica:
```bash
node --version   # debe decir v20.x.x o más
npm --version
```

### 2.2 Instalar dependencias del proyecto

Abre una terminal en `C:\Users\rvill\Documents\JJDesserts\` y corre:

```bash
npm install
```

Esto descarga Astro, Sanity, Stripe y todas las dependencias (~1-2 minutos).

### 2.3 Crear cuenta de Sanity (bajo nombre del cliente)

> **Importante:** la cuenta debe ser de JJ Desserts, no de Flowverge. Después tú entras como colaborador.

1. **Cliente** entra a https://www.sanity.io/ y crea cuenta con su email
2. **Cliente** crea un nuevo proyecto: "JJ Desserts"
3. **Cliente** te invita como **Administrator** desde Settings → Members
4. Copia el **Project ID** del dashboard (se ve algo como `abc12def`)

### 2.4 Crear cuenta de Stripe (bajo nombre del cliente)

1. **Cliente** entra a https://dashboard.stripe.com/register y crea cuenta
2. Llena datos del negocio (nombre legal, EIN o SSN si es sole proprietor, cuenta bancaria)
3. Te invita como **Developer** desde Settings → Team
4. En el dashboard de Stripe en modo **Test**, copia:
   - **Publishable key** (empieza con `pk_test_...`)
   - **Secret key** (empieza con `sk_test_...`)

> **Importante:** Empezamos en modo **TEST**. Solo se cambia a **LIVE** cuando ya estamos listos para vender de verdad.

### 2.5 Crear cuenta de Netlify (bajo nombre del cliente)

1. **Cliente** entra a https://app.netlify.com/signup
2. Conecta su GitHub o sube el sitio directo
3. Te invita como colaborador

### 2.6 Configurar variables de entorno

Copia `.env.example` a `.env`:

```bash
cp .env.example .env
```

Edita `.env` y rellena con los valores reales que copiaste:

```env
PUBLIC_SANITY_PROJECT_ID=abc12def
PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=...     # creas un token en Sanity → Settings → API → Tokens

PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   # se genera al configurar el webhook (paso 4)

PUBLIC_SITE_URL=http://localhost:4321
SALES_TAX_RATE=0.0825
```

---

## 3. Correr el sitio en local

```bash
npm run dev
```

Se abre en http://localhost:4321

- `/` y `/menu` → versión en español
- `/en/` y `/en/menu` → versión en inglés
- `/studio` → panel de admin de Sanity (la dueña entra aquí)

> **Tip:** Si Sanity todavía no tiene contenido, las páginas se ven vacías o con mensaje "Aún no hay postres". Es normal. Agrega contenido en `/studio` y se actualiza automáticamente.

---

## 4. Cómo el cliente sube productos

La dueña entra a `tudominio.com/studio` (o `localhost:4321/studio` en desarrollo) y verá tres secciones:

1. **Configuración del Sitio** (singleton, se llena una sola vez):
   - Sube el video del hero (MP4, idealmente menos de 5 MB)
   - Una imagen de respaldo (poster)
   - Textos del hero en ES y EN
   - Contacto, redes, dirección, sales tax rate
2. **Categoría / Category**: ella crea las categorías primero (Cheesecakes, Cupcakes, etc.)
3. **Postre / Dessert**: para cada postre llena nombre ES/EN, descripción ES/EN, precio en USD, foto principal, galería opcional, categoría, disponible, destacado

Después le da **Publish** y aparece en el sitio en cuestión de segundos.

---

## 5. Deploy a Netlify (cuando esté listo)

1. Sube el código a un repo de GitHub (cuenta del cliente, tú como colaborador)
2. En Netlify: New site → Import from Git → conecta el repo
3. Build settings se autodetectan (Astro adapter). Si te pregunta:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. En **Site settings → Environment variables** agrega todas las variables del `.env`
5. Deploy

**Dominio custom:** en Netlify → Domain management → Add custom domain → `jjdesserts.com`. Le das al cliente las instrucciones de DNS para apuntar el dominio a Netlify.

---

## 6. Próximos pasos pendientes (siguiente sesión)

- [ ] Página de producto individual `/menu/[slug]` con galería completa
- [ ] Página del carrito completa `/cart` con editar cantidades y eliminar
- [ ] Integración de Stripe Checkout (Netlify Function)
- [ ] Webhook de Stripe → guardar orden en Sanity
- [ ] Email de confirmación al cliente
- [ ] Comprimir video del hero (cuando lo subas)
- [ ] Migrar fotos de `/assets` a Sanity como contenido inicial

---

## 7. Comandos útiles

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Servir el build localmente para probar |

---

## 8. Soporte

Si algo no compila o falla:
1. Asegúrate que `.env` tiene los valores reales (no los placeholders)
2. Borra `node_modules` y `npm install` de nuevo
3. Revisa que `Project ID` de Sanity sea correcto

Diseño preservado del v1: paleta naranja (#D54F1B) / cream / black, tipografías Playfair Display + Dancing Script + Inter.
