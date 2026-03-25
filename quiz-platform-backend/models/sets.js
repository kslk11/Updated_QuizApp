import { DataTypes } from "sequelize";
import sequelize from "../src/config/sequelizeConfig.js";

const Set = sequelize.define("Set", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  quiz_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "quizzes", key: "id" },
    onDelete: "CASCADE",
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

}, {
  tableName: "sets",
  timestamps: true,
  paranoid: true,
});

export default Set