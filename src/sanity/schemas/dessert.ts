import { defineType, defineField } from 'sanity';

export const dessert = defineType({
  name: 'dessert',
  title: 'Postre / Dessert',
  type: 'document',
  fields: [
    defineField({
      name: 'nameEs',
      title: 'Nombre (Español)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'nameEn',
      title: 'Name (English)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: { source: 'nameEs', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoría / Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'descriptionEs',
      title: 'Descripción (Español)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'descriptionEn',
      title: 'Description (English)',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'price',
      title: 'Precio base (USD)',
      type: 'number',
      description: 'Precio cuando no hay tamaños. Si defines tamaños abajo, este campo se ignora.',
      validation: (Rule) => Rule.positive(),
    }),
    defineField({
      name: 'sizes',
      title: 'Tamaños / Sizes',
      type: 'array',
      description: 'Opcional. Si agregas tamaños, cada uno tendrá su propio precio y reemplazará el precio base.',
      of: [
        {
          type: 'object',
          title: 'Tamaño',
          fields: [
            defineField({
              name: 'labelEs',
              title: 'Nombre del tamaño (Español)',
              type: 'string',
              description: 'Ej: "6 porciones", "Torta entera", "Individual"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'labelEn',
              title: 'Size name (English)',
              type: 'string',
              description: 'E.g. "6 servings", "Whole cake", "Individual"',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'price',
              title: 'Precio (USD)',
              type: 'number',
              validation: (Rule) => Rule.required().positive(),
            }),
          ],
          preview: {
            select: { title: 'labelEs', subtitle: 'price' },
            prepare({ title, subtitle }) {
              return { title, subtitle: subtitle ? `$${subtitle.toFixed(2)}` : '' };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'allergens',
      title: 'Alérgenos / Allergens',
      type: 'array',
      description: 'Selecciona todos los alérgenos presentes en este postre.',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: '🥛 Lácteos / Dairy',       value: 'dairy' },
          { title: '🥚 Huevos / Eggs',          value: 'eggs' },
          { title: '🌾 Gluten / Gluten',        value: 'gluten' },
          { title: '🥜 Maní / Peanuts',         value: 'peanuts' },
          { title: '🌰 Nueces / Tree Nuts',     value: 'treeNuts' },
          { title: '🫘 Soya / Soy',             value: 'soy' },
          { title: '🌿 Sésamo / Sesame',        value: 'sesame' },
          { title: '🐟 Pescado / Fish',         value: 'fish' },
          { title: '🦐 Mariscos / Shellfish',   value: 'shellfish' },
        ],
        layout: 'grid',
      },
    }),
    defineField({
      name: 'mainImage',
      title: 'Foto principal / Main photo',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'gallery',
      title: 'Galería / Gallery (fotos adicionales)',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'available',
      title: 'Disponible / Available',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'featured',
      title: 'Destacado en home / Featured on home',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Orden / Sort order',
      type: 'number',
      description: 'Lower numbers appear first',
      initialValue: 100,
    }),
  ],
  preview: {
    select: {
      title: 'nameEs',
      subtitle: 'price',
      media: 'mainImage',
    },
    prepare({ title, subtitle, media }) {
      const priceLabel = subtitle ? `$${subtitle.toFixed(2)} USD` : 'Ver tamaños';
      return { title, subtitle: priceLabel, media };
    },
  },
});
