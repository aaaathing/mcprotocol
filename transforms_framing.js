'use strict'
const Transform = require('readable-stream').Transform

module.exports.createSplitter = function () {
  return new useless()
}

module.exports.createFramer = function () {
  return new useless()
}

class useless extends Transform{
  _transform (chunk, enc, cb) {
    this.push(chunk)
    return cb()
  }
}