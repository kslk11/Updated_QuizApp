'use strict';

export default  {

  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('students', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn('students', 'user_id');

  }

};
