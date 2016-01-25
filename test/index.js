var fs = require('fs');
var test = require('tape');
var decode = require('../');
var stringToStream = require('./helpers/string-to-stream');

function neverHere(msg) {
  return function () {
    throw new Error('Should not reach: ' + msg);
  };
}

test('stringToStream works', function (t) {
  var s = stringToStream('foo bar baz', 2);

  var parts = [];
  s.on('data', function (part) {
    parts.push(part.toString());
  });

  s.on('end', function () {
    t.deepEqual(parts, ['fo', 'o ', 'ba', 'r ', 'ba', 'z']);
    t.end();
  });
});


test('handles valid image', function (t) {
  var dataUri = fs.readFileSync(__dirname + '/fixtures/chrome.base64.txt').toString();
  var dataUriStream = stringToStream(dataUri, 4);

  dataUriStream.pipe(decode().on('header', function (header, imageStream) {
    t.equal(header.mediatype, 'image/png');
    t.ok(header.base64);
    t.end();
  }));
});

test('handles valid image', function (t) {
  var dataUri = fs.readFileSync(__dirname + '/fixtures/chrome.base64.txt').toString();
  var dataUriStream = stringToStream(dataUri, 4);

  dataUriStream.pipe(decode()).on('header', function (header, imageStream) {
    t.equal(header.mediatype, 'image/png');
    t.ok(header.base64);
  }).on('finish', () => t.end());
});

test('errors if not valid data uri with a comma', function (t) {
  t.plan(2);
  var stream = stringToStream('not-a-data-uri,');

  stream.pipe(decode()).on('error', function (err) {
    t.equal(err.message, 'Invalid data-uri');
  });

  stream.pipe(
    decode().on('error', function (err) {
      t.equal(err.message, 'Invalid data-uri');
    })
  );
});

test('errors if not valid data uri without a comma', function (t) {
  t.plan(2);
  var stream = stringToStream('not-a-data-uri');

  stream.pipe(decode()).on('error', function (err) {
    t.equal(err.message, 'Invalid data-uri');
  });

  stream.pipe(
    decode().on('error', function (err) {
      t.equal(err.message, 'Invalid data-uri');
    })
  );
});

test('errors if ends before header complete', function (t) {
  t.plan(2);
  var stream = stringToStream('data:image/png;base6');

  stream.pipe(decode().on('header', neverHere('header')))
    .on('error', function (err) {
      t.equal(err.message, 'Invalid data-uri');
    })

  stream.pipe(
    decode().on('header', neverHere('header')).on('error', function (err) {
      t.equal(err.message, 'Invalid data-uri');
    })
  ).on('end', neverHere('error'));
});
