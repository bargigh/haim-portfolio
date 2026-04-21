import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Site Title',
      type: 'string',
      initialValue: 'Haim Bargig - Photographer & Cinematographer'
    }),
    defineField({
      name: 'description',
      title: 'Site Description',
      type: 'text',
      rows: 3,
      initialValue: 'Professional photographer and cinematographer specializing in visual storytelling.'
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero Title',
      type: 'string',
      initialValue: 'Visual Storytelling'
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'string',
      initialValue: 'Photographer & Cinematographer'
    }),
    defineField({
      name: 'aboutText',
      title: 'About Text',
      type: 'array',
      of: [{type: 'block'}],
      initialValue: [
        {
          _type: 'block',
          children: [{
            _type: 'span',
            text: 'Professional photographer and cinematographer with a passion for visual storytelling. Specializing in portraits, commercial photography, and cinematic productions.'
          }]
        },
        {
          _type: 'block',
          children: [{
            _type: 'span',
            text: 'Studio space available for rent by hour or day for fellow artists and creators.'
          }]
        }
      ]
    }),
    defineField({
      name: 'aboutImage',
      title: 'About Image',
      type: 'image',
      options: {
        hotspot: true,
      }
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'email',
      initialValue: 'bargigh@gmail.com'
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        {
          name: 'instagram',
          title: 'Instagram',
          type: 'url'
        },
        {
          name: 'youtube',
          title: 'YouTube',
          type: 'url'
        },
        {
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url'
        },
        {
          name: 'website',
          title: 'Website',
          type: 'url'
        }
      ]
    }),
    defineField({
      name: 'studioInfo',
      title: 'Studio Information',
      type: 'object',
      fields: [
        {
          name: 'available',
          title: 'Studio Available for Rent',
          type: 'boolean',
          initialValue: true
        },
        {
          name: 'hourlyRate',
          title: 'Hourly Rate',
          type: 'number'
        },
        {
          name: 'dailyRate',
          title: 'Daily Rate',
          type: 'number'
        },
        {
          name: 'description',
          title: 'Studio Description',
          type: 'text',
          rows: 3
        }
      ]
    })
  ],
  preview: {
    prepare() {
      return {
        title: 'Site Settings'
      }
    }
  }
})