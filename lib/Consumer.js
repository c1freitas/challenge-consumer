'use strict';

var config = require('config');
var http = require('http');

var Log = require('log');
var log = new Log(config.logLevel);

/**
 * Constructor, port can be overridden, otherwise picked up from config.
 *  This is pulled into a separate object to allow better reuse.
 */
function Consumer(port) {
  this._port = (port || config.port);
  this._regEx = /^([0-9]{1,3})([\+\-\*\/]{1})([0-9]{1,3})[\=]/
}

/**
 * Start the consumer - It will listen on the defined port for incoming POST calls.
 *  If a valid Operation request comes in, it will calculate the result, otherwise
 *  return a simple error string.
 */
Consumer.prototype.start = function() {
  var self = this;

  function handleRequest (req, res, callback) {
    var result;
    req.on('data', function(data) {
      data = data.toString();
      // min 4 char require for proper request
      if (data.lenght < 4) {
        return res.end('Request is not a valid operation \n');
      }
      var values = self.parse(data);
      result = self.calculate(values);
      log.info('Result: ' + result);
    });

    req.on('end', function() {
      callback(result);
    });

  }

  var server = http.createServer(function(req, res) {
    if (req.method != 'POST') {
      return res.end('Unsupported HTTP method \n');
    } else {
      handleRequest(req, res, function(result) {
        if (isNaN(result)) {
          log.error('Invalid Request:' + result);
          return res.end('Request is not a valid operation \n');
        }
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write(result.toString(), 'utf8');
        res.end();
      });
    }

  });

  server.listen(this._port);
}

/**
 * Helper method, parses the supplied string. Expected format is
 *  "[NUMBER][OPERATOR][NUMBER]=" for example: 23+5=
 *  exposed to be able to unit test
 * @return simple object with number values and operator, {a:23, op:+, b:5}
 */
Consumer.prototype.parse = function(dataStr) {
  var match = this._regEx.exec(dataStr);
  if (!match || match.length !== 4) {
    return null;
  }
  var result = {}
  result.a = parseInt(match[1]);
  result.op = match[2];
  result.b = parseInt(match[3]);
  return result;
}

/**
 * Given a object returned from the parse function, calculate the result.
 * returns a error string if the supplied objecy is invalid
 */
Consumer.prototype.calculate = function(obj) {
  if (!obj || !obj.a || !obj.op || !obj.b) {
    return 'Invalid operation.';
  }
  var result;
  switch (obj.op) {
    case '+':
      result = obj.a + obj.b;
      break;
    case '-':
      result = obj.a - obj.b;
      break;
    case '/':
      result = obj.a / obj.b;
      break;
    case '*':
      result = obj.a * obj.b;
      break;
    default:
      result = 'Unsupported Operation: ' + obj.op;
  }
  return result;

}

module.exports = Consumer;
