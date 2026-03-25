'use strict';

export default {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('questions', {

      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      quiz_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'quizzes',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      question: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      option_a: {
        type: Sequelize.STRING
      },

      option_b: {
        type: Sequelize.STRING
      },

      option_c: {
        type: Sequelize.STRING
      },

      option_d: {
        type: Sequelize.STRING
      },

      correct_answer: {
        type: Sequelize.STRING
      },

      marks: {
        type: Sequelize.INTEGER,
        defaultValue: 1
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
    await queryInterface.dropTable('questions');
  }
};