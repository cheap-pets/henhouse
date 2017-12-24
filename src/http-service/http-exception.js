class HttpException extends Error {
  constructor (status, message, stackEnumerable) {
    super(message)
    Object.defineProperty(this, 'message', {
      enumerable: true
    })
    if (stackEnumerable === true) {
      Object.defineProperty(this, 'stack', {
        enumerable: true
      })
    }
    this.status = status
  }
}

module.exports = HttpException
