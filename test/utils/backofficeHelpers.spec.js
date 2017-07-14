/* eslint-env node, mocha */
import { generate } from '../../src/utils/backofficeHelpers'
import { expect } from 'chai'

describe('BackOffice', () => {
  it('should generate secret and SVG image', (done) => {
    generate('someone')
   .then(({ secret, imageData }) => {
     expect(secret.base32).to.match(/^[A-Z0-9]+$/)
     expect(secret.otpauth_url).to.match(new RegExp(`^otpauth:\\/\\/totp\\/someone\\?secret=${ secret.base32 }$`))
     expect(imageData).to.match(/^<svg xmlns=.+<\/svg>$/)
     done()
   })
   .catch((err) => {
     done(err)
   })
  })
})
