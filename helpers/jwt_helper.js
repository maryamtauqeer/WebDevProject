const jwt=require('jsonwebtoken');
const createError = require('http-errors')
const User = require('../models/user')

module.exports={
    AccessToken: (userId) =>{
        return new Promise((resolve,reject)=>{
            const payload = {userId}
            const secret = process.env.JWT_KEY
            const options = {
                expiresIn :'1h',
                issuer: 'maryamspage.com',
                audience: userId,
            }
            jwt.sign(payload, secret, options, (err,token)=> {
                if(err) {
                    console.log(err.message)
                    reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
     
    },


    verifyAccessToken: (req, res, next) => {
      if (!req.headers['authorization']) return next(createError.Unauthorized())
      const authHeader = req.headers['authorization']
      const bearerToken = authHeader.split(' ')
      const token = bearerToken[1]
      jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
        if (err) {
          const message =
            err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message
          return next(createError.Unauthorized(message))
        }
        req.payload = payload
        next()
      })
    },

    RefreshToken: (userId) =>{
        return new Promise((resolve,reject)=>{
            const payload = {userId}
            const secret = process.env.JWT_REFRESH_KEY
            const options = {
                expiresIn :'30d',
                issuer: 'maryamspage.com',
                audience: userId,
            }
            jwt.sign(payload, secret, options, (err,token)=> {
                if(err) {
                    console.log(err.message)
                    reject(createError.InternalServerError())
                }
                resolve(token)
            })
        })
    },

    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve,reject)=> {
            jwt.verify(refreshToken,process.env.JWT_REFRESH_KEY,(err,payload)=>{
                if (err) return reject(createError.Unauthorized())
                const userId = payload.aud

                resolve(userId)
            })   
        })
    }
}