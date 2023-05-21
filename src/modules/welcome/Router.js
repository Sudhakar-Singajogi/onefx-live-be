const express = require("express");
const router = express.Router();
const path = require("path");
const Utils = require(path.resolve("src/utils"));

router.get("/", async(req, res) => {
    let resultSet = {
        message:"Welcome to the moudlar approach of express",
        result:[],
        totalRows:0
    };

    await Utils.retrunResponse(res, resultSet);
})

module.exports = router;