'use strict';

export default  {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('clients', {

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

      company_name: {
        type: Sequelize.STRING
      },

      contact_number: {
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
      }

    });

  },

  async down(queryInterface) {
    await queryInterface.dropTable('clients');
  }
};