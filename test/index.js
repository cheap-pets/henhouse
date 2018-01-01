const Henhouse = require('../src')

const service = new Henhouse()
service.get('/test-query', async function (ctx, next) {
  ctx.body = ctx.$queryOptions
})
service.post('/test-body', async function (ctx, next) {
  ctx.body = ctx.$requestBody
})
service.listen(3000)
