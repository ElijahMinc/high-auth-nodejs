const Router = require('express').Router;
const userConroller = require('../controller/user.controller')
const {body} = require('express-validator')
const authMiddleware = require('../middleware/auth.middleware')
const router = Router();


router.post('/auth/login',
   body('email').isEmail(),
   body('password').isLength({ min: 3, max: 10 }),
userConroller.login
)
router.post('/auth/registration',
   body('email').isEmail(),
   body('password').isLength({ min: 3, max: 10 }),
userConroller.registration
)

router.post('/auth/forgot-password',
   body('email').isEmail(),
   userConroller.forgotPasswordByEmail
)

router.post('/auth/reset-password/:accessLink',
   body('password').isLength({ min: 3, max: 10 }),
   userConroller.resetPassword
)


router.get('/auth/logout', userConroller.logout)
router.get('/auth/activate/:activateLinkId', userConroller.activate)
router.get('/auth/refresh', userConroller.refresh)

router.get('/auth/check', authMiddleware, userConroller.checkValidateUserByJWT)
router.get('/auth/users',authMiddleware, userConroller.fetchUsers)



module.exports = router