var inherits = require('util').inherits;
var Transform = require('stream').Transform
var dataUri = require('strong-data-uri');

module.exports = DataUriDecode;

function DataUriDecode () {
  if (!(this instanceof DataUriDecode)) {
    return new DataUriDecode()
  }

  Transform.call(this);
  this.header = new Buffer('');
  this.headerEmitted = false;
}

inherits(DataUriDecode, Transform);

DataUriDecode.prototype._flush = function (done) {
  if (!this.headerEmitted) {
    done(new Error('Invalid data-uri'))
  }
};

DataUriDecode.prototype._transform = function (chunk, encoding, done) {
  if (this.found) {
    return done(null, chunk);
  }

  // search for the comma
  var split = -1;
  for (var i = 0; i < chunk.length; i++) {
    if (chunk[i] === 44) { // ','
      split = i;
      break;
    }
  }

  // no comma yet, so just add bytes to the header
  if (split === -1) {
    this.header = Buffer.concat([this.header, chunk]);

    // if our header doesn't start `data:` we don't have a data-uri
    var headerString = this.header.toString();
    if (headerString.length >= 5 && headerString.slice(0, 5) !== 'data:') {
      return done(new Error('Invalid data-uri'));
    }

    done();
  }

  // found the comma in this chunk, so add what's before to the header,
  // push what's after to the stream
  if (split > -1) {
    this.found = true;

    this.header = Buffer.concat([this.header, chunk.slice(0, split)]);
    var headerString = this.header.toString() + ',';

    try {
      var uri = dataUri.decode(headerString);

      this.emit('header', {
        base64: !!(headerString.match(/;base64/)),
        mimetype: uri.mimetype,
        mediatype: uri.mediatype,
        charset: uri.charset
      }, this);

      this.headerEmitted = true;
      return done(null, chunk.slice(split + 1));
    } catch (e) {
      done(new Error('Invalid data-uri'));
    }
  }
};
