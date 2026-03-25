'use strict';

export default {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('quizzes', {

      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      bundle_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'bundles',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false
      },

      duration: {
        type: Sequelize.INTEGER
      },

      total_marks: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('quizzes');
  }
};