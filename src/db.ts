import bcrypt from "bcryptjs";
import {
  DB_User,
  DashMask,
  DashUpdateCard,
  Register,
  credentialCard,
} from "./model.js";
import { DashRequest, DashUpRequest } from "./consts.js";

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

export async function DB_updateDash(
  user: credentialCard,
  params: DashUpdateCard
) {
  const { _id } = user;
  let updObj: DashUpdateCard = {};
  for (let fieldName in params) {
    if (params.hasOwnProperty(fieldName)) {
      if (DashUpRequest.hasOwnProperty(fieldName)) {
        updObj[fieldName] = params[fieldName];
      }
    }
  }
  // console.log("updating", updObj);
  const _dashboard = await DB_User.updateOne({ _id }, updObj);
  // console.log(_dashboard);
  return _dashboard?.ok ? _dashboard.ok : false;
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

export async function DB_verfyEmail(user: credentialCard) {
  const { _id } = user;
  let updObj = { isEmailActive: true };
  const _dashboard = await DB_User.updateOne({ _id }, updObj);
  return _dashboard?.ok ? _dashboard.ok : false;
}
