const Henhouse = require('../src')
const { resolve, parse } = require('path')

const service = new Henhouse({
  servicePath: 'yo'
})

const base = parse(__dirname)

service
  .use(async function (ctx, next) {
    await next()
    if (!ctx.body) ctx.body = ctx.request.url
  })
  .useStatic(
    '/',
    parse(__dirname) === 'src' ? resolve(__dirname, '..', 'dist', 'web-content') : resolve(__dirname, 'web-content')
  )
  .get('/yo', async function (ctx, next) {
    ctx.body = 'bro'
  })
  .get('/test-query', async function (ctx, next) {
    ctx.body = ctx.$fields
  })
  .post('/test-body', async function (ctx, next) {
    ctx.body = ctx.$requestBody
  })
service.listen(3000)
