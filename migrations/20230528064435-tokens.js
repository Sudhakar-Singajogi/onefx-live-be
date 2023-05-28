"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.createTable("tokens", {
      tokenId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING(256),
        allowNull: false,
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
    queryInterface.dropTable("tokens");
  },
};
