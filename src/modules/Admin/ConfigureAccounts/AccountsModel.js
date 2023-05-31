const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.resolve("src/dbconn/connection"));

module.exports = sequelize.define("accounts", {
  accountId: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING(256),
    allowNull: false,
  },
  value: {
    type: Sequelize.STRING(256),
    allowNull: false,
  },
  tenure: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
  accounttypeId: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
  },
  status: {
    type: Sequelize.ENUM("1", "0"),
    allowNull: false,
    defaultValue: "1",
  },
});
