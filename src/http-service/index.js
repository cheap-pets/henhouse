const http = require('http')
const Koa = require('koa')
const KoaRouter = require('koa-router')
const koaBody = require('koa-body')
const koaSend = require('koa-send')
const methods = require('./http-methods')
const { isString } = require('../utils/check-type')

class HttpService {
  constructor (options) {
    options = options || {}
    this.servicePath = options.servicePath
    const koa = new Koa()
    // koa.on('error', (err, ctx) => {
    //   console.error('server error', err)
    // })
    koa.use(async (ctx, next) => {
      const start = new Date()
      try {
        await next()
      } catch (e) {
        ctx.status = parseInt(e.status, 10) || 500
        if (e.stack && options.logStackError !== false) {
          Object.defineProperty(e, 'stack', {
            enumerable: true
          })
        }
        ctx.body = e
        ctx.app.emit('error', e, ctx)
      } finally {
        const ms = new Date() - start
        ctx.app.emit('afterrequest', ms, ctx)
        // console.info(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`)
      }
    })
    koa.use(koaBody({ formidable: { uploadDir: __dirname } }))
    const router = new KoaRouter()
    const server = http.createServer(koa.callback())
    // server.on('close', () => {
    //   console.info('server closed.')
    // })
    this.koa = koa
    this.router = router
    this.httpServer = server
    this.__ready = false
  }
  use (middleware) {
    this.koa.use(middleware)
    return this
  }
  useStatic (path, options) {
    if (path.indexOf('/') > 0) path = '/' + path
    if (path.lastIndexOf('/') !== path.length - 1) path += '/'
    if (this.servicePath) path = '/' + this.servicePath + path
    isString(options) && (options = { root: options })
    options.index === undefined && (options.index = 'index.html')
    this.koa.use(async (ctx, next) => {
      let done = false
      const thisPath = ctx.path
      if (
        (ctx.method === 'HEAD' || ctx.method === 'GET') &&
        (thisPath.indexOf(path) === 0 || thisPath + '/' === path)
      ) {
        try {
          const s = this.servicePath ? ctx.path.substr(this.servicePath.length + 1) : ctx.path
          done = await koaSend(ctx, s, options)
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
    if (this.__ready === false) {
      delete this.__ready
      this.koa.use(this.router.routes())
      this.koa.use(this.router.allowedMethods())
    }
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
