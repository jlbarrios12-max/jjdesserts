import { defineType, defineField } from 'sanity';

export const dessert = defineType({
  name: 'dessert',
  title: 'Postre / Dessert',
  type: 'document',
  fields: [
    defineField({ name: 'nameEs', title: 'Nombre (Espanol)', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'nameEn', title: 'Name (English)', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'URL Slug', type: 'slug', options: { source: 'nameEs', maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'category', title: 'Categoria', type: 'reference', to: [{ type: 'category' }], validation: (Rule) => Rule.required() }),
    defineField({ name: 'descriptionEs', title: 'Descripcion (Espanol)', type: 'text', rows: 3 }),
    defineField({ name: 'descriptionEn', title: 'Description (English)', type: 'text', rows: 3 }),
    defineField({ name: 'shortDescriptionEs', title: 'Descripcion corta - Destacados (Espanol)', type: 'text', rows: 2, description: 'Texto breve que aparece en las tarjetas de Destacados en la home. Maximo ~120 caracteres.', validation: (Rule) => Rule.max(160) }),
    defineField({ name: 'shortDescriptionEn', title: 'Short description - Featured (English)', type: 'text', rows: 2, description: 'Short text shown on Featured cards on the home page. Max ~120 characters.', validation: (Rule) => Rule.max(160) }),
    defineField({ name: 'price', title: 'Precio base (USD)', type: 'number', validation: (Rule) => Rule.positive() }),
    defineField({
      name: 'sizes',
      title: 'Sabores / Flavors',
      type: 'array',
      of: [{
        type: 'object',
        title: 'Sabor / Flavor',
        fields: [
          defineField({ name: 'labelEs', title: 'Nombre del sabor (Espanol)', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'labelEn', title: 'Flavor name (English)', type: 'string', validation: (Rule) => Rule.required() }),
          defineField({ name: 'price', title: 'Precio (USD)', type: 'number', validation: (Rule) => Rule.required().positive() }),
        ],
        preview: { select: { title: 'labelEs', subtitle: 'price' } },
      }],
    }),
    defineField({ name: 'allergens', title: 'Alergenos', type: 'array', of: [{ type: 'string' }], options: { list: [
      { title: 'Lacteos', value: 'dairy' }, { title: 'Huevos', value: 'eggs' },
      { title: 'Gluten', value: 'gluten' }, { title: 'Mani', value: 'peanuts' },
      { title: 'Nueces', value: 'treeNuts' }, { title: 'Soya', value: 'soy' },
      { title: 'Sesamo', value: 'sesame' }, { title: 'Pescado', value: 'fish' },
      { title: 'Mariscos', value: 'shellfish' },
    ]}}),
    defineField({ name: 'mainImage', title: 'Imagen principal', type: 'image', options: { hotspot: true }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'gallery', title: 'Galeria', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'available', title: 'Disponible', type: 'boolean', initialValue: true }),
    defineField({ name: 'featured', title: 'Destacado', type: 'boolean', initialValue: false }),
    defineField({ name: 'sortOrder', title: 'Orden', type: 'number', initialValue: 99 }),
  ],
  preview: {
    select: { title: 'nameEs', media: 'mainImage' },
  },
});
