const AuthRouter = require('express')
const AuthController = require('./Authentication.controllers')
const authrouter = AuthRouter();

authrouter.post('/signup', AuthController.signUp);

authrouter.post('/signin', AuthController.signIn);

authrouter.post('/verifyotp', AuthController.verifyOtp);

module.exports = authrouter;