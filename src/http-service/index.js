const http = require('http');
const Koa = require('koa');
const KoaRouter = require('koa-router');
const koaBody = require('koa-body');
const koaSend = require('koa-send');
const methods = require('methods');
const log = require('../log');

class HttpService {
  constructor(option) {
    this.$koa = new Koa();
    this.$koa.on('error', err => {
      log.error('server error', err);
    });

    //log the timespan of each request
    this.$koa.use(async (ctx, next) => {
      const start = new Date();
      try {
        await next();
      } catch (e) {
        ctx.status = parseInt(e.status, 10) || 500;
        ctx.body = e;
        ctx.app.emit('error', e, ctx);
      } finally {
        const ms = new Date() - start;
        log.info(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);
      }
    });

    //process options
    if (option && option.dir) {
      this.static(option.dir);
    }
  }
  static (path, options) {
    if (!options && path.root) {
      options = path;
      path = '/';
    }
    options = options || {};
    if (options.index !== false) options.index = options.index || 'index.html';
    this.$koa.use(async (ctx, next) => {
      let done = false;
      if ((ctx.method === 'HEAD' || ctx.method === 'GET') && ctx.path.indexOf(path) === 0) {
        try {
          done = await koaSend(ctx, ctx.path, options);
        } catch (err) {
          if (err.status !== 404) {
            throw err;
          }
        }
      }
      if (!done) {
        await next();
      }
    });
    return this;
  }
  listen (port) {
    if (!this.$server) {
      this.$server = http.createServer(this.$koa.callback());
      this.$server.on('close', () => {
        log.info('server closed.');
      });
    }
    this.$server.listen(port);
  }
  close () {
    this.$server.close();
  }
}

//init router's methods
methods.forEach(method => {
  HttpService.prototype[method] = function () {
    if (!this.$router) {
      this.$router = new KoaRouter();
      this.$koa.use(koaBody({ formidable: { uploadDir: __dirname } }));
      this.$koa.use(this.$router.routes());
      this.$koa.use(this.$router.allowedMethods());
    }
    const len = arguments.length;
    const path = arguments[0];
    const handler = arguments[len - 1];
    if (typeof handler === 'function') {
      this.$router[method].apply(this.$router, arguments);
    } else {
      this.$router[method](path, (ctx) => {
        ctx.body = handler;
      });
    }
    return this;
  };
});

module.exports = HttpService;
