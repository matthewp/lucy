const path = require('path');
const pluginTester = require('babel-plugin-tester');
const plugin = require('./lib/main.js');

pluginTester({
  plugin,
  fixtures: path.join(__dirname, 'tests'),

  /*tests: [
    {
      fixture: __dirname + '/tests/invoke-action/code.js',
      outputFixture: __dirname + '/tests/invoke-action/output.js',
    }
  ]*/
});