import express from "express"   // used to build the server

import cors from "cors"         // cross origin resource sharing, frontend and backend
                                // will be running on different server, so that there
                                // is no error we are using cors.

const morgan = require("morgan"); // helps to get endpoints in our console, used for debugging.

require("dotenv").config();     // to access environment variables


// creating an EXPRESS app
// with this 'app' created using express, we can deal with middlewares and routes
const app = express();

// MIDDLEWARE - middlewares are piece of code which are run before sending response to client(i.e. front end)
                // middlewares should always be a function.
// we use 'use' keyword to use middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
// example of user defined middleware
// app.use((req, res, next)=>{
//     console.log("This middleware is created by a user");

//     // just so that server does not stop we can use next();
//     next(); // formally next is used to perform further operations like we can send or route user to a different 
//             // path after this middleware is executed.
// })


// ROUTES - where the client is requesting is specified by routes (for example logIn or SignUp or Upload, Download)
// we use 'get' keyword for routes
// get(endpoint, function_to_execute)
app.get('/', (req, res)=>{
    res.send('You Hit Server EndPoint');
})

// on which port we want to run our backend server (the port should be different than the port where frontEnd is running)
const port = process.env.PORT || 8000;

// finally we can listen to our server by using listen funtion provided by express
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})