import { defineType, defineField } from 'sanity';

export const category = defineType({
  name: 'category',
  title: 'Categoría / Category',
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
      options: { source: 'nameEs', maxLength: 64 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sortOrder',
      title: 'Orden / Sort order',
      type: 'number',
      initialValue: 100,
    }),
  ],
  preview: {
    select: { title: 'nameEs', subtitle: 'nameEn' },
  },
});
