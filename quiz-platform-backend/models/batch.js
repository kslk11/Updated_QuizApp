import { DataTypes } from "sequelize";
import sequelize from "../src/config/sequelizeConfig.js";

const Batch = sequelize.define("Batch", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  name: { type: DataTypes.STRING, allowNull: false },

  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "courses", key: "id" },
    onDelete: "CASCADE",
  },

  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "clients", key: "id" },
    onDelete: "CASCADE",
  },

}, {
  tableName: "batches",
  timestamps: true,
  paranoid: true,
});

export default Batch