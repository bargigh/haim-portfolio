import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'video',
  title: 'Video',
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
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      validation: Rule => Rule.required().uri({
        scheme: ['http', 'https']
      })
    }),
    defineField({
      name: 'customThumbnail',
      title: 'Custom Thumbnail',
      type: 'image',
      description: 'Optional: Upload a custom thumbnail instead of using YouTube default',
      options: {
        hotspot: true,
      }
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
          {title: 'Commercial', value: 'commercial'},
          {title: 'Documentary', value: 'documentary'},
          {title: 'Music Video', value: 'music'},
          {title: 'Corporate', value: 'corporate'},
          {title: 'Wedding', value: 'wedding'},
          {title: 'Event', value: 'event'},
          {title: 'Other', value: 'other'}
        ]
      }
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Display in featured gallery'
    }),
    defineField({
      name: 'orderRank',
      title: 'Order',
      type: 'string',
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'customThumbnail',
      category: 'category',
      youtubeUrl: 'youtubeUrl'
    },
    prepare(selection) {
      const {title, media, category, youtubeUrl} = selection
      
      // Extract YouTube video ID for thumbnail if no custom thumbnail
      const getYouTubeId = (url) => {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        const match = url?.match(regex)
        return match ? match[1] : null
      }
      
      const videoId = getYouTubeId(youtubeUrl)
      const youtubeThumb = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null
      
      return {
        title,
        subtitle: category ? `Category: ${category}` : '',
        media: media || youtubeThumb
      }
    }
  },
  orderings: [
    {
      title: 'Manual order',
      name: 'manualOrder',
      by: [
        {field: 'orderRank', direction: 'asc'}
      ]
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [
        {field: 'title', direction: 'asc'}
      ]
    }
  ]
})