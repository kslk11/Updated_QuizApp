'use strict';

export default  {
  async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert('roles', [

      {
        id: 1,
        name: 'superadmin',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        id: 2,
        name: 'client',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      {
        id: 3,
        name: 'student',
        createdAt: new Date(),
        updatedAt: new Date()
      }

    ]);
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('roles', null, {});
  }
};