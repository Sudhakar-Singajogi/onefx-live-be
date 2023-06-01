const express = require("express");
const router = express.Router();
const path = require("path");
const Utils = require(path.resolve("src/utils"));
const userService = require(path.resolve("src/modules/User/SignInUp/Services"));
const md5 = require("md5");
const { joiMiddleware } = require(path.resolve("src/initializer/framework"));
const {
  signUpSchema,
  edituser,
  resetpassword,
  passwordresetcode,
} = require(path.resolve("src/modules/user/SignInUp/Schema"));
const { jwtAuthenticate, jwtAuthorise } = require(path.resolve(
  "src/jwt/jwt-auth-authorize"
));

router.get("/getusers", jwtAuthorise(), async (req, res) => {
  if (req.hasOwnProperty("invalidToken")) {
    let resultSet = {
      message: "Access Denied, please check your token",
      result: [],
      totalRows: 0,
    };
    await Utils.retrunResponse(res, resultSet);
  }

  req.offset = 0;
  req.limit = 2;
  req.cond = { status: "1" };

  var resultSet = await userService.getUsers(req);

  await Utils.retrunResponse(res, resultSet);
});

router.get("/user/:id", jwtAuthorise(), async (req, res) => {
  req.offset = 0;
  req.limit = 10;
  req.userId = req.params.id;
  var resultSet = await userService.getAUser(req);
  await Utils.retrunResponse(res, resultSet);
});

router.post("/create", joiMiddleware(signUpSchema), jwtAuthorise(), async (req, res) => {
  const reqBody = {
    ...req.body,
    password: md5(req.body.password),
    referrer: req.body.hasOwnProperty("referrer") ? req.body.referrer : null,
    role: "user",
  };

  var resultSet = await userService.signUp(reqBody);
  await Utils.retrunResponse(res, resultSet);
});

router.patch("/update-user/:id", joiMiddleware(edituser), jwtAuthorise(), async(req, res) => {
    req.body.userId = req.params.id; 
    var resultSet = await userService.updateUser(req.body);
  await Utils.retrunResponse(res, resultSet);
})

router.delete("/delete-user/:id", jwtAuthorise(), async(req, res) => {
    var resultSet = await userService.deleteUser(req.params.id);
  await Utils.retrunResponse(res, resultSet);
});

module.exports = router;
