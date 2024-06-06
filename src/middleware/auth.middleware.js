const ApiError = require('../exeptions/api-error')
const tokenService = require('../service/token.service')

module.exports = async function(req, res, next) {
   try {
      const accessToken = req.headers.authorization.split(' ')[1]

      const userData = await tokenService.verifyAccessToken(accessToken)

      if(!userData){
         throw ApiError.UnauthorizedError()
      }
      req.user = userData

      next()

   } catch (e) {
      next(e)
   }
}