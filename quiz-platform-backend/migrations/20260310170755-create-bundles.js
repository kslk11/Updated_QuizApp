'use strict';

export default  {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('bundles', {

      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      client_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false
      },

      description: {
        type: Sequelize.TEXT
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
      is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    });

  },

  async down(queryInterface) {
    await queryInterface.dropTable('bundles');
  }
};