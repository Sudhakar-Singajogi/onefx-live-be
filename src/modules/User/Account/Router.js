const express = require("express");
const router = express.Router();
const path = require("path");
const Utils = require(path.resolve("src/utils"));
const {
    jwtAuthenticate,
    jwtAuthorise,
  } = require(path.resolve("src/jwt/jwt-auth-authorize"));

const Service = require(path.resolve("src/modules/User/Account/Services"))
const md5 = require("md5");
const { joiMiddleware } = require(path.resolve("src/initializer/framework"));
const {  } =  require(path.resolve("src/modules/user/Account/Schema"));

router.get('list', async(req, res) => {
    
})

module.exports = router;