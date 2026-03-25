import { Sequelize } from "sequelize";
import { dbConfig } from "../config/dbConfig.js";


const sequelize =  new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,{
        host:dbConfig.HOST,
        dialect:dbConfig.dialect,
        pool:{
            max:dbConfig.max,
            min:dbConfig.min,
            acquire:dbConfig.acquire,
            idle:dbConfig.idle
        }
    }
)

import "../../models/index.js";
const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync();
    console.log("✅ Tables synced");
  } catch (error) {
    console.error("❌ DB connection failed:", error);
  }
};

initDB();

export default sequelize;
