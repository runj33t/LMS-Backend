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

// controllers
import { register } from '../controllers/auth'

// post request means data coming from the client side.
router.post('/register', register);

module.exports = router;