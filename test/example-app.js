(function () {
  const express = require('express');
  const supertest = require('supertest');
  const cors = require('../lib/hotlinking').cors;
  let simpleApp;
  let complexApp;

  /* -------------------------------------------------------------------------- */

  simpleApp = express();
  simpleApp.head('/', cors(), (req, res) => {
    res.status(204).send();
  });
  simpleApp.get('/', cors(), (req, res) => {
    res.send('Hello World (Get)');
  });
  simpleApp.post('/', cors(), (req, res) => {
    res.send('Hello World (Post)');
  });

  /* -------------------------------------------------------------------------- */

  complexApp = express();
  complexApp.options('/', cors());
  complexApp.delete('/', cors(), (req, res) => {
    res.send('Hello World (Delete)');
  });

  /* -------------------------------------------------------------------------- */

  describe('Example app(s)', () => {
    describe('simple methods', () => {
      it('GET works', (done) => {
        supertest(simpleApp)
          .get('/')
          .expect(200)
          .expect('Access-Control-Allow-Origin', '*')
          .expect('Hello World (Get)')
          .end(done);
      });
      it('HEAD works', (done) => {
        supertest(simpleApp)
          .head('/')
          .expect(204)
          .expect('Access-Control-Allow-Origin', '*')
          .end(done);
      });
      it('POST works', (done) => {
        supertest(simpleApp)
          .post('/')
          .expect(200)
          .expect('Access-Control-Allow-Origin', '*')
          .expect('Hello World (Post)')
          .end(done);
      });
    });

    describe('complex methods', () => {
      it('OPTIONS works', (done) => {
        supertest(complexApp)
          .options('/')
          .expect(204)
          .expect('Access-Control-Allow-Origin', '*')
          .end(done);
      });
      it('DELETE works', (done) => {
        supertest(complexApp)
          .del('/')
          .expect(200)
          .expect('Access-Control-Allow-Origin', '*')
          .expect('Hello World (Delete)')
          .end(done);
      });
    });
  });
})();
