const http = require('http')
const Koa = require('koa')
const KoaRouter = require('koa-router')
const koaBody = require('koa-body')
const koaSend = require('koa-send')
const methods = require('./http-methods')
const { isString } = require('../utils/check-type')

class HttpService {
  constructor (option) {
    const koa = new Koa()
    koa.on('error', (err, ctx) => {
      console.error('server error', err)
    })
    koa.use(async (ctx, next) => {
      const start = new Date()
      try {
        await next()
      } catch (e) {
        ctx.status = parseInt(e.status, 10) || 500
        ctx.body = e
        ctx.app.emit('error', e, ctx)
      } finally {
        const ms = new Date() - start
        console.info(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`)
      }
    })
    koa.use(koaBody({ formidable: { uploadDir: __dirname } }))
    const router = new KoaRouter()
    koa.use(router.routes())
    koa.use(router.allowedMethods())
    const server = http.createServer(koa.callback())
    server.on('close', () => {
      console.info('server closed.')
    })
    this.koa = koa
    this.router = router
    this.httpServer = server
  }
  use (middleware) {
    this.koa.use(middleware)
    return this
  }
  useStatic (path, options) {
    isString(options) && (options = { root: options })
    options.index === undefined && (options.index = 'index.html')
    this.koa.use(async (ctx, next) => {
      let done = false
      if (
        (ctx.method === 'HEAD' || ctx.method === 'GET') &&
        ctx.path.indexOf(path) === 0
      ) {
        try {
          done = await koaSend(ctx, ctx.path, options)
        } catch (err) {
          if (err.status !== 404) {
            throw err
          }
        }
      }
      if (!done) {
        await next()
      }
    })
    return this
  }
  listen (port) {
    this.httpServer.listen(port)
  }
  close () {
    this.httpServer.close()
  }
}

// init router's methods
methods.forEach(method => {
  HttpService.prototype[method] = function (path, middleware) {
    this.router[method](path, middleware)
    return this
  }
})

module.exports = HttpService
