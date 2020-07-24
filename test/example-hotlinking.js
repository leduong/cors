(function () {
  const expect = require('chai').expect;
  const express = require('express');
  const supertest = require('supertest');
  const hotlinking = require('../lib/hotlinking');
  const cors = hotlinking.cors;

  /* -------------------------------------------------------------------------- */
  const blackUrl = 'https://uiza.herokuapp.com/cors/blacklist';
  const whiteUrl = 'https://uiza.herokuapp.com/cors/whitelist';
  const coreBlackList = hotlinking.byURL(blackUrl);
  const coreWhiteList = hotlinking.byURL(whiteUrl);
  const frameguardBL = hotlinking.frameguard(blackUrl);
  const frameguardWL = hotlinking.frameguard(whiteUrl);

  blackListApp = express();
  blackListApp.head('/', cors(coreBlackList), frameguardBL, (req, res) => {
    res.status(204).send();
  });
  blackListApp.options('/', cors(coreBlackList), (req, res) => {
    res.status(204).send();
  });
  blackListApp.get('/', cors(coreBlackList), (req, res) => {
    res.send('Hello World (Get)');
  });
  blackListApp.post('/', cors(coreBlackList), (req, res) => {
    res.send('Hello World (Post)');
  });
  /* -------------------------------------------------------------------------- */

  /* -------------------------------------------------------------------------- */
  // const whitelist = { whitelist: ['example.com', '*.example.io'], blacklist: [] };

  whiteListApp = express();
  whiteListApp.head('/', cors(coreWhiteList), frameguardWL, (req, res) => {
    res.status(204).send();
  });
  whiteListApp.options('/', cors(coreWhiteList), (req, res) => {
    res.status(204).send();
  });
  whiteListApp.get('/', cors(coreWhiteList), (req, res) => {
    res.send('Hello World (Get)');
  });
  whiteListApp.post('/', cors(coreWhiteList), (req, res) => {
    res.send('Hello World (Post)');
  });
  /* -------------------------------------------------------------------------- */

  describe('Hotlinking for blackListApp', () => {
    describe('Hotlinking methods Origin blacklist http://example.com', () => {
      it('GET works', (done) => {
        supertest(blackListApp)
          .get('/')
          .set('Referrer', 'http://example.com')
          .expect(200)
          // .expect('X-Frame-Options', 'DENY')
          .expect('Hello World (Get)')
          .end((err, res) => {
            if (err) throw err;
            if (res.header) {
              console.log(['GET blacklist Referrer http://example.com', res.header]);
            }
            // Ensure header does not exist
            expect(res.headers).to.not.have.key('access-control-allow-origin');
            done();
          });
      });
      it('HEAD works', (done) => {
        supertest(blackListApp)
          .head('/')
          .set('Origin', 'http://example.com')
          .expect(204)
          .end((err, res) => {
            if (err) throw err;
            if (res.header) {
              // console.log([
              //   'HEAD blacklist http://example.com',
              //   res.header['access-control-allow-origin'],
              //   res.header['x-frame-options'],
              // ]);
            }
            done();
          });
      });
      it('OPTIONS works', (done) => {
        supertest(blackListApp)
          .options('/')
          .set('Origin', 'http://example.com')
          .expect(204)
          .end((err, res) => {
            if (err) throw err;
            if (res.header) {
              // console.log([
              //   'OPTIONS blacklist http://example.com',
              //   res.header['access-control-allow-origin'],
              //   res.header['x-frame-options'],
              // ]);
            }
            done();
          });
      });
      it('POST works', (done) => {
        supertest(blackListApp)
          .post('/')
          .set('Origin', 'http://example.com')
          .expect(200)
          .expect('Hello World (Post)')
          .end((err, res) => {
            if (err) throw err;
            if (res.header) {
              // console.log([
              //   'POST blacklist http://example.com',
              //   res.header['access-control-allow-origin'],
              //   res.header['x-frame-options'],
              // ]);
            }
            done();
          });
      });
    });

    describe('Hotlinking methods non-Origin', () => {
      it('GET works', (done) => {
        supertest(blackListApp)
          .get('/')
          .expect(200)
          .expect('Access-Control-Allow-Origin', '*')
          .expect('Hello World (Get)')
          .end((err, res) => {
            if (err) throw err;
            if (res.header) {
              // console.log([
              //   'GET blacklist non-Origin',
              //   res.header['access-control-allow-origin'],
              //   res.header['x-frame-options'],
              // ]);
            }
            done();
          });
      });

      it('HEAD works', (done) => {
        supertest(blackListApp)
          .head('/')
          .expect(204)
          .expect('Access-Control-Allow-Origin', '*')
          .end((err, res) => {
            if (err) throw err;
            if (res.header) {
              // console.log([
              //   'HEAD blacklist non-Origin',
              //   res.header['access-control-allow-origin'],
              //   res.header['x-frame-options'],
              // ]);
            }
            done();
          });
      });

      it('OPTIONS works', (done) => {
        supertest(blackListApp)
          .options('/')
          .expect(204)
          .end((err, res) => {
            if (err) throw err;
            if (res.header) {
              // console.log([
              //   'OPTIONS blacklist non-Origin',
              //   res.header['access-control-allow-origin'],
              //   res.header['x-frame-options'],
              // ]);
            }
            done();
          });
      });

      it('POST works', (done) => {
        supertest(blackListApp)
          .post('/')
          .expect(200)
          .expect('Access-Control-Allow-Origin', '*')
          .expect('Hello World (Post)')
          .end((err, res) => {
            if (err) throw err;
            if (res.header) {
              // console.log([
              //   'POST blacklist non-Origin',
              //   res.header['access-control-allow-origin'],
              //   res.header['x-frame-options'],
              // ]);
            }
            done();
          });
      });
    });
  });

  describe('Hotlinking for whiteListApp non-Origin', () => {
    describe('Hotlinking methods', () => {
      it('GET works', (done) => {
        supertest(whiteListApp)
          .get('/')
          .expect(200)
          // .expect('X-Frame-Options', 'DENY')
          .expect('Hello World (Get)')
          .end((err, res) => {
            if (err) throw err;
            if (res.header) {
              console.log(['GET whitelist non-Origin', res.header]);
            }
            expect(res.headers).to.not.have.key('access-control-allow-origin');
            done();
          });
      });

      it('HEAD works', (done) => {
        supertest(whiteListApp)
          .head('/')
          .expect(204)
          .end((err, res) => {
            if (err) throw err;
            if (res.header) {
              // console.log([
              //   'HEAD whitelist non-Origin',
              //   res.header['access-control-allow-origin'],
              //   res.header['x-frame-options'],
              // ]);
            }
            expect(res.headers).to.not.have.key('access-control-allow-origin');
            done();
          });
      });

      it('OPTIONS works', (done) => {
        supertest(whiteListApp)
          .options('/')
          .expect(204)
          .end((err, res) => {
            if (err) throw err;
            if (res.header) {
              // console.log([
              //   'OPTIONS whitelist non-Origin',
              //   res.header['access-control-allow-origin'],
              //   res.header['x-frame-options'],
              // ]);
            }
            expect(res.headers).to.not.have.key('access-control-allow-origin');
            done();
          });
      });

      it('POST works', (done) => {
        supertest(whiteListApp)
          .post('/')
          .expect(200)
          .expect('Hello World (Post)')
          .end((err, res) => {
            if (err) throw err;
            if (res.header) {
              // console.log([
              //   'POST whitelist non-Origin',
              //   res.header['access-control-allow-origin'],
              //   res.header['x-frame-options'],
              // ]);
            }
            expect(res.headers).to.not.have.key('access-control-allow-origin');
            done();
          });
      });
    });
  });

  // Hotlinking whiteListApp
  describe('Hotlinking for whiteListApp Origin whitelist http://example.com', () => {
    describe('Hotlinking methods', () => {
      it('GET works', (done) => {
        supertest(whiteListApp)
          .get('/')
          .set('Referrer', 'http://example.com')
          .expect(200)
          .expect('Access-Control-Allow-Origin', 'http://example.com')
          .expect('Hello World (Get)')
          .end((err, res) => {
            if (err) throw err;
            if (res.header) {
              // console.log([
              //   'GET whitelist http://example.com',
              //   res.header['access-control-allow-origin'],
              //   res.header['x-frame-options'],
              // ]);
            }
            done();
          });
      });

      it('HEAD works', (done) => {
        supertest(whiteListApp)
          .head('/')
          .set('Origin', 'http://example.com')
          .expect('Access-Control-Allow-Origin', 'http://example.com')
          .end((err, res) => {
            if (err) throw err;
            if (res.header) {
              // console.log([
              //   'HEAD whitelist http://example.com',
              //   res.header['access-control-allow-origin'],
              //   res.header['x-frame-options'],
              // ]);
            }
            done();
          });
      });

      it('OPTIONS works', (done) => {
        supertest(whiteListApp)
          .options('/')
          .set('Origin', 'http://example.com')
          .expect(204)
          .expect('Access-Control-Allow-Origin', 'http://example.com')
          .end((err, res) => {
            if (err) throw err;
            if (res.header) {
              // console.log([
              //   'OPTIONS whitelist http://example.com',
              //   res.header['access-control-allow-origin'],
              //   res.header['x-frame-options'],
              // ]);
            }
            done();
          });
      });

      it('POST works', (done) => {
        supertest(whiteListApp)
          .post('/')
          .set('Origin', 'http://example.com')
          .expect(200)
          .expect('Access-Control-Allow-Origin', 'http://example.com')
          .expect('Hello World (Post)')
          .end((err, res) => {
            if (err) throw err;
            if (res.header) {
              // console.log([
              //   'POST whitelist http://example.com',
              //   res.header['access-control-allow-origin'],
              //   res.header['x-frame-options'],
              // ]);
            }
            done();
          });
      });
    });
  });
})();
