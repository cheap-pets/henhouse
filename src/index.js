const { join, parse } = require('path')
const { existsSync, readFileSync } = require('fs')
const stripJsonComments = require('strip-json-comments')

const HttpService = require('./http-service')
const ProxyService = require('./proxy-service')
const methods = require('./http-service/http-methods')
const resolve = require('./utils/resolve-path')

const parseQuery = require('./utils/parse-query')

const HttpException = require('./http-service/http-exception')

const DataTypes = require('./constants/data-types')

function getDefaultModelPath (modelName) {
  return modelName.replace(/([A-Z])/g, '-$1').toLowerCase() + 's'
}

function bindModelMethod (service, modelName, method, middleware) {
  service[method](modelName, middleware)
}

function loadDefaultProxyConfig () {
  let config
  const filePath = join(parse(process.argv[1]).dir, '.henhouserc')
  try {
    if (existsSync(filePath)) {
      const s = readFileSync(filePath, 'utf8')
      config = JSON.parse(stripJsonComments(s)).proxy
    }
  } catch (error) {
    console.error('cannot read config file', '"' + filePath + '"')
  }
  return config
}

class Henhouse {
  constructor (options) {
    let { servicePath, proxy } = options || {}
    if (servicePath) {
      while (servicePath.indexOf('/') === 0) servicePath = servicePath.substr(1)
      while (servicePath.lastIndexOf('/') === servicePath.length - 1) servicePath = servicePath.substr(0, servicePath.length - 1)
      this.servicePath = servicePath
    }
    this.httpService = new HttpService({
      servicePath
    })
    const proxyConfig = proxy || loadDefaultProxyConfig()
    if (proxyConfig) {
      this.proxyPort = proxyConfig.port
      this.proxyService = new ProxyService(proxyConfig.mappings)
    }
    this.models = {}
  }
  define (store, modelName) {
    const args = Array.prototype.slice.call(arguments, 1)
    const model = store.define.apply(store, args)
    model.store = store
    model.path = model.path || getDefaultModelPath(modelName)
    this.models[modelName] = model
    const methods = model.methods || {}
    for (let method in methods) {
      bindModelMethod(this, modelName, method, methods[method])
    }
    return model
  }
  use (middleware) {
    this.httpService.use(middleware)
    return this
  }
  useStatic (path, rootOrOptions) {
    this.httpService.useStatic(path, rootOrOptions)
    return this
  }
  listen (port, proxyPort) {
    this.httpService.listen(port)
    if (this.proxyService) this.proxyService.listen(proxyPort || this.proxyPort)
  }
  close () {
    this.httpService.close()
    if (this.proxyService) this.proxyService.close()
  }
}

methods.forEach(method => {
  Henhouse.prototype[method] = function (pathOrModel, middleware) {
    const model = this.models[pathOrModel]
    const path = resolve((this.servicePath || '') + '/' + (model ? model.path : pathOrModel))
    this.httpService[method](path, async (ctx, next) => {
      parseQuery(ctx)
      await middleware(ctx, next, model)
    })
    if (model && ['get', 'put', 'patch', 'delete'].indexOf(method) >= 0) {
      this.httpService[method](path + '/:id', async (ctx, next) => {
        parseQuery(ctx)
        await middleware(ctx, next, model, ctx.params.id)
      })
    }
    return this
  }
})

Henhouse.DataTypes = DataTypes
Henhouse.HttpException = HttpException

module.exports = Henhouse
