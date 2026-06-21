import {defineField, defineType} from 'sanity'
import {orderRankField, orderRankOrdering} from '@sanity/orderable-document-list'

export default defineType({
  name: 'photo',
  title: 'Photo',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true, // Enables cropping
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Portrait', value: 'portrait'},
          {title: 'Commercial', value: 'commercial'},
          {title: 'Events', value: 'events'},
          {title: 'Studio', value: 'studio'},
          {title: 'Other', value: 'other'}
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'credit',
      title: 'Credit',
      type: 'string',
      description: 'Photo credit or copyright (e.g. © Haim Bargig)'
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Display in featured gallery'
    }),
    orderRankField({type: 'photo'}),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      category: 'category'
    },
    prepare(selection) {
      const {title, media, category} = selection
      return {
        title,
        subtitle: category ? `Category: ${category}` : '',
        media
      }
    }
  },
  orderings: [orderRankOrdering]
})