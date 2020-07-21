(function () {
  // eslint-disable-next-line global-require
  const request = require('request');
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

  const is = {
    array: isArray,
    empty: isEmpty,
  };

  // import requestHotlinking from './request';

  const checkCors = (req) => {
    const { whitelist, blacklist } = req;
    const corsOptions = {};
    try {
      const origin = new URL(req.header('Origin'));

      switch (true) {
        // Only Allow if available in the whitelist, Block All By Default
        case is.array(whitelist) &&
          is.array(blacklist) &&
          is.empty(blacklist) &&
          !is.empty(whitelist):
          corsOptions.origin = whitelist.indexOf(origin.host) !== -1;
          break;

        // Reject if blacklisted, Allow By Default
        case is.array(whitelist) &&
          is.array(blacklist) &&
          !is.empty(blacklist) &&
          is.empty(whitelist):
          corsOptions.origin = blacklist.indexOf(origin.host) === -1;
          break;

        default:
      }
      return corsOptions;
    } catch (error) {
      return corsOptions;
    }
  };

  const frameguard = async (req, res, next) => {
    const { origin } = await checkCors(req);
    // const origin = new URL(req.header('Origin'));
    if (typeof origin === 'boolean') {
      res.setHeader('X-Frame-Options', !origin ? 'DENY' : `ALLOW-FROM ${req.header('Origin')}`);
      next();
    }
    if (!isEmpty(req.whitelist)) {
      res.setHeader('X-Frame-Options', 'DENY');
    }
    next();
  };

  const corsOptionsDelegate = (req, callback) => {
    const corsOptions = checkCors(req);
    callback(null, corsOptions); // callback expects two parameters: error and options
  };

  const initHotlinkingByURL = (url) => (req, res, next) => {
    try {
      // eslint-disable-next-line consistent-return
      request(url, { json: true }, (err, body) => {
        if (err) {
          return next();
        }
        req.whitelist = body.whitelist || [];
        req.blacklist = body.blacklist || [];
        next();
      });
      // eslint-disable-next-line no-empty
    } catch (e) {}

    next();
  };

  const initHotlinking = (data) => (req, res, next) => {
    req.whitelist = data.whitelist || [];
    req.blacklist = data.blacklist || [];
    next();
  };

  module.exports = {
    initHotlinking,
    initHotlinkingByURL,
    frameguard,
    corsOptionsDelegate,
  };
})();
