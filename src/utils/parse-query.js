function parseQuery (ctx) {
  const query = {}
  for (let key in ctx.query) {
    let value = ctx.query[key].trim()
    if (value[0] !== '(' && value[0] !== '\'' && value.indexOf(',') >= 0) {
      value = value.split(',')
    } else if (key === '_fields' || key === '_order') {
      value = [value]
    } else if (key === '_limit' || key === '_offset') {
      value = parseInt(value)
    }
    if (key[0] === '_') {
      ctx['$' + key.substr(1)] = value
    } else {
      query[key] = value
    }
  }
  Object.keys(query).length && (ctx.$query = query)
}

module.exports = parseQuery
