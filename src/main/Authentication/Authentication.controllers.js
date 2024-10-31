const authScript = require("./Authentication.scripts");


const signUp = (req,res)  => {
    authScript.authSignUp(req,res);
}

const signIn = (req,res)  => {
    authScript.authSignIn(req,res);
}

const verifyOtp = (req,res)  => {
    authScript.verifyOtp(req,res);
}

const verifyToken = (req,res)  => {
    authScript.verifyToken(req,res);
}

const verifyRefreshToken = (req,res)  => {
    authScript.verifyRefreshTokenAndAssign(req,res);
}

module.exports = {
    signUp,
    signIn,
    verifyOtp,
    verifyToken,
    verifyRefreshToken
}