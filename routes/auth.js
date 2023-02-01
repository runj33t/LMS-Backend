import express from 'express'

const router = express.Router(); // by doing this we get Router functionality in router variable

// registeration route
// router.get('/register', (req, res) => {
//     res.send('User Register');
// });

// in large applications we might be having many things ongoing inside a route like working with 
// databases, logics and functionality, so its better to put that code in a separate area.
// i.e. we can make use of CONTROLLERS - controllers are nothing but functions that can be called
//      wherever required.

// middlewares
import { requireSignIn } from '../middleware';

// controllers
import { register, login, logout, currentUser, forgotPassword, resetPassword } from '../controllers/auth'

// post request means data coming from the client side.
router.post('/register', register);

// login
router.post('/login', login);

// logout
router.get('/logout', logout);

// to get the current user
router.get('/current-user', requireSignIn, currentUser);

//  testing send Email via SES AWS  // you need to import sendEmail controller from controller auth
// router.get('/send-email', sendEmail);

// forgot password routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;