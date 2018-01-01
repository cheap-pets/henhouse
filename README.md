# Henhouse
A Microservices Framework for REST APIs


## Installation

Install using [npm](https://www.npmjs.org/):

```sh
npm install henhouse
```

## API Reference

### henhouse
import module
```javascript
const Henhouse = require('henhouse')
```
#### constructor
```javascript
const myService = new Henhouse({
  servicePath: 'my-service' // null by default 
})
```

#### listen
listen at a specified port
```javascript
myService.listen(3000)
```

#### close
listen at a specified port
```javascript
myService.close()
```


#### get | put | post | patch | delete
* Match URL patterns to callback functions
```javascript
myService
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

* Match model name to callback functions
```javascript
myService
  .get('foo', async (ctx, next, model, id) => {
    ctx.body = await model.query(ctx.$queryOptions, id)
  })
  .post('foo', async (ctx, next, model) => {
    ctx.body = await model.create(ctx.$requestBody)
  })
  .patch('foo', async (ctx, next, model, id) => {
    await model.update(ctx.$requestBody, id)
    ctx.body = 'ok'
  })
  .delete('foo', async (ctx, next, model, id) => {
    await model.remove(id)
    ctx.body = 'ok'
  })
  .listen(3000)
```

##### url query options
* specify attributes white list
```url
http://localhost:3000/foos?fields=a,b
```
* if "foo" got a associations named "bar"
```url
http://localhost:3000/foos?fields=a,b,bar.c,bar.d
```
* put some query conditions
```url
http://localhost:3000/foos?a=1&b=*bar
```
if model "foo" got a db engine behind, it may query like:
```sql
 select * from foo
 where foo.a=1 and foo.b like '%bar'
```
* it can also support nested object in query
```url
http://localhost:3000/foos?a=1&bar.b=2,3,4
```
it's may run a sql like:
```sql
 select * from foo
 inner join bar on bar.id = foo.bar_id
  and bar.b in (2,3,4)
 where foo.a=1
```
* order
```url
http://localhost:3000/foos?order=name,-beginDate
```
it's may run a sql like:
```sql
 select * from foo
 order by name, begin_date desc
```

#### static
 serving static files
```javascript
const { resolve } = require('path');

const myService = new Henhouse();
myService
  .getStatic({ root: path.resolve(__dirname, 'static-root') })
  .getStatic('/foo', { root: path.resolve(__dirname, 'static-foo') })
  .getStatic('/bar') // __dirname/bar
  .listen(3000)
```


### HttpException
```javascript
const HttpException = Henhosue.HttpException
new henhouse.HttpException(status, message, stackEnumerable)
```

create a new http exception

| Param           | Type                 | Description                              |
| --------------- | -------------------- | ---------------------------------------- |
| status          | <code>Numeric</code> | http status code                         |
| message         | <code>String</code>  | customized error message                 |
| stackEnumerable | <code>Boolean</code> | include the stack info or not. _false_ as default |

```javascript
throw new HttpException(400, 'oops...');
```