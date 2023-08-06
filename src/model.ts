import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  phone: { type: String, default: null },
  isEmailActive: { type: Boolean, default: false },
  isPhoneActive: { type: Boolean, default: false },
  token: { type: String },
});

export const DB_User = mongoose.model("users", UserSchema);

export class Register {
  email: String;
  password: String;
  firstName: String;
  lastName: String;
  confirmPassword: String;
  recaptcha: String;
}

export class credentialCard {
  _id?: String;
  email?: String;
  password?: String;
}
export class tokenCard {
  id: String;
  email: String;
  isSuperUser?: String;
}

export class DashCard {
  email: String;
  firstName: String;
  lastName: String;
  phone: String;
  isEmailActive: boolean;
  isPhoneActive: boolean;
}
export let DashMask = {
  _id: 0,
  password: 0,
  // phone: 0,
  __v: 0,
};

export class AuthInfo {
  isAuthenticated: boolean;
  token: String;
  expiration: number;
  email: String;
  role: String;
}

export class LoginRequest {
  email: String;
  password: String;
}

export class PageUsers {
  totalUsers: number;
  users: User[];
}

export class LoginResponse {
  success: boolean;
  token: String;
  expiresInMinutes: number;
  message: String;
  email: String;
  role: String;
}
export class PasswordChange {
  password: String;
  confirmPassword: String;
}

export class ResetPassword {
  email: String;
  password: String;
  confirmPassword: String;
  code: String;
}

export class Role {
  name: String;
  description: String;
}

export class User {
  rowVersion: String;
  id: String;
  firstName: String;
  lastName: String;
  email: String;
  password: String;
  confirmPassword: String;
  role: String;
  approved: boolean;
}
