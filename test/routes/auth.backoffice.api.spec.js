/* eslint-env node, mocha */
/* eslint no-unused-expressions: 0 */
import request from 'supertest'
import { baseURL, createBackofficeUser } from '../setup'
import * as connectors from '../../src/data/connectors/mongo-connector'
import async from 'async'
import speakeasy from 'speakeasy'
import { expect } from 'chai'
import { assert, sandbox } from 'sinon'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

let secretFilePath = path.join(path.resolve(process.cwd()), 'config/secret/secret.pem')
const privateKey = fs.readFileSync(secretFilePath, 'utf8')

describe('API /login from backoffice', () => {
  var backofficeUserSecret
  beforeEach((done) => {
    createBackofficeUser('testback.testoffice@example.org')
    .then((backofficeUser) => {
      backofficeUserSecret = backofficeUser.secret
      done()
    })
    .catch(done)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should return 401 on invalid login (with password)', (done) => {
    async.series([
      (cb) => {
        request(baseURL())
        .post('/20170714/api/login')
        .send({
          code: speakeasy.totp({ secret: backofficeUserSecret, encoding: 'base32' }),
          email: 'un.know@example.org',
          password: 'weak',
        })
        .expect(401)
        .end(cb)
      },
      (cb) => {
        request(baseURL())
        .post('/20170714/api/login')
        .send({
          code: speakeasy.totp({ secret: backofficeUserSecret, encoding: 'base32' }),
          email: 'testback.testoffice@example.org',
          password: 'dgdfg',
        })
        .expect(401)
        .end(cb)
      },
      (cb) => {
        request(baseURL())
        .post('/20170714/api/login')
        .send({
          code: 'invalid code',
          email: 'testback.testoffice@example.org',
          password: 'weak',
        })
        .expect(401)
        .end(cb)
      },
    ], done)
  })

  it('should return 200', (done) => {
    request(baseURL())
    .post('/20170714/api/login')
    .send({
      code: speakeasy.totp({ secret: backofficeUserSecret, encoding: 'base32' }),
      email: 'testback.testoffice@example.org',
      password: 'weak',
    })
    .expect(200, '{"_id":"testback.testoffice@example.org"}')
    .end((err, res) => {
      if (err) { return done(err) }
      var token = res.headers['authorization'].match(/^Bearer ([\w\d]+\.[\w\d]+\.[\w\d-_]+)$/)[1]
      const verify = jwt.verify(token, privateKey.toString('utf8'))
      expect(verify.exp).to.be.equal(verify.iat + 1 * 3600)
      expect(verify.email).to.be.equal('testback.testoffice@example.org')
      expect(verify.magicKey).to.not.be.undefined
      done()
    })
  })

  it('should return 500 if updating backoffice user failed', (done) => {
    const updateStub = sandbox.stub(connectors, 'update').returns(Promise.resolve({ ok: 0 }))
    request(baseURL())
    .post('/20170714/api/login')
    .send({
      code: speakeasy.totp({ secret: backofficeUserSecret, encoding: 'base32' }),
      email: 'testback.testoffice@example.org',
      password: 'weak',
    })
    .expect(500, '{"message":"internal error"}')
    .end((err, res) => {
      if (err) { return done(err) }
      assert.calledOnce(updateStub)
      done()
    })
  })

  it('should return default internal error if updating backoffice user failed', (done) => {
    const updateStub = sandbox.stub(connectors, 'update').returns(Promise.reject(''))
    request(baseURL())
    .post('/20170714/api/login')
    .send({
      code: speakeasy.totp({ secret: backofficeUserSecret, encoding: 'base32' }),
      email: 'testback.testoffice@example.org',
      password: 'weak',
    })
    .expect(500, '{"message":"internal error"}')
    .end((err, res) => {
      if (err) { return done(err) }
      assert.calledOnce(updateStub)
      done()
    })
  })

  it('should return custom error if updating backoffice user failed', (done) => {
    const updateStub = sandbox.stub(connectors, 'update').returns(Promise.reject({ status: 666, message: 'fooo' }))
    request(baseURL())
    .post('/20170714/api/login')
    .send({
      code: speakeasy.totp({ secret: backofficeUserSecret, encoding: 'base32' }),
      email: 'testback.testoffice@example.org',
      password: 'weak',
    })
    .expect(666, '{"message":"fooo"}')
    .end((err, res) => {
      if (err) { return done(err) }
      assert.calledOnce(updateStub)
      done()
    })
  })
})
