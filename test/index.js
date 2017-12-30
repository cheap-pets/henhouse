const Henhouse = require('../src')

const service = new Henhouse()
service.get('/test-querys', async function (ctx, next) {
  ctx.body = ctx.$query
})
service.get('/test-fields', async function (ctx, next) {
  ctx.body = ctx.$attributes
})
service.post('/test-body', async function (ctx, next) {
  ctx.body = ctx.$requestBody
})
service.listen(3000)
