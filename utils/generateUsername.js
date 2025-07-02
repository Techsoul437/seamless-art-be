import User from "../models/userModel.js";

export const generateUsername = async (name) => {
  const base = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
  let username = base;
  let counter = 1;

  while (await User.findOne({ username })) {
    username = `${base}-${counter++}`;
  }

  return username;
};
