/* eslint-env node, mocha */
import request from 'supertest'
import { computeToken } from '../../src/utils/jwtHelpers'
import { baseURL, createBackofficeUser } from '../setup'
import async from 'async'

const BACKOFFICE_USER_MAGICKEY = '1234'

describe('API /kpi', () => {
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

  it('should return 200', (done) => {
    request(baseURL())
    .get('/20170714/api/kpi')
    .set('Authorization', `Bearer ${ computeToken('testback.testoffice@example.org', BACKOFFICE_USER_MAGICKEY) }`)
    .expect(200, '{"message":"Ok"}')
    .end(done)
  })

  it('should return 401', (done) => {
    request(baseURL())
    .get('/20170714/api/kpi')
    .expect(401, '{"error":{"message":"No authorization token was found","error":{}}}')
    .end(done)
  })

  it('should return 403', (done) => {
    async.series([
      (cb) => {
        request(baseURL())
        .get('/20170714/api/kpi')
        .set('Authorization', `Bearer ${ computeToken('foo.bar@example.org') }`)
        .expect(403, '{"message":"forbidden access"}')
        .end(cb)
      },
      (cb) => {
        request(baseURL())
        .get('/20170714/api/kpi')
        .set('Authorization', `Bearer ${ computeToken('testback.testoffice@example.org', 'wrong magic key') }`)
        .expect(403, '{"message":"forbidden access"}')
        .end(cb)
      },
    ], done)
  })
})
