# data-uri-stream-decode

Decodes streaming data-uris (`data:image/png;base64,iVBORw0KGgoAAAANSUhEUg....`) for example from file uploads, stripping the header from the stream.

## Example

```
var fs = require('fs');
var base64 = require('base64-stream'); //to decode base64 streaming data

var decodeDataUri = require('data-uri-stream-decode');

var stream;// = some stream containing a data uri like: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUg....`

stream.pipe(decodeDataUri())
      .on('header', function (header, dataStream) {
        // header will be:
        // - mimetype: image/png
        // - mediatype: image/png;charset... (if relevant)
        // - base64: true

        // dataStream will be a byte stream of the remaining bytes
        // it's the same as the result of `stream.pipe(decodeDataUri())`
        // but using this callback allows you to get header information
        var ext = header.mimetype.split('/')[1];
        var outputFile = fs.createWriteStream(__dirname + '/outputfile.' + ext);

        dataStream.pipe(base64.decode()).pipe(outputFile);
      })
```
