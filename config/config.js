var argv = require('minimist')(process.argv.slice(2));

if (argv.stage === 'prod') {
  config = require('./prod.json');
} else {
  config = require('./development.json');
}

module.exports = config;