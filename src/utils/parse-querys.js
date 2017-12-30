function parseQuery (key, value, result) {
  const arr = key.split('.')
  for (let i = 0, len = arr.length; i < len; i++) {
    const attr = arr[i].trim()
    if (!result[attr]) {
      result[attr] = (i === len - 1) ? value : {}
    }
    result = result[attr]
  }
}

function parseQuerys (query) {
  const result = {}
  for (let key in query) {
    if (key !== 'fields') {
      parseQuery(key, query[key], result)
    }
  }
  return Object.keys(result).length ? result : null
}

module.exports = parseQuerys
