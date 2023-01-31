// the purpose of this middleware file is to protect pages that we want to show only specific users by verifying token

const { expressjwt: expressJwt } = require("express-jwt");

// below is a require sign in middleWare i.e. this middleware when applied to any route, will only allow to view the page when user is signed In
export const requireSignIn = expressJwt({
    getToken: (req, res) => req.cookies.token,
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
});