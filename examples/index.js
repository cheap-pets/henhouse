const { HttpService, ProxyService, HttpException } = require('../src');
const { resolve } = require('path');

const httpServive = new HttpService();
httpServive
  .get('/a', async (ctx, next) => {
    ctx.body = 'ok';
    throw new HttpException(405, 'oops...');
  })
  .get('/close', async (ctx, next) => {
    ctx.body = 'closed';
    httpServive.close();
  })
  .listen(3000);

const mockService = new HttpService();
mockService
  .get('/a', {
    a: 'hello'
  })
  .get('/b', {
    b: 'world'
  })
  .listen(3001);

const rootDir = resolve(__dirname, 'static', 'root');
const otherDir = resolve(__dirname, 'static', 'others');
const staticService = new HttpService();
staticService
  .addStatic({ root: rootDir })
  .addStatic('/s1', { root: otherDir })
  .addStatic('/test')
  .listen(3002);

const proxyService = new ProxyService({
  '/router': 'http://localhost:3000/a',
  '/mock': 'http://localhost:3001',
  '/static': 'http://localhost:3002'
});
proxyService.listen(8888);
