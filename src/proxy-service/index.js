const Http = require('http');
const HttpProxy = require('http-proxy');
const { parse } = require('url');

function mapper (mappingPath, target) {
  const r = new RegExp(mappingPath.replace(/\//, '\\/'));
  const url = parse(target);
  const path = (url.path === '/') ? '' : url.path;
  return urlString => {
    const arr = r.exec(urlString);
    if (arr) {
      return {
        host: url.host,
        url: (arr ? urlString.slice(arr[0].length) : '') + path,
        target: `${url.protocol}//${url.host}`
      };
    }
  };
}

function doProxy (req, res, mapping) {
  req.url = mapping.url;
  req.headers.host = mapping.host;
  this.$proxy.web(req, res, {
    target: mapping.target
  });
}

class Proxy {
  constructor(mappings) {
    this.$maps = [];
    this.$proxy = HttpProxy.createProxyServer();
    this.$proxy.on('error', function(err, req, res) {
      if (res) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(err.message);
      }
    });
    this.$server = Http.createServer((req, res) => {
      if (this.$maps.every(map => {
        const m = map(req.url);
        if (m) {
          doProxy.call(this, req, res, m);
          return false;
        }
        return true;
      })) {
        if (this.$maps.default) {
          doProxy.call(this, req, res, this.$maps.default(req.url));
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      }
    });
    if (mappings) {
      this.add(mappings);
    }
  }
  add(mappings) {
    Object.keys(mappings).forEach(k => {
      if (k === 'default') {
        this.$maps.default = mapper('', mappings[k]);
      } else {
        this.$maps.push(mapper(k, mappings[k]));
      }
    });
    return this;
  }
  listen(port) {
    this.$server.listen(port);
  }
  close() {
    this.$proxy.close();
    this.$server.close();
  }
}

module.exports = Proxy;
