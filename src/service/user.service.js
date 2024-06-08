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
      const activationLink = `${process.env.API_URL}/api/auth/activate/${linkName}`

      const User = await UserModel.create({
         email,
         password: hashPassword,
         isActivated: false,
         activationLink: linkName
      })
      
      const userData = new UserDto(User)
      
      await emailService.sendMailWithActivationLink(email, activationLink)
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

   async forgotPasswordByEmail(email){
      const user = await UserModel.findOne({ email });
      
      const { temporaryLink: link } = tokenService.generateTemporaryLink({ email: user.email })

      const temproraryLink = `${process.env.CLIENT_URL}/auth/reset-password?accessLink=${link}`

      await emailService.sendMailWithActivationLink(user.email, temproraryLink)

      return {temproraryLink}
   }

   async resetPassword({ newPassword, accessLink }){
      const activeLink = tokenService.verifyTemproraryLink(accessLink)
      const user = await UserModel.findOne({ email: activeLink?.email });
      
      if(!activeLink) {
         throw ApiError.BadRequest('Link expired')
      }

      if(!user){
         throw ApiError.BadRequest('This user is not exist')

      }

      const hashPassword = await bcrypt.hash(newPassword, 4)

      
      user.password = hashPassword;

      user.save();

      return user
   }

   async refresh(refreshToken) {
      if(!refreshToken){
         throw ApiError.UnauthorizedError()
      }

      const userData = tokenService.verifyRefreshToken(refreshToken)
      const tokenFromDb = await tokenService.findOne(refreshToken)

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

   async fetchUserById(id){
      const user = await UserModel.findById(id)
      return user
    }
}

module.exports = new UserService