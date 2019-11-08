const Henhouse = require('../src')
const { resolve, parse } = require('path')

const service = new Henhouse({
  servicePath: 'yo'
})

service
  .use(async function (ctx, next) {
    await next()
    if (!ctx.body) ctx.body = ctx.request.url
  })
  .useStatic(
    '/',
    parse(__dirname).base === 'src' ? resolve(__dirname, '..', 'dist', 'web-content') : resolve(__dirname, 'web-content')
  )
  .get('/', async function (ctx, next) {
    ctx.body = 'root'
  })
  .get('/yo', async function (ctx, next) {
    ctx.body = 'bro'
  })
  .get('/test-query', async function (ctx, next) {
    ctx.body = ctx.$fields
  })
  .post('/test-body', async function (ctx, next) {
    ctx.body = ctx.$requestBody
  })
  .listen(3000, '0.0.0.0')
