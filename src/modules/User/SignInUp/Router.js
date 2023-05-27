const express = require("express");
const router = express.Router();
const path = require("path");
const Utils = require(path.resolve("src/utils"));
const Service = require(path.resolve("src/modules/User/SignInUp/Services"))
const md5 = require("md5");
const { joiMiddleware } = require(path.resolve("src/initializer/framework"));
const { signUpSchema, signInSchema, resetpassword, passwordresetcode } =  require(path.resolve("src/modules/user/SignInUp/Schema"));
const {
    jwtAuthenticate,
    jwtAuthorise,
  } = require(path.resolve("src/jwt/jwt-auth-authorize"));


router.get("/user/:id", jwtAuthorise(), async(req, res) => {
    // let resultSet = {
    //     message:"User Signin-up module",
    //     result:[],
    //     totalRows:0
    // };
    // console.log('req:', req)
    req.offset = 0;
    req.limit = 10;
    req.userId = req.params.id;
    var resultSet = await Service.getAUser(req); 

    await Utils.retrunResponse(res, resultSet);
});

router.get("/users", jwtAuthorise(), async(req, res) => {
    if(req.hasOwnProperty('invalidToken')){
        let resultSet = {
        message:"Access Denied, please check your token",
        result:[],
        totalRows:0
        };
        await Utils.retrunResponse(res, resultSet);
    }

    req.offset = 0;
    req.limit = 10;
    req.cond = {status:"1"};
    console.log('invalidToken:', req)
    var resultSet = await Service.getUsers(req); 

    await Utils.retrunResponse(res, resultSet);
})

router.post("/", joiMiddleware(signUpSchema), async(req, res) => {
    const randomString = await Utils.generateRandomString(8); 
    req.body = {
        userName:randomString,
        email:randomString+"@mailinator.com",
        password:md5(randomString),
        referrer:null
      }

    var resultSet = await Service.signUp(req); 
    await Utils.retrunResponse(res, resultSet);
})

router.get("/activate/:activationCode",  async(req, res) => {
    console.log(req.params.activationCode)
     // Get the current time in milliseconds

    let resultSet = await Service.activate({activationCode:req.params.activationCode})
    await Utils.retrunResponse(res, resultSet);
})

router.post("/signin", joiMiddleware(signInSchema), jwtAuthenticate(),  async(req, res) => {  })

router.post("/passwordresetcode", joiMiddleware(passwordresetcode), async(req, res) => {
    const email = req.body.email;
    var resultSet = await Service.sendpasswordresetcode(email); 
    await Utils.retrunResponse(res, resultSet);

})


router.post("/resetpassword", joiMiddleware(resetpassword), async(req, res) => {
    const reqBody = req.body;
    var resultSet = await Service.resetpassword(reqBody); 
    await Utils.retrunResponse(res, resultSet);

})

module.exports = router;