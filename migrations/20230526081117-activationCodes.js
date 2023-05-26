"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.createTable("activationcodes", {
      activationcodeId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
      },
      userId:{
        type: Sequelize.INTEGER(11),
        allowNull: false,
        unique: true
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
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("now"),
      }
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.dropTable("activationcodes");
  },
};
