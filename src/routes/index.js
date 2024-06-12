const Router = require('express').Router;
const userConroller = require('../controller/user.controller')
const {body} = require('express-validator')
const authMiddleware = require('../middleware/auth.middleware')
const router = Router();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

router.post('/auth/login',
   body('email').isEmail(),
   body('password').isLength({ min: 3, max: 25 }),
userConroller.login
)
router.post('/auth/registration',
   body('email').isEmail(),
   body('password').isLength({ min: 3, max: 25}),
userConroller.registration
)

router.post('/auth/forgot-password',
   body('email').isEmail(),
   userConroller.forgotPasswordByEmail
)

router.post('/auth/reset-password/:accessLink',
   body('password').isLength({ min: 3, max: 25 }),
   userConroller.resetPassword
)

router.post('/auth/login-oauth-google',
   body('email').isEmail(),
   userConroller.loginByOAuthGoogle
)

router.post('/auth/login-oauth-github',
   userConroller.loginByOAuthGithub
)


router.get('/auth/logout', userConroller.logout)
router.get('/auth/activate/:activateLinkId', userConroller.activate)
router.get('/auth/refresh', userConroller.refresh)

router.get('/auth/check', authMiddleware, userConroller.checkValidateUserByJWT)
router.get('/auth/users',authMiddleware, userConroller.fetchUsers)



module.exports = router