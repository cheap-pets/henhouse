const Henhouse = require('../src')

const service = new Henhouse()
service.use(async function (ctx, next) {
  console.log('use1')
  next()
})
service.get('/test-query', async function (ctx, next) {
  ctx.body = ctx.$queryOptions
  next()
})
service.post('/test-body', async function (ctx, next) {
  ctx.body = ctx.$requestBody
  next()
})
service.listen(3000)
