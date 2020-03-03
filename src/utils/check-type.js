exports.isArray = function isArray (obj) {
  return Object.prototype.toString.call(obj) === '[object Array]'
}

exports.isFunction = function isFunction (obj) {
  const s = Object.prototype.toString.call(obj)
  return s === '[object Function]' || s === '[object AsyncFunction]'
}

exports.isPlainObject = function isPlainObject (v) {
  return Object.prototype.toString.call(v) === '[object Object]'
}

exports.isString = function isString (v) {
  return Object.prototype.toString.call(v) === '[object String]'
}
