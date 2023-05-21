const express = require("express");
const router = express.Router();
const path = require("path");
const Utils = require(path.resolve("src/utils"));
const Service = require(path.resolve("src/modules/User/SignInUp/Services"))

router.get("/user/:id", async(req, res) => {
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

router.get("/users", async(req, res) => {
    req.offset = 0;
    req.limit = 10;
    req.cond = {status:"1"};
    var resultSet = await Service.getUsers(req); 

    await Utils.retrunResponse(res, resultSet);
})

router.post("/signin", async(req, res) => {
    let resultSet = {
        message:"User Signin-up module",
        result:[],
        totalRows:0
    };

    await Utils.retrunResponse(res, resultSet);
})

router.post("/signup", async(req, res) => {
    let resultSet = {
        message:"User Signin-up module",
        result:[],
        totalRows:0
    };

    await Utils.retrunResponse(res, resultSet);
})

module.exports = router;