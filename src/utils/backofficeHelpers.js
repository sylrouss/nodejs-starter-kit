import speakeasy from 'speakeasy'
import qr from 'qr-image'

export const generate = (user) =>
 new Promise((resolve, reject) => {
   var secret = speakeasy.generateSecret({ length: 128, name: user })
   var imageData = qr.imageSync(secret.otpauth_url, { type: 'svg' })
   resolve({ secret, imageData })
 })
