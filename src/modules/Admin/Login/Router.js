const express = require("express");
const router = express.Router();
const path = require("path");
const md5 = require("md5");
const Utils = require(path.resolve("src/utils"));

const userService = require(path.resolve("src/modules/User/SignInUp/Services"));

const AdminModel = require(path.resolve("src/modules/Admin/Login/AdminModel"));
const { joiMiddleware } = require(path.resolve("src/initializer/framework"));
const { adminLoginSchema } = require(path.resolve(
  "src/modules/Admin/Login/Schema"
));
const { jwtAuthenticate, jwtAuthorise } = require(path.resolve(
  "src/jwt/jwt-auth-authorize"
));

router.post(
  "/",
  joiMiddleware(adminLoginSchema),
  jwtAuthenticate(AdminModel),
  async (req, res) => {}
);

router.get("/getUsers", jwtAuthorise(), async (req, res) => {
    req.offset = 0;
    req.limit = 10;

    const resultSet = await userService.getUsers(req)
    await Utils.retrunResponse(res, resultSet);
});

router.get("/getAUser/:id", jwtAuthorise(), async (req, res) => {
    req.userId = req.params.id;
    const resultSet = await userService.getAUser(req)
    await Utils.retrunResponse(res, resultSet);
});

module.exports = router;
