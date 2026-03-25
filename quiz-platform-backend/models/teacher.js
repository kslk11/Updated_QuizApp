import { DataTypes } from "sequelize";
import sequelize from "../src/config/sequelizeConfig.js";

const Teacher = sequelize.define("Teacher", {
  
  id: { 
    type: DataTypes.INTEGER, 
    autoIncrement: true, 
    primaryKey: true 
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "users", key: "id" },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  },

  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "clients", key: "id" },
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
  },

  specialization: {
    type: DataTypes.STRING,
    allowNull: true
  },

  experience_years: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  status: {
    type: DataTypes.ENUM("active", "inactive"),
    defaultValue: "active"
  }

}, {
  tableName: "teachers",
  timestamps: true,
  paranoid: true
});

export default Teacher;