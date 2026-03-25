'use strict';

export default  {

  async up(queryInterface, Sequelize) {

    // remove phone
    await queryInterface.removeColumn('students', 'phone');

    // add email
    await queryInterface.addColumn('students', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });

    // add password
    await queryInterface.addColumn('students', 'password', {
      type: Sequelize.STRING,
      allowNull: false
    });

  },

  async down(queryInterface, Sequelize) {

    // add phone back
    await queryInterface.addColumn('students', 'phone', {
      type: Sequelize.STRING
    });

    // remove email
    await queryInterface.removeColumn('students', 'email');

    // remove password
    await queryInterface.removeColumn('students', 'password');

  }

};