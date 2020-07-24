/* eslint-disable global-require */
// eslint-disable-next-line func-names
(function () {
  const REDIS_URL = process.env.REDIS_URL || 'redis://localhost';
  const redisClient = require('redis');
  module.exports = redisClient.createClient(REDIS_URL);
})();
