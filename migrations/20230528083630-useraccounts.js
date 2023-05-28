"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.createTable("useraccounts", {
      useraccounttokenId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.STRING(256),
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
    queryInterface.dropTable("useraccounts");
  },
};
