const http = require('http')
const Koa = require('koa')
const koaBody = require('koa-body').koaBody
const koaSend = require('koa-send')
const KoaRouter = require('@koa/router')
const koaCompress = require('koa-compress')

const methods = require('./http-methods')
const { isString, isFunction } = require('../utils/check-type')

const CACHE_MAX_AGE = 48 * 60 * 60 * 1000
const HTML_CACHE_MAX_AGE = 2 * 60 * 60 * 1000

class HttpService {
  constructor (options = {}) {
    const koa = new Koa(options.koa)

    if (options.onerror) koa.onerror = options.onerror
    this.servicePath = options.servicePath

    koa.use(async (ctx, next) => {
      const start = new Date()

      try {
        await next()
      } catch (e) {
        if (e.stack && options.logStackError !== false) {
          Object.defineProperty(e, 'stack', {
            enumerable: true
          })
        }

        ctx.status = parseInt(e.status, 10) || 500
        ctx.body = e
        ctx.app.emit('error', e, ctx)
      } finally {
        ctx.app.emit('afterrequest', new Date() - start, ctx)
      }
    })

    if (options.compress) {
      koa.use(koaCompress({
        filter: contentType => /text|json|javascript/i.test(contentType)
        // level: 9,
        // threshold: 2048,
        // flush: zlib.Z_SYNC_FLUSH
      }))
    }

    koa.use(koaBody({
      patchNode: true,
      formidable: { uploadDir: __dirname },
      ...options.bodyParser
    }))

    const router = new KoaRouter()
    const server = http.createServer(koa.callback())

    this.koa = koa
    this.router = router
    this.httpServer = server
    this.__ready = false
  }

  use (path, middleware) {
    if (isString(path) && isFunction(middleware)) {
      this.router.use(path, middleware)
    } else if (isFunction(path)) {
      this.koa.use(path)
    }
    return this
  }

  useStatic (path, options = {}) {
    function resolvePath (servicePath) {
      if (path.indexOf('/') > 0) path = '/' + path
      if (path.lastIndexOf('/') !== path.length - 1) path += '/'
      if (servicePath) path = '/' + servicePath + path
    }

    function isHandleable (ctx) {
      return (
        ['HEAD', 'GET'].includes(ctx.method) &&
        ctx.body == null &&
        ctx.status === 404 &&
        ctx.path.indexOf(path) === 0
      )
    }

    resolvePath(this.servicePath)

    this.koa.use(async (ctx, next) => {
      await next()

      if (ctx.path + '/' === path) ctx.path += '/'
      if (!isHandleable(ctx)) return

      try {
        const s = ctx.path.substr(path.length) || '/'
        const isHTML = s.toLowerCase().indexOf('.htm') > 0

        const sendOptions = Object.assign(
          {
            maxAge: isHTML
              ? (options.htmlCacheMaxAge ?? HTML_CACHE_MAX_AGE)
              : (options.cacheMaxAge ?? CACHE_MAX_AGE),
            index: 'index.html'
          },
          isString(options) ? { root: options } : options
        )

        await koaSend(ctx, s, sendOptions)
      } catch (err) {
        if (err.status !== 404) {
          throw err
        }
      }
    })

    return this
  }

  listen (port, host = '0.0.0.0') {
    if (this.__ready === false) {
      delete this.__ready

      this.koa.use(this.router.routes())
      this.koa.use(this.router.allowedMethods())
    }

    this.httpServer.listen(port, host)
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
