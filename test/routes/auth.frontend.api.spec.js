/* eslint-env node, mocha */
/* eslint no-unused-expressions: 0 */
import request from 'supertest'
import { baseURL, createLDAPUser, removeLDAPUser } from '../setup'
import async from 'async'
import { expect } from 'chai'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

let secretFilePath = path.join(path.resolve(process.cwd()), 'config/secret/secret.pem')
const privateKey = fs.readFileSync(secretFilePath, 'utf8')

describe('API /login from frontend', () => {
  before((done) => {
    createLDAPUser('testfoo', 'testbar', 'weak', done)
  })

  after((done) => (
    removeLDAPUser('testfoo', 'testbar', done)
  ))

  it('should return 401 on invalid login', (done) => {
    async.series([
      (cb) => {
        request(baseURL())
        .post('/20170714/api/login')
        .expect(401, '{"message":"Incorrect credentials"}')
        .end(cb)
      },
      (cb) => {
        request(baseURL())
        .post('/20170714/api/login')
        .send({ email: 'testfoo@example.org', password: 'weak' })
        .expect(401, '{"message":"Incorrect credentials"}')
        .end(cb)
      },
      (cb) => {
        request(baseURL())
        .post('/20170714/api/login')
        .send({ email: 'testfoo.unknown@example.org', password: 'weak' })
        .expect(401, '{"message":"Incorrect credentials"}')
        .end(cb)
      },
      (cb) => {
        request(baseURL())
        .post('/20170714/api/login')
        .send({ email: 'unknown.testbar@example.org', password: 'weak' })
        .expect(401, '{"message":"Incorrect credentials"}')
        .end(cb)
      },
      (cb) => {
        request(baseURL())
        .post('/20170714/api/login')
        .send({ email: 'un.known@example.org', password: 'weak' })
        .expect(401, '{"message":"Incorrect credentials"}')
        .end(cb)
      },
      (cb) => {
        request(baseURL())
        .post('/20170714/api/login')
        .send({ email: 'testfoo.testbar@example.org', password: 'wrong' })
        .expect(401, '{"message":"Incorrect credentials"}')
        .end(cb)
      },
    ], done)
  })

  it('should return 200', (done) => {
    request(baseURL())
    .post('/20170714/api/login')
    .send({ email: 'testfoo.testbar@example.org', password: 'weak' })
    .expect(200, '{"_id":"testfoo.testbar@example.org"}')
    .end((err, res) => {
      if (err) { return done(err) }
      let authorization = res.headers['authorization']
      var token = authorization.match(/^Bearer ([a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9-_]+)$/)[1]
      const verify = jwt.verify(token, privateKey.toString('utf8'))
      expect(verify.exp).to.be.equal(verify.iat + 24 * 3600)
      expect(verify.email).to.be.equal('testfoo.testbar@example.org')
      expect(verify.magicKey).to.be.undefined
      done()
    })
  })
})
