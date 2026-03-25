import { DataTypes } from "sequelize";
import sequelize from "../src/config/sequelizeConfig.js";

const Client = sequelize.define(
  "Client",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    contact_number: {
      type: DataTypes.STRING,
    },

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    tableName: "clients",
    timestamps: true,
    paranoid: true,
  }
);

export default Client;