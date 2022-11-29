const path = require('path')
const axios = require('axios')
const Henhouse = require('../src')
// const { resolve, parse } = require('path')

const service = new Henhouse({
  servicePath: 'yo',
  koa: {
    proxy: true
  }
})

service
  .use(async function (ctx, next) {
    await next()
    if (!ctx.body) ctx.body = ctx.request.url
  })
  .useStatic(
    '/',
    path.parse(__dirname).base === 'src'
      ? path.resolve(__dirname, '..', 'dist', 'web-content')
      : path.resolve(__dirname, 'web-content')
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
    console.log(ctx.request.body)
    ctx.body = ctx.request.body // ctx.$requestBody
  })
  .listen(3000, '0.0.0.0')

axios({
  method: 'post',
  url: 'http://127.0.0.1:3000/yo/test-body',
  data: 'a=123'
}).then(res => {
  console.log(res)
})
