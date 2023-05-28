"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.createTable("accounts", {
      accounttokenId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
      },
      value: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      tenure: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("1", "0"),
        allowNull: false,
        defaultValue: "0",
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
    queryInterface.dropTable("accounts");
  },
};
