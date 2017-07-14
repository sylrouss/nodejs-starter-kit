/* eslint-env node, mocha */
/* eslint no-unused-expressions: 0 */
import { expect } from 'chai'
import { computeToken, verifyToken, initExpressJwt } from '../../src/utils/jwtHelpers'
import path from 'path'
import fs from 'fs'
import jwt from 'jsonwebtoken'

let secretFilePath = path.join(path.resolve(process.cwd()), 'config/secret/secret.pem')
const privateKey = fs.readFileSync(secretFilePath, 'utf8')

describe('jwtHelpers Test', () => {
  describe('computeToken Test', () => {
    it('should computeToken with magicKey', () => {
      var authorizationBackoffice = computeToken('userId1', 'magicKey1')
      var token = authorizationBackoffice
      .match(/^([a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9-_]+)$/)[1]
      const verify = jwt.verify(token, privateKey.toString('utf8'))
      expect(verify.exp).to.be.equal(verify.iat + 1 * 3600)
      expect(verify.email).to.be.equal('userId1')
      expect(verify.magicKey).to.not.be.undefined
    })

    it('should computeToken without magicKey', () => {
      var authorizationBackoffice = computeToken('userId1')
      var token = authorizationBackoffice
      .match(/^([a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9-_]+)$/)[1]
      const verify = jwt.verify(token, privateKey.toString('utf8'))
      expect(verify.exp).to.be.equal(verify.iat + 24 * 3600)
      expect(verify.email).to.be.equal('userId1')
      expect(verify.magicKey).to.be.undefined
    })
  })

  describe('verifyToken Test', () => {
    it('should verifyToken with valid token', () => {
      var token = computeToken('userId1', 'magicKey1')
      const verify = verifyToken(token)
      expect(verify.exp).to.be.equal(verify.iat + 1 * 3600)
      expect(verify.email).to.be.equal('userId1')
      expect(verify.magicKey).to.not.be.undefined
    })

    it('should computeToken without valid token', () => {
      var token = 'Pwn by kZk'
      try {
        verifyToken(token)
      } catch (e) {
        expect(e).to.not.be.undefined
      }
    })
  })

  describe('initExpressJwt Test', () => {
    it('should not throw error if initExpressJwt has with unlessPath', (done) => {
      var unlessPath = computeToken('userId1', 'magicKey1')
      try {
        initExpressJwt(unlessPath)
      } catch (e) {
        done(e)
      } finally {
        done()
      }
    })

    it('should not throw error if initExpressJwt has not with unlessPath', (done) => {
      var unlessPath = 'Pwn by kZk'
      try {
        initExpressJwt(unlessPath)
      } catch (e) {
        done(e)
      } finally {
        done()
      }
    })
  })
})
