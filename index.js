var config = require('config');
var Log = require('log');
var log = new Log(config.logLevel);

// load our consumer
var Consumer = require('./lib/Consumer');
var consumer = new Consumer(config.port);

// Start the consumer.
consumer.start();
