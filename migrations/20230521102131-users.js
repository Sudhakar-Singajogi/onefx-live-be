'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    
    queryInterface.createTable("users", {
      userId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
      },
      userName:{
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      email:{
        type: Sequelize.STRING(256),
        allowNull: false,
        unique: true,
      },
      password:{
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      referrerId:{
        type: Sequelize.INTEGER(11),
        allowNull: true,
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

    })
  },

  async down (queryInterface, Sequelize) {
    queryInterface.dropTable("users");
  }
};
