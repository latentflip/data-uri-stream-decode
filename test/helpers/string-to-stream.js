var stream = require('stream');

var stringToStream = function (string, bytesPerChunk) {
  bytesPerChunk = bytesPerChunk || 1;
  var s = new stream.Readable();
  s._read = function noop() {}; // redundant? see update below

  var toPush = string;

  function doLoop() {
    if (toPush.length === 0) {
      return s.push(null);
    }

    s.push(toPush.slice(0, bytesPerChunk));
    toPush = toPush.slice(bytesPerChunk);
    setTimeout(doLoop, 0);
  }

  setTimeout(doLoop, 0);
  return s;
};

module.exports = stringToStream;
