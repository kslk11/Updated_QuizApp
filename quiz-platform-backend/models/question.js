
import { DataTypes } from "sequelize";
import sequelize from "../src/config/sequelizeConfig.js";

const Question = sequelize.define("Question", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  set_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "sets", key: "id" },
    onDelete: "CASCADE",
  },

  question: { type: DataTypes.TEXT, allowNull: false },

  option_a: { type: DataTypes.STRING, allowNull: false },
  option_b: { type: DataTypes.STRING, allowNull: false },
  option_c: { type: DataTypes.STRING, allowNull: false },
  option_d: { type: DataTypes.STRING, allowNull: false },

  correct_answer: { type: DataTypes.STRING, allowNull: false },

  marks: { type: DataTypes.INTEGER, defaultValue: 1 },

}, {
  tableName: "questions",
  timestamps: true,
  paranoid: true,
});
export default Question