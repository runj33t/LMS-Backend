import User from '../models/user'
import { hashPassword, comparePassword } from '../utils/auth'
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
    //

    try {
        // console.log(req.body);

        // destructuring the data received
        const { name, email, password, confirmPassword } = req.body;

        // ***** validation
        // if anything is breaks rules of validation we will respond with 400 status code
        // 400 status code is a HTTP Bad Request code indicates server cannot or will not proceed due to 
        // something that is perceived to be a client error.
        if (!name) return res.status(400).send("Name is required");      // name is required

        if (!password || password.length < 6) {
            return res.status(400).send("Password is required and should be min 6 characters longs");   // length of password
        }

        if (password !== confirmPassword) {
            return res.status(400).send("Password and Confirm Password should be same !");       // confirm passwrod should be same
        }

        // below code finds if the email already registered in the database, if so it will find one
        let userExist = await User.findOne({ email }).exec();     // findOne method provided by mongoDb to find in the database
        //                     exec() is used to execute this querry, here exec() is a part of mongoose not javascript method 

        // if userExist return email is already registered or taken
        if (userExist) return res.status(400).send("Email already exists");

        // ***** hash the password
        const hashedPassword = await hashPassword(password);

        // register new user in the data base
        const user = await new User({             // new keyword is used to create a new entry based on model we have created.
            name,
            email,
            password: hashedPassword,
        }).save();

        console.log("User Saved ", user);
        return res.json({ ok: true });

    } catch (err) {
        console.log(err);
        return res.status(400).send("Error. Try again.");
    }
}

export const login = async (req, res) => {

    try {
        // console.log(req.body);
        // destructure data received from client 
        const { email, password } = req.body;

        // check if user with that email is registered in the database
        const user = await User.findOne({ email }).exec();
        if (!user) return res.status(400).send("User does not exit!");

        // check password
        const Password_Check = await comparePassword(password, user.password);

        if (!Password_Check) {
            return res.status(400).send("Wrong Password. Try Again");
        } else {
            // create a JWT
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "7d",
            });

            // except password, send user and token back to the client
            user.password = undefined;
            // send token in cookie
            res.cookie("token", token, {
                httpOnly: true,
                // secure: true,           // works for https only with ssl certificate
            });

            // send user as json response 
            res.json(user);
        }

    } catch (err) {
        console.log(err);
        return res.status(400).send("Try Again");
    }

}