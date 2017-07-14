/* eslint-env node, mocha */
/* eslint no-unused-expressions: 0 */
import request from 'supertest'
import * as connectors from '../../src/data/connectors/mongo-connector'
import { baseURL, createBackofficeUser } from '../setup'
import jwt from 'jsonwebtoken'
import { expect } from 'chai'
import { assert, sandbox } from 'sinon'
import { computeToken, verifyToken } from '../../src/utils/jwtHelpers'
import path from 'path'
import fs from 'fs'

let secretFilePath = path.join(path.resolve(process.cwd()), 'config/secret/secret.pem')
const privateKey = fs.readFileSync(secretFilePath, 'utf8')

const BACKOFFICE_USER_MAGICKEY = '1234'

describe('Authorization Middleware', () => {
  beforeEach((done) => {
    createBackofficeUser('testback.testoffice@example.org')
    .then((backofficeUser) => {
      backofficeUser.magicKey = BACKOFFICE_USER_MAGICKEY
      return backofficeUser.save()
    })
    .then(() => {
      done()
    })
    .catch(done)
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('wrong authorization', () => {
    it('should return 401 if no email', (done) => {
      request(baseURL())
      .post('/20170714/api/users/23')
      .set('Authorization', `Bearer ${ jwt.sign({ }, privateKey.toString('utf8')) }`)
      .expect(400, '{"message":"invalid token"}')
      .end(done)
    })

    it('should return 401 if expired token from frontend', (done) => {
      request(baseURL())
      .post('/20170714/api/users/23')
      .set('Authorization',
        `Bearer ${ jwt.sign({ email: 'foo@bar.baz' }, privateKey.toString('utf8'), { expiresIn: -1 }) }`)
      .expect(401, '{"error":{"message":"jwt expired","error":{}}}')
      .end(done)
    })

    it('should return 401 if expired token from backoffice', (done) => {
      request(baseURL())
      .get('/20170714/api/users/23')
      .set('Authorization',
        `Bearer ${ jwt.sign({ email: 'testback.testoffice@example.org', magicKey: BACKOFFICE_USER_MAGICKEY },
          privateKey.toString('utf8'),
          { expiresIn: -1 }) }`)
      .expect(401, '{"error":{"message":"jwt expired","error":{}}}')
      .end(done)
    })

    it('should return 403 if invalid magicKey from backoffice', (done) => {
      request(baseURL())
      .get('/20170714/api/kpi')
      .set('Authorization',
        `Bearer ${ jwt.sign({ email: 'testback.testoffice@example.org', magicKey: 'wrong magic key' },
          privateKey.toString('utf8')) }`)
      .expect(403, '{"message":"forbidden access"}')
      .end(done)
    })

    it('should return 403 if invalid backoffice email', (done) => {
      request(baseURL())
      .get('/20170714/api/kpi')
      .set('Authorization',
        `Bearer ${ jwt.sign({ email: 'un.known@example.org', magicKey: BACKOFFICE_USER_MAGICKEY },
          privateKey.toString('utf8')) }`)
      .expect(403, '{"message":"forbidden access"}')
      .end(done)
    })
  })

  describe('refreshing token', () => {
    it('should refresh token for frontend user', (done) => {
      request(baseURL())
      .get('/20170714/api/users/23')
      .set('Authorization', `Bearer ${ computeToken('foo@bar.baz') }`)
      .expect(200)
      .end((err, res) => {
        if (err) { done(err) }
        var token = res.headers['authorization']
        var verify = verifyToken(token.match(/^Bearer ([a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9-_]+)$/)[1])
        expect(verify.exp).to.be.equal(verify.iat + 1 * 3600 * 24)
        expect(verify.email).to.be.equal('foo@bar.baz')
        expect(verify.magicKey).to.be.undefined
        done()
      })
    })

    it('should refresh token for backoffice user', (done) => {
      request(baseURL())
      .get('/20170714/api/kpi')
      .set('Authorization', `Bearer ${ computeToken('testback.testoffice@example.org', BACKOFFICE_USER_MAGICKEY) }`)
      .expect(200)
      .end((err, res) => {
        if (err) { done(err) }
        var token = res.headers['authorization']
        var matchedToken = token.match(/^Bearer ([a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9-_]+)$/)[1]
        var verify = verifyToken(matchedToken)
        expect(verify.exp).to.be.equal(verify.iat + 1 * 3600)
        expect(verify.email).to.be.equal('testback.testoffice@example.org')
        expect(verify.magicKey).to.not.be.equal(BACKOFFICE_USER_MAGICKEY)
        expect(verify.magicKey).to.match(/[\w\d-]+/)
        done()
      })
    })

    it('should return 500 if updating backoffice user failed', (done) => {
      const updateStub = sandbox.stub(connectors, 'update').returns(Promise.resolve({ ok: 0 }))
      request(baseURL())
      .get('/20170714/api/kpi')
      .set('Authorization', `Bearer ${ computeToken('testback.testoffice@example.org', BACKOFFICE_USER_MAGICKEY) }`)
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
      .post('/20170714/api/kpi')
      .set('Authorization', `Bearer ${ computeToken('testback.testoffice@example.org', BACKOFFICE_USER_MAGICKEY) }`)
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
      .post('/20170714/api/kpi')
      .set('Authorization', `Bearer ${ computeToken('testback.testoffice@example.org', BACKOFFICE_USER_MAGICKEY) }`)
      .expect(666, '{"message":"fooo"}')
      .end((err, res) => {
        if (err) { return done(err) }
        assert.calledOnce(updateStub)
        done()
      })
    })
  })
})
