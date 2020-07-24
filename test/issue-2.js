(function () {
  const express = require('express');
  const supertest = require('supertest');
  const cors = require('../lib/hotlinking').cors;
  let app;
  let corsOptions;

  /* -------------------------------------------------------------------------- */

  app = express();
  corsOptions = {
    origin: true,
    methods: ['POST'],
    credentials: true,
    maxAge: 3600,
  };
  app.options('/api/login', cors(corsOptions));
  app.post('/api/login', cors(corsOptions), (req, res) => {
    res.send('LOGIN');
  });

  /* -------------------------------------------------------------------------- */

  describe('issue  #2', () => {
    it('OPTIONS works', (done) => {
      supertest(app)
        .options('/api/login')
        .set('Origin', 'http://example.com')
        .expect(204)
        .expect('Access-Control-Allow-Origin', 'http://example.com')
        .end(done);
    });
    it('POST works', (done) => {
      supertest(app)
        .post('/api/login')
        .set('Origin', 'http://example.com')
        .expect(200)
        .expect('Access-Control-Allow-Origin', 'http://example.com')
        .expect('LOGIN')
        .end(done);
    });
  });
})();
