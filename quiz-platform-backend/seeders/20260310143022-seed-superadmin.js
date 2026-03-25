'use strict';
import bcrypt from 'bcrypt'
export default {

  async up(queryInterface, Sequelize) {

    const hashPassword = await bcrypt.hash('admin123', 10);

    await queryInterface.bulkInsert('users', [

      {
        name:"admin",
        age:25,
        email: 'admin@quiz.com',
        password: hashPassword,
        role_id: 1,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

    ]);
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('users', { email: 'admin@quiz.com' }, {});
  }
};