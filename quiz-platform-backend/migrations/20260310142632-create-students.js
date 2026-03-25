'use strict';

export default  {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('students', {

      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        }
      },

      name: {
        type: Sequelize.STRING
      },

      phone: {
        type: Sequelize.STRING
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      deletedAt: {
        type: Sequelize.DATE
      },
      
    });

  },

  async down(queryInterface) {
    await queryInterface.dropTable('students');
  }
};