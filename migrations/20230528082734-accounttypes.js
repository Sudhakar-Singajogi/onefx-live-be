"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.createTable("accounttypes", {
      accounttypeId: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("1", "0"),
        allowNull: false,
        defaultValue: "1",
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

    // Insert values into the table
    await queryInterface.bulkInsert('accounttypes', [
      { name: 'Basic'},
      { name: 'Custom'}, 
      // Add more rows as needed
    ]);
  },

  async down(queryInterface, Sequelize) {
    queryInterface.dropTable("accounttypes");
  },
};
