import bcrypt from "bcryptjs";
import { DB_User, DashMask, Register, credentialCard } from "./model.js";
import { DashRequest } from "./consts.js";

export async function DB_getUser(user: credentialCard) {
  return await DB_User.findOne(user);
}

export async function DB_getDash(user: credentialCard) {
  const { _id } = user;
  const _dashboard = await DB_User.findOne({ _id }, DashMask);
  // if (_dashboard) return _dashboard;
  // else

  return _dashboard?._doc ? _dashboard._doc : _dashboard;
}

export async function DB_getUsersList() {
  const _usersList = await DB_User.find({}, DashMask);
  return _usersList;
}

export async function DB_addUser(user: Register) {
  let encryptedPassword = await bcrypt.hash(<string>user.password, 10);

  return await DB_User.create({
    ...DashRequest,
    email: user.email.toLowerCase(), // sanitize: convert email to lowercase
    password: encryptedPassword,
    firstName: user.firstName,
    lastName: user.lastName,
  });
}
