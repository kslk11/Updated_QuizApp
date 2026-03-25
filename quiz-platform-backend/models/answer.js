import { DataTypes } from "sequelize";
import sequelize from "../src/config/sequelizeConfig.js";

const Answer = sequelize.define(
  "Answer",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    attempt_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    selected_option: {
      type: DataTypes.STRING,
    },

    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    deletedAt: DataTypes.DATE,
  },
  {
    tableName: "answers",
    timestamps: true,
    paranoid: true,
  }
);

export default Answer;