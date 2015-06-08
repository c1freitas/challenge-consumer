var mocha = require('mocha');
var chai = require('chai');

var assert = chai.assert;

var validOperations = [
  '5*3=',
  '7/23=',
  '1+75=',
  '98-3='
]

var validOpObjects = [
  {a:9, op:'*', b:11},
  {a:23, op:'/', b:3},
  {a:30, op:'+', b:29},
  {a:100, op:'-', b:44}
]

var Consumer = require('../lib/Consumer');

describe('Helper Functions', function() {
  describe('parse', function() {
    it('should parse values, returning numbers and operator', function() {
      var consumer = new Consumer();
      var result = consumer.parse(validOperations[0]);
      assert.strictEqual(5, result.a, 'first number should match');
      assert.strictEqual('*', result.op, 'operation should match');
      assert.strictEqual(3, result.b, 'second number should match');

      result = consumer.parse(validOperations[1]);
      assert.strictEqual(7, result.a, 'first number should match');
      assert.strictEqual('/', result.op, 'operation should match');
      assert.strictEqual(23, result.b, 'second number should match')

      result = consumer.parse(validOperations[2]);
      assert.strictEqual(1, result.a, 'first number should match');
      assert.strictEqual('+', result.op, 'operation should match');
      assert.strictEqual(75, result.b, 'second number should match');

      result = consumer.parse(validOperations[3]);
      assert.strictEqual(98, result.a, 'first number should match');
      assert.strictEqual('-', result.op, 'operation should match');
      assert.strictEqual(3, result.b, 'second number should match');
    })

    it('should parse values, returning null if invalid', function() {
      var consumer = new Consumer();

      result = consumer.parse('3+=');
      assert.isNull(result, 'should be null');

      result = consumer.parse('3+foo=');
      assert.isNull(result, 'should be null');
    })
  })

  describe('calculate', function() {
    it('should calculate correct value for operation', function() {
      var consumer = new Consumer();
      var result = consumer.calculate(validOpObjects[0]);
      assert.strictEqual(99, result, 'Should match');

      result = consumer.calculate(validOpObjects[1]);
      assert.strictEqual(7.7, parseFloat(result.toFixed(1)), 'Should match - rounded');

      result = consumer.calculate(validOpObjects[2]);
      assert.strictEqual(59, result, 'Should match');

      result = consumer.calculate(validOpObjects[3]);
      assert.strictEqual(56, result, 'Should match');
    })

    it('should parse values, returning error message if invalid', function() {
      var consumer = new Consumer();
      var result = consumer.calculate({a:1, op:'%', b:2});
      assert.isNotNumber(result, 'Should return string error message');
      assert.match(result, /^Unsupported/, 'Should start with Unsupported');

      result = consumer.calculate({a:1, op:'+'});
      assert.isNotNumber(result, 'Should return string error message');
      assert.match(result, /^Invalid/, 'Should start with Invalid');
    })
  })
})
