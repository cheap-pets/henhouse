function parseAttribute (attributeString, obj) {
  const arr = (attributeString || '').split('.')
  for (let i = 0, len = arr.length; i < len; i++) {
    let attr = arr[i].trim()
    if (attr === '') break
    if (obj[attr]) {
      obj = obj[attr]
    } else {
      if (obj === 1) obj = {}
      obj[attr] = 1
    }
  }
}

function parseAttributes (attributesQuery) {
  const result = {}
  const arr = (attributesQuery || '').split(',')
  for (let i = 0, len = arr.length; i < len; i++) {
    parseAttribute(arr[i], result)
  }
  return result
}

module.exports = parseAttributes
