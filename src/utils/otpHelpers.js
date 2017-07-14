import speakeasy from 'speakeasy'

export const verifyOTP = (secret, token) => speakeasy.totp.verify({ secret, encoding: 'base32', token })

export const generateSecret = (user) => speakeasy.generateSecret({ length: 128, name: user })
