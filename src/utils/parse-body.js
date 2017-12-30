function parseBody (data) {
  let arr = []
  let i = 0
  for (let key in data) {
    if (parseInt(key) !== i) return data
    i++
    arr.push(data[key])
  }
  return arr
}
module.exports = parseBody
