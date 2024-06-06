const { validationResult } = require('express-validator');
const ApiError = require('../exeptions/api-error');
const userService = require('../service/user.service');

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

         return res.json(userData)
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

         return res.json(userData)
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

         return res.json(token)
      } catch (e) {
         console.log(e)
         next(e)
      }
   }

   async activate(req, res, next){
      console.log('heeeere')

      try {
         const { activateLinkId } = req.params
         console.log('activateLinkId', req.params)
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
   async refresh(req, res, next){
      try {
         const { refreshToken } = req.cookies
         console.log(refreshToken)
         const userData = await userService.refresh(refreshToken)

         res.cookie('refreshToken', userData.refreshToken, {
            maxAge: 30 * 24 * 60 * 10 * 1000, // 30d
            httpOnly: true // Эти куки нельзя получать из браузера с помощью js
         })
         return res.json(userData)
      } catch (e) {
         console.log(e)
         next(e)
      }
   }
   async fetchUsers(_, res, next){
      try {
         const users = await userService.fetchUsers()

         return res.json(users)
      } catch (e) {
         console.log(e)
         next(e)
      }
   }
}

module.exports = new UserContoller