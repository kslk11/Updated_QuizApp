'use strict';

export default {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('users', 'name', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.addColumn('users', 'age', {
      type: Sequelize.INTEGER
    });

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn('users', 'name');
    await queryInterface.removeColumn('users', 'age');

  }
};