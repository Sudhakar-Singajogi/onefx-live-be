const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.resolve("src/dbconn/connection"));

module.exports = sequelize.define("admins", {
  adminId: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  email:{
    type: Sequelize.STRING(30),
    allowNull: false,
    unique: true,
  },
  password:{
    type: Sequelize.STRING(30),
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM("1", "0"),
    allowNull: false,
    defaultValue: "0",
  },
  role: {
    type: Sequelize.STRING(256),
    allowNull: false,
    defaultValue: "admin",
  },
});


