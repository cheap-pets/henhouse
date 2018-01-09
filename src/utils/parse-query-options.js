function parseAttribute (attributeString, result) {
  const arr = (attributeString || '').split('.')
  for (let i = 0, len = arr.length; i < len; i++) {
    const attr = arr[i].trim()
    if (i === len - 1) {
      !result.attributes && (result.attributes = [])
      result.attributes.push(attr)
    } else {
      !result.associations && (result.associations = {})
      !result.associations[attr] && (result.associations[attr] = {})
      result = result.associations[attr]
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
      !result.orders && (result.orders = [])
      result.orders.push(isDesc ? '-' + attr : attr)
    } else {
      !result.associations && (result.associations = {})
      !result.associations[attr] && (result.associations[attr] = {})
      result = result.associations[attr]
    }
  }
}

function parseOrders (ordersString, result) {
  const arr = (ordersString || '').split(',')
  for (let i = 0, len = arr.length; i < len; i++) {
    parseOrder(arr[i].trim(), result)
  }
}

function parseConditions (key, value, result) {
  const arr = key.split('.')
  for (let i = 0, len = arr.length; i < len; i++) {
    const attr = arr[i].trim()
    if (i === len - 1) {
      !result.conditions && (result.conditions = [])
      result.conditions.push({
        [attr]: value
      })
    } else {
      !result.associations && (result.associations = {})
      !result.associations[attr] && (result.associations[attr] = {})
      result = result.associations[attr]
    }
  }
}

function parseQueryOptions (query) {
  const result = {}
  for (let key in query) {
    const value = query[key]
    switch (key) {
      case '_fields':
        parseAttributes(value, result)
        break
      case '_order':
        parseOrders(value, result)
        break
      default:
        if (key[0] === '_') {
          result[key.substr(1)] = value
        } else {
          parseConditions(key, query[key], result)
        }
    }
  }
  if (!query._fields && Object.keys(result).length) {
    result.attributes = ['*']
  }
  return Object.keys(result).length ? result : null
}

module.exports = parseQueryOptions
