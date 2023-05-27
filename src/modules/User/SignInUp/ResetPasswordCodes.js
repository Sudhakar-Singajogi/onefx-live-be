const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.resolve("src/dbconn/connection"));

module.exports = sequelize.define("resetpwdcodes", {
  resetpwdcodeId: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: Sequelize.STRING(30),
    allowNull: false,
    unique: true,
  },
  code: {
    type: Sequelize.STRING(30),
    allowNull: false,
  },
  expiryTime: {
    type: Sequelize.STRING(256),
    allowNull: false,
    unique: true,
  },
});
