import { DashCard, DashUpdateCard, LoginResponse, Register } from "./model.js";

export const LoginSuccesUser: LoginResponse = {
  token: "",
  email: "",
  expiresInMinutes: parseInt(process.env.TOKEN_EXP),
  success: true,
  message: "welcome",
  role: "user",
};
export const LoginSuccesSupport: LoginResponse = {
  token: "",
  email: "",
  expiresInMinutes: parseInt(process.env.TOKEN_EXP),
  success: true,
  message: "welcome",
  role: "support",
};

export const RegisterRequest: Register = {
  firstName: "",
  lastName: "",
  email: null,
  password: null,
  confirmPassword: null,
  recaptcha: null,
};

export const DashRequest: DashCard = {
  email: null,
  firstName: null,
  lastName: null,
  phone: null,
  isEmailActive: false,
  isPhoneActive: false,
};
export const DashUpRequest: DashUpdateCard = {
  email: null,
  firstName: null,
  lastName: null,
  phone: null,
};
