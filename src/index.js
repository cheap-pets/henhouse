const HttpService = require('./http-service')
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

class Henhouse {
  constructor (options) {
    options = options || {}
    this.httpService = new HttpService()
    this.servicePath = options.servicePath
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
    path = resolve((this.servicePath || '') + '/' + path)
    this.httpService.useStatic(path, rootOrOptions)
    return this
  }
  listen (port) {
    this.httpService.listen(port)
  }
  close () {
    this.httpService.close()
  }
}

methods.forEach(method => {
  Henhouse.prototype[method] = function (pathOrModel, middleware) {
    const model = this.models[pathOrModel]
    const path = resolve(
      (this.servicePath || '') + '/' + (model ? model.path : pathOrModel)
    )
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
