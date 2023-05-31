const path = require("path");
const Utils = require(path.resolve("src/utils"));
const AdminModel = require(path.resolve("src/modules/Admin/Login/AdminModel"));
const { Op } = require("sequelize");
const md5 = require("md5");

var self = (module.exports = {
  login: async (obj) => {
    const admin = await Utils.findOne({
      model: AdminModel,
      excludes: ["password", "referrer"],
      fetchRowCond: {
        [Op.and]: [
          { email: obj.email },
          { password: md5(obj.password) },
          { status: 1 },
        ],
      },
    });

    if (!admin.resultSet) {
      admin.ValidationErrors = {
        Error: "Invalid credentials, please chek your userid and password",
      };
      return await Utils.returnResult("userCreation", admin);
    }

    return admin
      ? await Utils.returnResult("admin", admin)
      : await Utils.returnResult("admin", admin, "No record found");
  },
});
