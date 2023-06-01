const Sequelize = require("sequelize");
const path = require("path");
const sequelize = require(path.resolve("src/dbconn/connection"));

module.exports = sequelize.define("users", {
  userId: {
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
  referrer:{
    type: Sequelize.INTEGER(11),
    allowNull: true,
  },
  firstName:{
    type: Sequelize.STRING(30),
    allowNull: true,
  },
  lastName:{
    type: Sequelize.STRING(30),
    allowNull: true,
  },
  dob:{
    type: Sequelize.DATE(),
    allowNull: true,
  },
  address:{
    type: Sequelize.TEXT(),
    allowNull: true,
  },
  role:{
    type: Sequelize.STRING(30),
    allowNull: true,
  },
  status: {
    type: Sequelize.ENUM("1", "0"),
    allowNull: false,
    defaultValue: "0",
  },
});


