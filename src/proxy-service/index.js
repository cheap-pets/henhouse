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
        url: urlString.slice(arr[0].length) + path,
        target: `${url.protocol}//${url.host}`
      };
    }
  };
}

class Proxy {
  constructor(mappings) {
    this.$maps = [];
    this.$proxy = HttpProxy.createProxyServer();
    this.$proxy.on('error', function(err, req, res) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(err.message);
    });
    this.$server = Http.createServer((req, res) => {
      if (this.$maps.every(map => {
        const m = map(req.url);
        if (m) {
          req.url = m.url;
          req.headers.host = m.host;
          this.$proxy.web(req, res, {
            target: m.target
          });
          return false;
        }
        return true;
      })) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });
    if (mappings) {
      this.add(mappings);
    }
  }
  add(mappings) {
    Object.keys(mappings).forEach(k => {
      this.$maps.push(mapper(k, mappings[k]));
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
