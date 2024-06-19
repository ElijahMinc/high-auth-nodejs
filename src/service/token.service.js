const TokenModel = require('../models/Token/Token.model');
const jwt = require('jsonwebtoken')

class TokenService {
    generateTokens(payload){
      const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {
         expiresIn: '24h' // 10s
      })      
      const refreshToken = jwt.sign(payload, process.env.SECRET_REFRESH_KEY, {
         expiresIn: '365d' // 30s
      })  


      return { accessToken, refreshToken }
   }

   generateAccessToken(payload){
      const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {
         expiresIn: '24h' // 10s
      })      

      return { accessToken }
   }

   generateTemporaryLink(payload){
      const temporaryLink = jwt.sign(payload, process.env.SECRET_KEY, {
         expiresIn: '5m' // 10s
      })       


      return { temporaryLink }
   }

   async saveRefreshToken(userId, refreshToken) {
      const token =  await TokenModel.findOne({ userId })
      
      if(!!token){
         token.refreshToken = refreshToken

         const updatedRefreshToken = await token.save()

         return updatedRefreshToken
      }

      const newToken = await TokenModel.create({
         userId,
         refreshToken
      })
   
      return newToken
   }

   async removeToken(refreshToken){
      const token = await TokenModel.deleteOne( { refreshToken } )
      return token
   }

   verifyRefreshToken(refreshToken){
      try {
         const isVerify = jwt.verify(refreshToken, process.env.SECRET_REFRESH_KEY)
         return isVerify
      } catch (e) {
         console.log(e)
         return null
      }
   }

   verifyAccessToken(accessToken){
      try {
         const isVerify = jwt.verify(accessToken, process.env.SECRET_KEY)
         return isVerify
      } catch (e) {
         return null
      }
   }

   verifyTemproraryLink(temporaryLink){
      try {
         const isVerify = jwt.verify(temporaryLink, process.env.SECRET_KEY)
         return isVerify
      } catch (e) {
         return null
      }
   }

   async findOne(refreshToken){
      const token = TokenModel.findOne({ refreshToken }) 
      return token
   }
}

module.exports = new TokenService