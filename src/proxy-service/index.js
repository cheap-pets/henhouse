const Http = require('http')
const HttpProxy = require('http-proxy')
const { parse } = require('url')

function mapper (mappingPath, target) {
  const r = new RegExp(mappingPath.replace(/\//, '\\/'))
  const url = parse(target)
  const path = url.path === '/' ? '' : url.path
  return urlString => {
    const arr = r.exec(urlString)
    if (arr) {
      return {
        host: url.host,
        url: path + (arr ? urlString.slice(arr[0].length) : ''),
        target: `${url.protocol}//${url.host}`
      }
    }
  }
}

function doProxy (req, res, mapping) {
  req.url = mapping.url
  req.headers.host = mapping.host
  this.proxyServer.web(req, res, {
    target: mapping.target
  })
}

class Proxy {
  constructor (mappings) {
    this.proxyMaps = []
    this.proxyServer = HttpProxy.createProxyServer({
      xfwd: true
    })
    this.proxyServer.on('error', function (err, req, res) {
      if (res) {
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end(err.message)
      }
    })
    this.httpServer = Http.createServer((req, res) => {
      if (
        this.proxyMaps.every(map => {
          const m = map(req.url)
          if (m) {
            doProxy.call(this, req, res, m)
            return false
          }
          return true
        })
      ) {
        if (this.proxyMaps.default) {
          doProxy.call(this, req, res, this.proxyMaps.default(req.url))
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' })
          res.end('Not Found')
        }
      }
    })
    if (mappings) {
      this.add(mappings)
    }
  }
  add (mappings) {
    Object.keys(mappings).forEach(k => {
      if (k === '*') {
        this.proxyMaps.default = mapper('', mappings[k])
      } else {
        this.proxyMaps.push(mapper(k, mappings[k]))
      }
    })
    return this
  }
  listen (port) {
    this.httpServer.listen(port)
  }
  close () {
    this.proxyServer.close()
    this.httpServer.close()
  }
}

module.exports = Proxy
