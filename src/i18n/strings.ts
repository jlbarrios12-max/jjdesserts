// UI strings only — content (products, hero text, etc.) comes from Sanity

export const strings = {
  es: {
    nav: {
      home: 'Inicio',
      menu: 'Menú',
      about: 'Nosotros',
      contact: 'Contacto',
    },
    hero: {
      eyebrow: 'POSTRES CASEROS',
      ctaPrimary: 'Ver Menú',
      ctaSecondary: 'Contactar',
    },
    menu: {
      title: 'Nuestros Postres',
      subtitle: 'Hechos a mano con los mejores ingredientes',
      filterAll: 'Todos',
      addToCart: 'Agregar',
      outOfStock: 'Agotado',
    },
    cart: {
      title: 'Tu Carrito',
      empty: 'Tu carrito está vacío',
      subtotal: 'Subtotal',
      tax: 'Impuesto',
      total: 'Total',
      checkout: 'Pagar ahora',
      continueShopping: 'Seguir comprando',
      remove: 'Quitar',
    },
    footer: {
      followUs: 'Síguenos',
      explore: 'Explora',
      contactUs: 'Contáctanos',
      tagline: 'Sabor que enamora',
      rights: 'Todos los derechos reservados',
    },
  },
  en: {
    nav: {
      home: 'Home',
      menu: 'Menu',
      about: 'About',
      contact: 'Contact',
    },
    hero: {
      eyebrow: 'HOMEMADE DESSERTS',
      ctaPrimary: 'View Menu',
      ctaSecondary: 'Contact',
    },
    menu: {
      title: 'Our Desserts',
      subtitle: 'Handmade with the finest ingredients',
      filterAll: 'All',
      addToCart: 'Add',
      outOfStock: 'Out of stock',
    },
    cart: {
      title: 'Your Cart',
      empty: 'Your cart is empty',
      subtotal: 'Subtotal',
      tax: 'Tax',
      total: 'Total',
      checkout: 'Checkout',
      continueShopping: 'Continue shopping',
      remove: 'Remove',
    },
    footer: {
      followUs: 'Follow us',
      explore: 'Explore',
      contactUs: 'Contact us',
      tagline: 'A taste that enchants',
      rights: 'All rights reserved',
    },
  },
} as const;

export type Locale = keyof typeof strings;
export type Strings = typeof strings.es;

export function getStrings(locale: string): Strings {
  return (strings as Record<string, Strings>)[locale] ?? strings.es;
}
