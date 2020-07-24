(function () {
  // eslint-disable-next-line global-require
  const cors = require('./index');
  const redis = require('./redis');
  const fetch = require('node-fetch');
  const crypto = require('crypto');
  // ==========================================================================
  // Type checking utils
  // ==========================================================================
  const getConstructor = (input) =>
    input !== null && typeof input !== 'undefined' ? input.constructor : null;
  // eslint-disable-next-line max-len
  const isNullOrUndefined = (input) => input === null || typeof input === 'undefined';
  const isObject = (input) => getConstructor(input) === Object;
  const isString = (input) => getConstructor(input) === String;
  const isArray = (input) => Array.isArray(input);
  const isEmpty = (input) =>
    isNullOrUndefined(input) ||
    ((isString(input) || isArray(input)) && !input.length) ||
    (isObject(input) && !Object.keys(input).length);

  const defaults = {
    whitelist: [],
    blacklist: [],
    url: '',
  };

  const checkCors = (refererer) => {
    const { whitelist, blacklist } = defaults;
    const corsOptions = {};

    if (refererer) {
      const origin = new URL(refererer);

      if (isArray(whitelist) && !isEmpty(whitelist)) {
        corsOptions.origin = whitelist.indexOf(origin.host) > -1 ? refererer : false;
        corsOptions.frameguard = corsOptions.origin ? '' : 'DENY';
      } else if (isArray(blacklist) && !isEmpty(blacklist)) {
        corsOptions.origin = !(blacklist.indexOf(origin.host) !== -1);
        corsOptions.frameguard = corsOptions.origin ? '' : 'DENY';
      }
    } else if (isArray(whitelist) && !isEmpty(whitelist)) {
      corsOptions.origin = false;
      corsOptions.frameguard = 'DENY';
    }
    // console.log(corsOptions);
    return corsOptions;
  };

  const requestUrl = async (url) => {
    const key = crypto.createHash('sha1').update(JSON.stringify(url)).digest('hex');
    await redis.get(key, async (error, data) => {
      if (!error) {
        if (data !== null) {
          const corsData = JSON.parse(data);
          defaults.blacklist = corsData.blacklist || [];
          defaults.whitelist = corsData.whitelist || [];
        } else {
          const response = await fetch(url);
          if (response) {
            const jsonData = await response.json();
            redis.setex(key, 24 * 3600, JSON.stringify(jsonData));
            defaults.blacklist = jsonData.blacklist || [];
            defaults.whitelist = jsonData.whitelist || [];
          }
        }
      }
    });
  };

  const byURL = (url) =>
    async function (req, callback) {
      defaults.url = url;
      const refererer = req.headers.origin || req.headers.referrer;

      await requestUrl(url);
      const allowedOrigin = checkCors(refererer);
      callback(null, allowedOrigin);
    };

  const frameguard = (url) => async (req, res, next) => {
    if (req.method === 'GET') {
      defaults.url = url;
      const refererer = req.headers.referrer;
      await requestUrl(url);
      const allowedRefererer = checkCors(refererer);
      if (allowedRefererer.frameguard) {
        res.setHeader('X-Frame-Options', allowedRefererer.frameguard);
      }
    }
    next();
  };

  module.exports = {
    frameguard,
    byURL,
    cors,
  };
})();
