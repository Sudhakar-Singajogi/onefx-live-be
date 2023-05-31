const express = require("express");
const router = express.Router();
const path = require("path");
const Utils = require(path.resolve("src/utils"));
const { joiMiddleware } = require(path.resolve("src/initializer/framework"));
const {updateAccounts} = require(path.resolve(
  "src/modules/Admin/ConfigureAccounts/Schema"
));
const { jwtAuthorise } = require(path.resolve(
  "src/jwt/jwt-auth-authorize"
));
const service= require(path.resolve('src/modules/Admin/ConfigureAccounts/Services'));

router.get("/getaccounts", jwtAuthorise(), async(req, res) => {
    const resultSet = await service.getAccounts({
        offset:0,
        limit:10,
        cond:{accounttypeId:2}
    });
    await Utils.retrunResponse(res, resultSet);
});

router.patch("/accounts", jwtAuthorise(), joiMiddleware(updateAccounts), async(req, res) => {

    const resultSet = await service.updateAccounts( {body:req.body} );
    await Utils.retrunResponse(res, resultSet);
});


router.post("/", jwtAuthorise(),  async(req, res) => {
    const resultSet = await service.create(req);
    await Utils.retrunResponse(res, resultSet);
})
module.exports = router;