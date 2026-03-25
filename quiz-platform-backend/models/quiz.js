import { DataTypes } from "sequelize";
import sequelize from "../src/config/sequelizeConfig.js";

const Quiz = sequelize.define("Quiz", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  title: { type: DataTypes.STRING, allowNull: false },

  duration: { type: DataTypes.INTEGER }, // ✅ KEPT
  total_marks: { type: DataTypes.INTEGER }, // ✅ KEPT

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
  tableName: "quizzes",
  timestamps: true,
  paranoid: true,
});

export default Quiz