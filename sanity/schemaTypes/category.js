import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Display name (e.g. "Portraits", "Commercial")',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Used internally — auto-generated from title',
      options: { source: 'title', maxLength: 48 },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'type',
      title: 'Applies to',
      type: 'string',
      options: {
        list: [
          {title: 'Photos', value: 'photo'},
          {title: 'Videos', value: 'video'},
          {title: 'Both', value: 'both'},
        ],
        layout: 'radio'
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Lower number = appears first in filter bar',
      initialValue: 99
    }),
  ],
  preview: {
    select: { title: 'title', type: 'type' },
    prepare({ title, type }) {
      const label = type === 'photo' ? '📷' : type === 'video' ? '🎬' : '📷🎬'
      return { title, subtitle: label }
    }
  },
  orderings: [
    { title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }
  ]
})
