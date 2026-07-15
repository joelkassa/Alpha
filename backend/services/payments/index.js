const telebirr = require('./telebirr');
const cbe = require('./cbe');

function getProvider(method) {
  if (method === 'telebirr') return telebirr;
  if (method === 'cbe') return cbe;
  throw new Error('Unsupported payment method: ' + method);
}

module.exports = { getProvider };