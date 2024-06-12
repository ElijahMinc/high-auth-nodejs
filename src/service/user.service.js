const UserModel = require('../models/User/User.model');
const ApiError = require('../exeptions/api-error');
const bcrypt = require('bcrypt');
const emailService = require('./email.service')
const { v4: uuidv4 } = require('uuid')
const UserDto = require('../dto/UserDto');
const tokenService = require('./token.service');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))
const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, githubOAuthURL } = require('../utils/loginByOAuthGithub.constant')

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

    async loginByOAuthGoogle(email){
      let userData = null;
      let candidate = await UserModel.findOne( { email } )

      if(!candidate){
         const linkName = uuidv4()
         const activationLink = `${process.env.API_URL}/api/auth/activate/${linkName}`
   
         const User = await UserModel.create({
            email,
            password: '',
            isActivated: false,
            activationLink: linkName
         })
         console.log('User', User)
         userData = new UserDto(User)
         
         await emailService.sendMailWithActivationLink(email, activationLink)
      }else{
         userData = new UserDto(candidate)
      }



      const tokens = tokenService.generateTokens({...userData});

      await tokenService.saveRefreshToken(userData.id, tokens.refreshToken)

      return {...tokens, user: userData}
    }


    async getAccessTokenByOAuthGithub(code){
      const params = `?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}&code=${code}`;
      console.log('params' ,params)
      const res = await fetch('https://github.com/login/oauth/access_token' + params, {
         method: 'POST',
         headers: {
            'Content-Type': "application/json"
         }
      })
      console.log('res', res)
      
      const accessToken = await res.json();
      console.log('accessToken', accessToken)
      return accessToken
    }

    async getUserDataByAccessTokenOAuthGithub(accessToken){
     const params = `?client_id=${GITHUB_CLIENT_ID}&client_secret=${GITHUB_CLIENT_SECRET}`;

     const res =  await fetch('https://api.github.com/user' + params, {
         method: 'GET',
         headers: {
            'Authorization': `Bearer: ${accessToken}`
         }
      })

      const userData = await res.json()
    
     const tokens = await tokenService.generateAccessToken(userData)

      return { user: userData, ...tokens };
    }
}

module.exports = new UserService