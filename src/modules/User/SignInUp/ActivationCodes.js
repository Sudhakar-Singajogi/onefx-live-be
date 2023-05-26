const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.resolve("src/dbconn/connection"));

module.exports = sequelize.define("activationcodes", {
  activationcodeId: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    unique: true,
  },
  code: {
    type: Sequelize.STRING(300),
    allowNull: false,
  },
  expiryTime: {
    type: Sequelize.STRING(256),
    allowNull: false,
    unique: true,
  },
});
