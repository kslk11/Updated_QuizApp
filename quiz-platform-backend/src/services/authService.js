import userRepo from "../repositories/userRepo.js";
import { comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

const login = async (data) => {

  const user = await userRepo.findUserByEmail(data.email);

  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await comparePassword(
    data.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const token = generateToken(user);

  return {
    token,
    user
  };
};

export default {
  login
};