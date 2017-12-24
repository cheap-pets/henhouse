function attributesQuery2Array (query) {
  const result = []
  const len = query.length
  let depth = 0
  let w = ''
  let v = ''
  let i = 0
  for (; i < len; i++) {
    let c = query[i]
    if (c === ' ') continue
    if (c === '(') {
      depth++
      if (depth === 1) continue
    } else if (c === ')') {
      depth--
      if (depth === 0) continue
    }
    if (depth === 0) {
      if (c === ',') {
        result.push(
          v === ''
            ? w
            : {
              model: w,
              attributes: attributesQuery2Array(v)
            }
        )
        w = ''
        v = ''
      } else {
        w += c
      }
    } else {
      v += c
    }
  }
  if (depth === 0 && w !== '') {
    result.push(
      v === ''
        ? w
        : {
          model: w,
          attributes: attributesQuery2Array(v)
        }
    )
  }
  return result
}

module.exports = attributesQuery2Array
