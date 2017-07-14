/* eslint-env node, mocha */
import request from 'supertest'
import { computeToken } from '../../src/utils/jwtHelpers'
import { baseURL, createBackofficeUser } from '../setup'
import async from 'async'

const BACKOFFICE_USER_MAGICKEY = '1234'

describe('API /health', () => {
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

  it('should return OK', (done) => {
    request(baseURL())
    .get('/20170714/api/health')
    .expect(200, '{"message":"Ok"}')
    .end(done)
  })

  it('should return 401 no authorization', (done) => {
    request(baseURL())
    .get('/20170714/api/unkown')
    .expect(401, '{"error":{"message":"No authorization token was found","error":{}}}')
    .end(done)
  })

  it('should return 404 not found', (done) => {
    async.series([
      (cb) => {
        request(baseURL())
        .get('/20170714/api/unkown')
        .set('Authorization', `Bearer ${ computeToken('foo.bar@example.org') }`)
        .expect(404, '{"error":{"message":"not found","error":{}}}')
        .end(cb)
      },
      (cb) => {
        request(baseURL())
        .get('/20170714/api/unkown')
        .set('Authorization', `Bearer ${ computeToken('testback.testoffice@example.org', BACKOFFICE_USER_MAGICKEY) }`)
        .expect(404, '{"error":{"message":"not found","error":{}}}')
        .end(cb)
      },
    ], done)
  })
})
