# henhouse
tool kits for building simple http services, based on koa &amp; http-proxy

## Installation

Install using [npm](https://www.npmjs.org/):

```sh
npm install henhouse
```

## API Reference

### henhouse
import module
```javascript
const henhouse = require('henhouse')
```
or :
```javascript
const { HttpService, ProxyService, HttpException } = require('henhouse')
```

### HttpService

#### new HttpService(options)
create a new http service
```javascript
const myHttpService = new HttpService(options)
```

#### listen
listen at a specified port
```javascript
myHttpService.listen(3000)
```

#### close
terminate listening
```javascript
myHttpService.close()
```

#### get | put | post | patch | delete
* Match URL patterns to callback functions
```javascript
myHttpService
  .get('/foo', async (ctx, next) => {
    ctx.body = 'foo';
  })
  .post('/foo', async (ctx, next) => {
    ctx.body = `Body: ${ JSON.stringify(ctx.request.body) }`;
  })
  .get('/bar/:id', async (ctx, next) => {
    ctx.body = 'bar: ' + this.params.id;
  })
  .listen(3000)
```

* Match URL patterns to a json data _( perhaps make a mock server ? )_
```javascript
myHttpService
  .get('/foo', {
    name: 'foo'
  })
  .get('/b', {
    name: 'bar'
  })
  .listen(3000)
```

#### static
 serving static files
```javascript
const { resolve } = require('path');

const myHttpService = new HttpService();
myHttpService
  .static({ root: resolve(__dirname, 'static-root') })
  .static('/foo', { root: resolve(__dirname, 'static-foo') })
  .static('/bar') // __dirname/bar
  .listen(3000)
```
can also put the static root in constructor options
```javascript
const myHttpService = new HttpService({
  staticRoot: resolve(__dirname, 'static-root')
})

```

### ProxyService

#### new ProxyService(options)
create a new proxy service
```javascript
const myProxyService = new ProxyService(options)
```

#### listen
listen at a specified port
```javascript
myProxyService.listen(8888)
```

#### close
terminate listening
```javascript
myProxyService.close()
```

#### add
add proxy rules
```javascript
myProxyService
  .add({
    '/foo': 'http://host1:3000', // http://hostname:8888/foo -> http://host1:3000
    '/bar': 'http://host2:3001/bar' // http://hostname:8888/bar -> http://host2:3001/bar
  })
  .listen(8888)
```
can also put rules in constructor options
```javascript
const myProxyService = new ProxyService({
  '/foo': 'http://localhost:3000',
  '/bar': 'http://localhost:3001',
  'default': 'http://localhost: 8888'
})
```

### HttpException

#### new HttpException(status, message, stackEnumerable)
create a new http exception

| Param           | Type                 | Description                              |
| --------------- | -------------------- | ---------------------------------------- |
| status          | <code>Numeric</code> | http status code                         |
| message         | <code>String</code>  | customized error message                 |
| stackEnumerable | <code>Boolean</code> | include the stack info or not. _false_ as default |

```javascript
throw new HttpException(400, 'oops...');
```
