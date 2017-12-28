function parseAttribute (attributeString, result) {
  const arr = (attributeString || '').split('.')
  for (let i = 0, len = arr.length; i < len; i++) {
    const attr = arr[i].trim()
    if (!result[attr]) {
      result[attr] = {}
    }
    result = result[attr]
  }
}

function convert2Array (obj) {
  const result = []
  const keys = Object.keys(obj)
  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i]
    const item = obj[key]
    if (Object.keys(item).length === 0) {
      result.push(key)
    } else {
      const v = convert2Array(item)
      if (v) {
        result.push({ [key]: v })
      }
    }
  }
  return result.length ? result : null
}

function parseAttributes (attributesQuery) {
  const result = {}
  const arr = (attributesQuery || '').split(',')
  for (let i = 0, len = arr.length; i < len; i++) {
    parseAttribute(arr[i], result)
  }
  return convert2Array(result)
}

module.exports = parseAttributes
