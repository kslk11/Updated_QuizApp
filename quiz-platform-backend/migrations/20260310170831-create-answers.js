'use strict';

export default  {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('answers', {

      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      attempt_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'quiz_attempts',
          key: 'id'
        }
      },

      question_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'questions',
          key: 'id'
        }
      },

      selected_option: {
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
    await queryInterface.dropTable('answers');
  }
};