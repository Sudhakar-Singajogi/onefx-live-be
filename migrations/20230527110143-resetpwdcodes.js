"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.createTable("resetpwdcodes", {
      resetpwdcodeId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING(30),
        allowNull: false, 
      },
      code: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      expiryTime: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.dropTable("resetpwdcodes");
  },
};
