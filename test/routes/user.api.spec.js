/* eslint-env node, mocha */
import request from 'supertest'
import { baseURL, createBackofficeUser } from '../setup'
import { computeToken } from '../../src/utils/jwtHelpers'
import { expect } from 'chai'

const BACKOFFICE_USER_MAGICKEY = '1234'

describe('API /users', () => {
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

  describe('GET /users/:user_id', () => {
    it('should return front user info', (done) => {
      request(baseURL())
      .get('/20170714/api/users/23')
      .set('Authorization', `Bearer ${ computeToken('foo@bar.baz') }`)
      .expect(200)
      .end((err, res) => {
        if (err) { done(err) }
        expect(res.body).to.deep.equal({ _id: 'foo@bar.baz' })
        done()
      })
    })

    it('should return back office user info', (done) => {
      request(baseURL())
      .get('/20170714/api/users/23')
      .set('Authorization', `Bearer ${ computeToken('testback.testoffice@example.org', BACKOFFICE_USER_MAGICKEY) }`)
      .expect(200)
      .end((err, res) => {
        if (err) { done(err) }
        expect(res.body).to.deep.equal({ _id: 'testback.testoffice@example.org' })
        done()
      })
    })

    it('should return 401', (done) => {
      request(baseURL())
      .get('/20170714/api/users/23')
      .expect(401, '{"error":{"message":"No authorization token was found","error":{}}}')
      .end(done)
    })
  })
})
