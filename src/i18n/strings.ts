// UI strings only — content (products, hero text, etc.) comes from Sanity

export const strings = {
  es: {
    nav: {
      home: 'Inicio',
      menu: 'Menu',
      about: 'Nosotros',
      contact: 'Contacto',
    },
    hero: {
      eyebrow: 'POSTRES CASEROS',
      ctaPrimary: 'Ver Menu',
      ctaSecondary: 'Contactar',
    },
    menu: {
      title: 'Nuestros Postres',
      subtitle: 'Hechos a mano con los mejores ingredientes',
      filterAll: 'Todos',
      addToCart: 'Agregar',
      outOfStock: 'Agotado',
      selectSize: 'Elige tu sabor',
      allergensLabel: 'Alergenos',
    },
    allergens: {
      dairy:     'Lacteos',
      eggs:      'Huevos',
      gluten:    'Gluten',
      peanuts:   'Mani',
      treeNuts:  'Nueces',
      soy:       'Soya',
      sesame:    'Sesamo',
      fish:      'Pescado',
      shellfish: 'Mariscos',
    },
    cart: {
      title: 'Tu Carrito',
      empty: 'Tu carrito esta vacio',
      subtotal: 'Subtotal',
      tax: 'Impuesto',
      total: 'Total',
      checkout: 'Pagar ahora',
      continueShopping: 'Seguir comprando',
      remove: 'Quitar',
    },
    cta: {
      title:    'ANTOJO DE ALGO DULCE?',
      subtitle: 'Haz tu pedido ahora',
      btn:      'Ver Menu',
    },
    values: {
      quality:  { line1: 'INGREDIENTES',  line2: 'DE CALIDAD',        text: 'Utilizamos los mejores ingredientes para garantizar el sabor perfecto.' },
      passion:  { line1: 'HECHO CON',     line2: 'PASION',            text: 'Cada postre es hecho en casa con dedicacion y amor.' },
      occasion: { line1: 'PERFECTO PARA', line2: 'CUALQUIER OCASION', text: 'Cumpleanos, reuniones o simplemente porque si. Nosotros te ayudamos.' },
    },
    newsletter: {
      title:       'SUSCRIBETE A NUESTROS CORREOS',
      subtitle:    'Recibe novedades, promociones y mas postres que te encantaran.',
      placeholder: 'Tu correo electronico',
      btn:         'Suscribirme',
    },
    footer: {
      followUs:  'Siguenos',
      explore:   'Explora',
      contactUs: 'Contactanos',
      tagline:   'Sabor que enamora',
      rights:    'Todos los derechos reservados',
    },
  },

  en: {
    nav: {
      home:    'Home',
      menu:    'Menu',
      about:   'About',
      contact: 'Contact',
    },
    hero: {
      eyebrow:      'HOMEMADE DESSERTS',
      ctaPrimary:   'View Menu',
      ctaSecondary: 'Contact',
    },
    menu: {
      title:          'Our Desserts',
      subtitle:       'Handmade with the finest ingredients',
      filterAll:      'All',
      addToCart:      'Add',
      outOfStock:     'Out of stock',
      selectSize:     'Choose your flavor',
      allergensLabel: 'Allergens',
    },
    allergens: {
      dairy:     'Dairy',
      eggs:      'Eggs',
      gluten:    'Gluten',
      peanuts:   'Peanuts',
      treeNuts:  'Tree Nuts',
      soy:       'Soy',
      sesame:    'Sesame',
      fish:      'Fish',
      shellfish: 'Shellfish',
    },
    cart: {
      title:            'Your Cart',
      empty:            'Your cart is empty',
      subtotal:         'Subtotal',
      tax:              'Tax',
      total:            'Total',
      checkout:         'Checkout',
      continueShopping: 'Continue shopping',
      remove:           'Remove',
    },
    cta: {
      title:    'CRAVING SOMETHING SWEET?',
      subtitle: 'Order now',
      btn:      'View Menu',
    },
    values: {
      quality:  { line1: 'QUALITY',     line2: 'INGREDIENTS',  text: 'We use the finest ingredients to guarantee the perfect flavor.' },
      passion:  { line1: 'MADE WITH',   line2: 'PASSION',      text: 'Each dessert is handmade at home with dedication and love.' },
      occasion: { line1: 'PERFECT FOR', line2: 'ANY OCCASION', text: 'Birthdays, gatherings, or just because. We have got you covered.' },
    },
    newsletter: {
      title:       'SUBSCRIBE TO OUR EMAILS',
      subtitle:    'Get news, promotions and more desserts you will love.',
      placeholder: 'Your email address',
      btn:         'Subscribe',
    },
    footer: {
      followUs:  'Follow us',
      explore:   'Explore',
      contactUs: 'Contact us',
      tagline:   'A taste that enchants',
      rights:    'All rights reserved',
    },
  },
} as const;

export type Locale = keyof typeof strings;
export type Strings = typeof strings.es;

export function getStrings(locale: string): Strings {
  if (locale === 'en') return strings.en as unknown as Strings;
  return strings.es;
}
