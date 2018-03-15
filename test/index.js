const Henhouse = require('../src')

const service = new Henhouse()
service.use(async function (ctx, next) {
  await next()
  if (!ctx.body) ctx.body = ctx.request.url
})
service.get('/test-query', async function (ctx, next) {
  ctx.body = ctx.$fields
  next()
})
service.post('/test-body', async function (ctx, next) {
  ctx.body = ctx.$requestBody
  next()
})
service.listen(3000)
