import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'

import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Haim Bargig Portfolio',

  projectId: 'xotjnbwo',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S, context) =>
        S.list()
          .title('Content')
          .items([
            orderableDocumentListDeskItem({type: 'photo', title: 'Photos', S, context}),
            S.documentTypeListItem('video').title('Videos'),
            S.documentTypeListItem('siteSettings').title('Site Settings'),
          ])
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})