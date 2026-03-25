import { DataTypes } from "sequelize";
import sequelize from "../src/config/sequelizeConfig.js";

const BatchTeacher = sequelize.define("BatchTeacher", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  batch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "batches", key: "id" },
    onDelete: "CASCADE",
  },

  teacher_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "teachers", key: "id" },
    onDelete: "CASCADE",
  },

  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "clients", key: "id" },
    onDelete: "CASCADE",
  },

}, {
  tableName: "batch_teacher_mapping",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["batch_id", "teacher_id"],
    },
  ],
});
export default BatchTeacher