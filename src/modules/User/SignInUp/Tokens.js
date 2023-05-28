const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.resolve("src/dbconn/connection"));

module.exports = sequelize.define("tokens", {
  tokenId: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    unique: true,
  },
  token: {
    type: Sequelize.TEXT(),
    allowNull: false,
  },
  invalidated: {
    type: Sequelize.ENUM("1", "0"),
    allowNull: false,
    defaultValue: "0",
  },
});
