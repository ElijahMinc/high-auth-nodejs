const { validationResult } = require('express-validator');
const ApiError = require('../exeptions/api-error');
const userService = require('../service/user.service');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

class UserContoller {
   async registration(req, res, next){
      try {
         const errors = validationResult(req)

         if(!errors.isEmpty()){
            next(ApiError.BadRequest('Bad Request with Registration', errors))
         }

         const {email, password} = req.body

         const userData = await userService.registration(email, password)

         res.cookie('refreshToken', userData.refreshToken, {
            maxAge: 30 * 24 * 60 * 10 * 1000, // 30d
            httpOnly: true // Эти куки нельзя получать из браузера с помощью js
         })

         res.json({data: userData, message: 'Success'})
      } catch (e) {
         console.log(e)
         next(e)
      }
   }

   async login(req, res, next){
      try {
         const { email, password } = req.body

         const userData = await userService.login(email, password)

         res.cookie('refreshToken', userData.refreshToken, {
            maxAge: 30 * 24 * 60 * 10 * 1000, // 30d
            httpOnly: true // Эти куки нельзя получать из браузера с помощью js
         })

         return res.json({data: userData, message: 'Success'})
      } catch (e) {
         console.log(e)
         next(e)
      }
   }

   async logout(req, res, next){
      try {
         const { refreshToken } = req.cookies
         const token = await userService.logout(refreshToken)
         res.clearCookie('refreshToken')

         return res.json({data: token, message: 'Success'})
      } catch (e) {
         console.log(e)
         next(e)
      }
   }

   async activate(req, res, next){
      try {
         const { activateLinkId } = req.params

          await userService.activate(activateLinkId)
    
         return res.redirect(
            'https://www.google.com/'
            // process.env.CLIENT_URL
            )
      } catch (e) {
         console.log(e)
         next(e)
      }
   }

   async resetPassword(req, res, next){
      //TODO CHECK IF ACCESS LINK IS NOT EXPIRED!
      try {
         const { accessLink } = req.params;

         const { newPassword } = req.body;

         const user = await userService.resetPassword({ newPassword, accessLink });
    
         return res.json({
            data: user,
            message: 'Password was changed succesfully'
         });
      } catch (e) {
         console.log(e)
         next(e)
      }
   }

   async forgotPasswordByEmail(req, res, next){
      try {
         const { email } = req.body

         const { temproraryLink } = await userService.forgotPasswordByEmail(email);

         return res.json({
            data: temproraryLink,
            message: 'Email was sended'
         })
      } catch (e) {
         console.log(e)
         next(e)
      }
   }

   async refresh(req, res, next){
      try {
         const { refreshToken } = req.cookies

         const userData = await userService.refresh(refreshToken)

         res.cookie('refreshToken', userData.refreshToken, {
            maxAge: 30 * 24 * 60 * 10 * 1000, // 30d
            httpOnly: true // Эти куки нельзя получать из браузера с помощью js
         })
         return res.json({data: userData, message: 'Success'})
      } catch (e) {
         console.log(e)
         next(e)
      }
   }

   async checkValidateUserByJWT(req, res, next){
      try {
         const user = await userService.fetchUserById(req.user.id)

         return res.json({data: user, message: `User ${user.email} authorized`})
      } catch (e) {
         console.log(e)
         next(e)
      }
   }

   async fetchUsers(_, res, next){
      try {
         const users = await userService.fetchUsers()

         return res.json({data: users, message: 'Success'})
      } catch (e) {
         console.log(e)
         next(e)
      }
   }

   async loginByOAuthGoogle(req, res, next){
      const errors = validationResult(req)

      if(!errors.isEmpty()){
         next(ApiError.BadRequest('Something went wrong', errors))
      }

      const { email } = req.body

      const userData = await userService.loginByOAuthGoogle(email);

      res.cookie('refreshToken', userData.refreshToken, {
         maxAge: 30 * 24 * 60 * 10 * 1000, // 30d
         httpOnly: true // Эти куки нельзя получать из браузера с помощью js
      })

      res.json({data: userData, message: 'Success'})
   }

   //!TODO 
   async loginByOAuthGithub(req, res, next){
      const errors = validationResult(req)

      if(!errors.isEmpty()){
         next(ApiError.BadRequest('Something went wrong', errors))
      }

      const code = req.query.code;

      try {
         const accessToken = await userService.getAccessTokenByOAuthGithub(code)

         const userData = await userService.getUserDataByAccessTokenOAuthGithub(accessToken);

         res.json({data: userData, message: 'Success'})
      } catch (e) {
         console.log(e)
         next(e)
      }
   }
}

module.exports = new UserContoller