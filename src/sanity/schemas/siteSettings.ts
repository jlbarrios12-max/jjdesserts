import { defineType, defineField } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Configuración del Sitio / Site Settings',
  type: 'document',
  // Singleton — only one document of this type should exist
  fields: [
    defineField({
      name: 'heroVideo',
      title: 'Video del banner principal',
      description: 'MP4 optimizado, idealmente menos de 5 MB',
      type: 'file',
      options: { accept: 'video/mp4,video/webm' },
    }),
    defineField({
      name: 'heroPoster',
      title: 'Imagen de respaldo del video (poster)',
      description: 'Se muestra mientras el video carga y como fallback en móviles',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'heroTitleEs',
      title: 'Título Hero (Español)',
      type: 'string',
      initialValue: 'Sabor que enamora',
    }),
    defineField({
      name: 'heroTitleEn',
      title: 'Hero Title (English)',
      type: 'string',
      initialValue: 'A taste that enchants',
    }),
    defineField({
      name: 'heroSubtitleEs',
      title: 'Subtítulo Hero (Español)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'heroSubtitleEn',
      title: 'Hero Subtitle (English)',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'heroCtaEs',
      title: 'Texto botón principal (Español)',
      type: 'string',
      initialValue: 'Ver Menú',
    }),
    defineField({
      name: 'heroCtaEn',
      title: 'Main button text (English)',
      type: 'string',
      initialValue: 'View Menu',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Email de contacto',
      type: 'string',
    }),
    defineField({
      name: 'contactPhone',
      title: 'Teléfono / WhatsApp',
      type: 'string',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
      initialValue: 'https://instagram.com/jj_desserts_different_not_less',
    }),
    defineField({
      name: 'businessAddress',
      title: 'Dirección del negocio',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'salesTaxRate',
      title: 'Tasa de impuesto sobre ventas (decimal, ej: 0.0825 = 8.25%)',
      type: 'number',
      initialValue: 0.0825,
    }),
    defineField({
      name: 'announcementEs',
      title: 'Anuncio top bar (Español)',
      type: 'string',
      initialValue: 'SABOR QUE ENAMORA',
    }),
    defineField({
      name: 'announcementEn',
      title: 'Top bar announcement (English)',
      type: 'string',
      initialValue: 'A TASTE THAT ENCHANTS',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Configuración del Sitio' };
    },
  },
});
