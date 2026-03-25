import { DataTypes } from "sequelize";
import sequelize from "../src/config/sequelizeConfig.js";

const QuizAttempt = sequelize.define(
  "QuizAttempt",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    set_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "sets", key: "id" },
      onDelete: "CASCADE",
    },

    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    submitted_at: {
      type: DataTypes.DATE,
    },

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    tableName: "quiz_attempts",
    timestamps: true,
    paranoid: true,
  },
);

export default QuizAttempt;
