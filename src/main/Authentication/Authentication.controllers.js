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

module.exports = {
    signUp,
    signIn,
    verifyOtp
}