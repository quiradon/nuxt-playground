import { serverQueryContent } from '#content/server'
import { SitemapStream, streamToPromise } from 'sitemap'



export default defineEventHandler(async (event) => {
  // Fetch all documents
  const docs = await serverQueryContent(event).find()
  const sitemap = new SitemapStream({
    hostname: 'https://rpg.arkanus.app'
  })

  sitemap.write({
    url: '/',
    changefreq: 'monthly',
    priority: 1,
    // adicione a verversão alternativa da pagina 
    links: [
      { lang: 'en', url: '/' },
      { lang: 'pt', url: '/pt' },
      { lang: 'pt-BR', url: '/pt'},
      { lang: 'x-default', url: '/' }
    ]
  })






  for (const doc of docs) {
    sitemap.write({
      url: doc._path,
      changefreq: 'monthly'
    })
  }




  sitemap.end()

  return streamToPromise(sitemap)
})
