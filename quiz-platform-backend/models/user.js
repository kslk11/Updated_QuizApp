import { DataTypes } from "sequelize";
import sequelize from "../src/config/sequelizeConfig.js";


const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  name: { type: DataTypes.STRING, allowNull: false },
  age: { type: DataTypes.INTEGER },

  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },

  role_id: { type: DataTypes.INTEGER, allowNull: false },

  status: { type: DataTypes.BOOLEAN, defaultValue: true },

}, {
  tableName: "users",
  timestamps: true,
  paranoid: true,
});

export default User