function parseAttribute (attributeString, result) {
  const arr = (attributeString || '').split('.')
  for (let i = 0, len = arr.length; i < len; i++) {
    const attr = arr[i].trim()
    if (i === len - 1) {
      !result.$attributes && (result.$attributes = [])
      result.$attributes.push(attr)
    } else {
      !result[attr] && (result[attr] = {})
      result = result[attr]
    }
  }
}

function parseAttributes (attributesString, result) {
  const arr = (attributesString || '').split(',')
  for (let i = 0, len = arr.length; i < len; i++) {
    parseAttribute(arr[i].trim(), result)
  }
}

function parseOrder (orderString, result) {
  const arr = (orderString || '').split('.')
  let isDesc = false
  for (let i = 0, len = arr.length; i < len; i++) {
    let attr = arr[i].trim()
    if (attr[0] === '-') {
      attr = attr.substr(1)
      isDesc = true
    }
    if (i === len - 1) {
      !result.$orders && (result.$orders = [])
      result.$orders.push(isDesc ? '-' + attr : attr)
    } else {
      !result[attr] && (result[attr] = {})
      result = result[attr]
    }
  }
}

function parseOrders (ordersString, result) {
  const arr = (ordersString || '').split(',')
  for (let i = 0, len = arr.length; i < len; i++) {
    parseOrder(arr[i].trim(), result)
  }
}

function parseQuery (key, value, result) {
  const arr = key.split('.')
  for (let i = 0, len = arr.length; i < len; i++) {
    const attr = arr[i].trim()
    if (i === len - 1) {
      !result.$where && (result.$where = {})
      result.$where[attr] = value
    } else {
      !result[attr] && (result[attr] = {})
      result = result[attr]
    }
  }
}

function parseQueryOptions (query) {
  const result = {}
  for (let key in query) {
    const value = query[key]
    switch (key) {
      case 'fields':
        parseAttributes(value, result)
        break
      case 'order':
        parseOrders(value, result)
        break
      default:
        parseQuery(key, query[key], result)
    }
  }
  return Object.keys(result).length ? result : null
}

module.exports = parseQueryOptions
