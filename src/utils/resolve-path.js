function resolve () {
  let path = ''
  for (let i = 0, len = arguments.length; i < len; i++) {
    path += '/' + arguments[i]
  }
  path = path.replace(/\\/g, '/')
  while (path.indexOf('//') >= 0) {
    path = path.replace(/\/\//g, '/')
  }
  return path
}

module.exports = resolve
