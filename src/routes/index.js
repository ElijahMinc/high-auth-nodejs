const Router = require('express').Router;
const userConroller = require('../controller/user.controller')
const {body} = require('express-validator')
const authMiddleware = require('../middleware/auth.middleware')
const router = Router();


router.post('/login',
   body('email').isEmail(),
   body('password').isLength({ min: 3, max: 10 }),
userConroller.login
)
router.post('/registration',
   body('email').isEmail(),
   body('password').isLength({ min: 3, max: 10 }),
userConroller.registration
)
router.get('/logout', userConroller.logout)
router.get('/activate/:activateLinkId', userConroller.activate)
router.get('/refresh', userConroller.refresh)
router.get('/users',authMiddleware, userConroller.fetchUsers)



module.exports = router