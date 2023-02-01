import User from '../models/user'
import { hashPassword, comparePassword } from '../utils/auth'
import jwt from 'jsonwebtoken'
import nanoid from 'nanoid'       // to generate unique string Ids

// aws
import AWS from 'aws-sdk';

// configuring aws
const awsConfig = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    apiVersion: process.env.AWS_API_VERSION,
}

const SES = new AWS.SES(awsConfig);

// register function
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


// logIn
export const login = async (req, res) => {

    try {
        // console.log(req.body);
        // destructure data received from client 
        const { email, password } = req.body;

        // check if user with that email is registered in the database
        const user = await User.findOne({ email }).exec();
        // if user is not present that means user needs to register before  login
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

// log out
export const logout = async (req, res) => {
    try {
        // while logIn we sent the cookie, now for log out we clear the cookie (cookie named as token in logIn controller)
        res.clearCookie("token");
        return res.json({ message: "Signed Out Successfully" });
    } catch (err) {
        console.log("Error : ", err);
    }
}


// this controller function is to get valid user
export const currentUser = async (req, res) => {
    try {
        //                                             the ' - ' sign before property means exclude that info    
        const user = await User.findById(req.auth._id).select('-password').exec();
        console.log("Current User", user);
        // return res.json(user);
        return res.json({ ok: true });
    } catch (err) {
        console.log("Error : ", err);
    }
}


// sending test email using AWS SES
// export const sendEmail = async (req, res) => {
//     try {
//         // return res.json({ok: true});
//         // return res.status(200).send("Email Sent");
//         // return res.status(200).json({message: "Email sent bro"})

//          // below is template on how to prepare a parameter with email template that has to be sent
//         const params = {
//             Source: process.env.EMAIL_FROM,
//             Destination: {
//                 ToAddresses: ['ranjeet2019ec027abesit@gmail.com'],
//             },
//             ReplyToAddresses: [process.env.EMAIL_FROM],
//             Message: {
//                 Body: {
//                     Html: {
//                         Charset: "UTF-8",
//                         Data: `
//                             <html>
//                                 <h1> RESET Password Link </h1>
//                                 <p>use following link to reset your password</p>
//                             </html>
//                         `,
//                     },
//                 },
//                 Subject: {
//                     Charset: "UTF-8",
//                     Data: "Password Reset Link",
//                 }
//             }
//         }

//         const emailSent = SES.sendEmail(params).promise();

//         emailSent.then((data) => {
//             console.log(data);
//             res.json({ ok: true });
//         })
//             .catch((err) => {
//                 console.log(err);
//             })

//     } catch (err) {
//         console.log("Email Sending Failed  ", err);
//     }
// }

export const forgotPassword = async (req, res) => {
    try {
        // get email from requested body
        const { email } = req.body;
        // console.log(email);

        // creating a short code
        const shortCode = nanoid(6).toUpperCase();

        // find if user exists with that email or not
        //                                      find user based on email and set passwordResetCode
        const user = await User.findOneAndUpdate({ email }, { passwordResetCode: shortCode });

        if (!user) {
            return res.status(400).send("User Doesn't Exists!");
        }

        // param for email to be sent
        const params = {
            Source: process.env.EMAIL_FROM,
            Destination: {
                ToAddresses: [email],
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: `
                            <html>
                                <h1> RESET Password Link </h1>
                                <p>use following code to reset your password</p>
                                <h2>${shortCode}</h2>
                                <i>LMS Platform</i>
                            </html>
                        `,
                    },
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: "Password Reset",
                }
            }
        }

        const emailSent = SES.sendEmail(params).promise();

        emailSent
            .then((data) => {
                console.log("Email sent : ", data);
                res.json({ ok: true });
            })
            .catch((err) => {
                console.log("AWS email send error : ", err);
            })

    } catch (err) {
        console.log("Forgot Password Error : ", err);
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        // console.table({email, code, newPassword});

        // hash the new password
        const hashedPassword = await hashPassword(newPassword);

        // find user using emal and password reset code
        const user = User.findOneAndUpdate({
            email,
            passwordResetCode: code,
        },
            {
                // update the password
                password: hashedPassword,
                // set back password reset code to empty string
                passwordResetCode: "",
            }
        ).exec();

        res.json({ ok: true });

    } catch (err) {
        console.log("Reset Password Error : ", err);
    }
}