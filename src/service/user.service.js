const UserModel = require('../models/User/User.model');
const ApiError = require('../exeptions/api-error');
const bcrypt = require('bcrypt');
const emailService = require('./email.service')
const { v4: uuidv4 } = require('uuid')
const UserDto = require('../dto/UserDto');
const tokenService = require('./token.service');

class UserService {
   async registration(email, password){
      const candidate = await UserModel.findOne( { email } )

      if(!!candidate){
         throw ApiError.BadRequest('Such a user already exists')
      }

      const hashPassword = await bcrypt.hash(password, 4)
      const linkName = uuidv4()
      const activationLink = `${process.env.API_URL}/api/activate/${linkName}`

      const User = await UserModel.create({
         email,
         password: hashPassword,
         isActivated: false,
         activationLink: linkName
      })
      
      const userData = new UserDto(User)
      
      await emailService.sendMail(email, activationLink)
      const tokens = tokenService.generateTokens({...userData})

      await tokenService.saveRefreshToken(userData.id, tokens.refreshToken)

      return {...tokens, user: userData}

   }
   async login(email, password){
      const candidate = await UserModel.findOne( { email } )

      if(!candidate){
         throw ApiError.BadRequest('There is no such user')
      }

      const userData = new UserDto(candidate)

      const verifyPassword = await bcrypt.compare(password, userData.password)

      if(!verifyPassword){
         throw ApiError.BadRequest('Incorrect password')
      }

      const tokens = tokenService.generateTokens({...userData})
      await tokenService.saveRefreshToken(userData.id, tokens.refreshToken)

      return {...tokens, user: userData}
   }
   async logout(refreshToken){
      const token = await tokenService.removeToken(refreshToken)
      return token
   }

   async activate(activateLinkId){

      const user = await UserModel.findOne({ activationLink: activateLinkId })
 
      user.isActivated = true
 
      await user.save()

      return user
   }
   async refresh(refreshToken) {
      if(!refreshToken){
         throw ApiError.UnauthorizedError()
      }

      const userData = tokenService.verifyRefreshToken(refreshToken)
      const tokenFromDb = await tokenService.findOne(refreshToken)
      console.log('userData', userData)
      if(!userData || !tokenFromDb){
         throw ApiError.UnauthorizedError()
      }

      const userDto = new UserDto(userData)
      const tokens = tokenService.generateTokens({...userDto})

      await tokenService.saveRefreshToken(userData.id, tokens.refreshToken)

      return {...tokens, user: userDto}

   }
   async fetchUsers(){
     const users = await UserModel.find()
     return users
   }
}

module.exports = new UserService