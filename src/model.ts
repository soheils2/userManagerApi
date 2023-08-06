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

export class credentialCard {
  email: string;
  password?: string;
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
  phone: 0,
  __v: 0,
};

export class AuthInfo {
  isAuthenticated: boolean;
  token: string;
  expiration: number;
  email: string;
  role: string;
}

export class LoginRequest {
  email: string;
  password: string;
}

export class PageUsers {
  totalUsers: number;
  users: User[];
}

export class LoginResponse {
  success: boolean;
  token: string;
  expiresInMinutes: number;
  message: string;
  email: string;
  role: string;
}
export class PasswordChange {
  password: string;
  confirmPassword: string;
}

export class Register {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  recaptcha: string;
}

export class ResetPassword {
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
}

export class Role {
  name: string;
  description: string;
}

export class User {
  rowVersion: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  approved: boolean;
}
