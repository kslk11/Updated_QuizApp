import { DataTypes } from "sequelize";
import sequelize from "../src/config/sequelizeConfig.js";

const Course = sequelize.define("Course", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  name: { type: DataTypes.STRING, allowNull: false },

  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "clients", key: "id" },
    onDelete: "CASCADE",
  },

}, {
  tableName: "courses",
  timestamps: true,
  paranoid: true,
});

export default Course