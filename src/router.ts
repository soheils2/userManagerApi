import express from "express";
import {
  DB_User,
  DashCard,
  DashUpdateCard,
  LoginResponse,
  PageUsers,
  Register,
  tokenCard,
  vrTokenCard,
} from "./model.js";
import * as dataModels from "./consts.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  DB_addUser,
  DB_getDash,
  DB_getUser,
  DB_getUsersList,
  DB_updateDash,
  DB_verfyEmail,
} from "./db.js";
import { sendVerficationEmail } from "./SMTP.js";

function createRouter() {
  const router = express.Router();
  /*
   * @method: <post>("/api/register")
   * @param: <Form><Register>{ email: String, password: String, confirmPassword: String, firstName: String, lastName: String, recaptcha: String}
   * @returns: <LoginResponse>{ success: boolean, token: String, expiresInMinutes: number, message: String, email: String, role: String,}
  //  ! *  @TODO1: check patterns
  //  ! *  @TODO2: check password matches confirmPassword
   ! *  @TODO3: Expand OLD <credentialCard> -> <Register> to DataBase
   ! *  @TODO4: check recaptcha is True
   ! *  @TODO5: send Confirmation Email
   */
  router.post("/api/register", async (req, res) => {
    try {
      if (
        !(
          req.body.hasOwnProperty("firstName") &&
          req.body.hasOwnProperty("lastName") &&
          req.body.hasOwnProperty("email") &&
          req.body.hasOwnProperty("password") &&
          req.body.hasOwnProperty("confirmPassword") &&
          req.body.hasOwnProperty("recaptcha")
        )
      ) {
        res.status(401).json("All input is required");
      }

      const _reqRegiter: Register = {
        ...dataModels.RegisterRequest, //* preSet data in case of undefined pointers
        firstName: req.body.firstName.trim(),
        lastName: req.body.lastName.trim(),
        email: req.body.email.trim().toLowerCase(),
        password: req.body.password.trim(),
        confirmPassword: req.body.confirmPassword.trim(),
        recaptcha: req.body.recaptcha,
      };

      if (_reqRegiter.password != _reqRegiter.confirmPassword) {
        res.status(401).json("invalid Inputs");
      }
      const { email, password } = _reqRegiter;

      // check if user already exist
      const oldUser = await DB_getUser({ email });
      if (oldUser) {
        return res.status(409).json("User Already Exist. Please Login");
      }

      // Create user in our database
      const user = await DB_addUser(_reqRegiter);
      // console.log("user created:", user);

      const verifyToken = jwt.sign(
        { vr_id: user._id, vr_email: user.email },
        process.env.VR_TOKEN_KEY,
        {
          expiresIn: "10D",
        }
      );
      let verfyLink = "http://localhost:4200/verfyEmail/" + verifyToken;
      // let verfyLink = "http://localhost:8080/api/verify/" + verifyToken;
      sendVerficationEmail(<string>_reqRegiter.email, verfyLink);

      // Create token
      const token = jwt.sign(
        { id: user._id, email, isSuperUser: false },
        process.env.TOKEN_KEY,
        {
          expiresIn: process.env.TOKEN_EXP + "m",
        }
      );
      let _rsp: LoginResponse = {
        ...dataModels.LoginSuccesUser, //* preSet data in case of undefined param
        token,
        email,
      };
      res.status(200).json(_rsp);
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });

  /*
   * @method: <post>("/api/login")
   * @param: <Form><credentialCard>{ email: String, password: String}
   * @returns: <LoginResponse>{ success: boolean; token: String, expiresInMinutes: number, message: String, email: String, role: String,}
   */
  router.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req?.["creds"];
      // Validate user input
      if (!(email && password)) {
        res.status(400).json("All input is required");
      }
      // Validate if user exist in our database
      if (req?.["isSuperUser"] == "true") {
        if (
          process.env.ADMIN_USER.toLowerCase() == email &&
          process.env.ADMIN_PASS == password
        ) {
          const token = jwt.sign(
            { email, isSuperUser: true },
            process.env.TOKEN_KEY,
            {
              expiresIn: process.env.TOKEN_EXP + "m",
            }
          );
          let _rsp: LoginResponse = {
            ...dataModels.LoginSuccesSupport,
            token,
            email,
          };
          res.status(200).json(_rsp);
        } else res.status(401).json("Invalid Credentials");
      } else {
        const user = await DB_getUser({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
          // Create token
          const token = jwt.sign(
            {
              id: user._id,
              email,
              isSuperUser: false,
            },
            process.env.TOKEN_KEY,
            {
              expiresIn: process.env.TOKEN_EXP + "m",
            }
          );

          let _rsp: LoginResponse = {
            ...dataModels.LoginSuccesUser,
            token,
            email,
          };
          res.status(200).json(_rsp);
        } else res.status(401).json("Invalid Credentials");
      }
    } catch (err) {
      console.log(err);
    }
  });

  /*
   * @method: <post>("/api/dash")
   * @param:
   * @header: <BearerToken>
   * @returns: <DashCard>{  email: String, firstName: String, lastName: String, phone: String, isEmailActive: boolean, isPhoneActive: boolean,}
   */
  router.get("/api/dash", async (req, res) => {
    const { id, email } = req?.["creds"];
    // console.log("req?.[creds]", req?.["creds"]);
    if (req?.["isSuperUser"] == "true") {
      console.log("super user");
      let _rsp: DashCard = {
        ...dataModels.DashRequest, //* preSet data in case of undefined param
        email,
        isEmailActive: true,
      };
      res.status(200).json(_rsp);
    } else {
      const _userCard = await DB_getDash({ _id: id });
      // res.status(200).json(userCard);
      const _rsp: DashCard = {
        ...dataModels.DashRequest, //* preSet data in case of undefined param
        ..._userCard,
      };
      res.status(200).json(_rsp);
    }
  });

  /*
   * @method: <put>("/api/updatedash")
   * @param: <Form><DashUpdateCard>{ email?: String, firstName?: String, lastName?: String, phone?:String}
   * @header: <BearerToken>
   * @returns: <DashCard>{  email: String, firstName: String, lastName: String, phone: String, isEmailActive: boolean, isPhoneActive: boolean,}
   */
  router.put("/api/updatedash", async (req, res) => {
    const { id, email } = req?.["creds"];

    if (req?.["isSuperUser"] == "true") {
      console.log("super user");
      //TODO update params for super user
    } else {
      // console.log("email", email);
      // console.log("req.body", req.body);

      let hsEmailChanged = false;
      if (email.toLowerCase() != req.body.email.toLowerCase()) {
        //? email has changed!
        hsEmailChanged = true;
      }
      let _inUse = false;
      console.log("hsEmailChanged", hsEmailChanged);

      if (hsEmailChanged && req.body.hasOwnProperty("email")) {
        _inUse = await DB_getUser({ email: req.body.email.toLowerCase() });
      }

      if (_inUse) res.status(400).json({ inUse: true });
      else {
        const _isUpdated = await DB_updateDash(
          { _id: id },
          req.body,
          hsEmailChanged
        );
        res.status(_isUpdated ? 200 : 400).json(_isUpdated);
      }
    }
  });

  /*
   * @method: <post>("/api/getusers")
   * @param:
   * @header: <BearerToken>
   * @returns: tokenIncludes(isSuperUser)
   *           ? <DashCard[Limit:none]>{  email: String, firstName: String, lastName: String, phone: String, isEmailActive: boolean, isPhoneActive: boolean,}
   */
  router.get("/api/getusers", async (req, res) => {
    if (req?.["isSuperUser"] == "true") {
      const usersList: DashCard[] = await DB_getUsersList();
      const rsp: PageUsers = {
        totalUsers: usersList.length,
        users: usersList,
      };
      res.status(200).json(rsp);
    } else {
      res.status(400).json("not SuperUser!");
    }
  });

  /*
   * @method: <post>("/api/resendemail")
   * @param:
   * @header: <BearerToken>
   * @returns: true|false
   */
  router.get("/api/resendemail", async (req, res) => {
    if (req?.["isSuperUser"] == "true") {
      res.status(200).json("true");
    } else {
      const { id, email } = req?.["creds"];

      const verifyToken = jwt.sign(
        { vr_id: id, vr_email: email },
        process.env.VR_TOKEN_KEY,
        {
          expiresIn: "10D",
        }
      );
      let verfyLink = "http://localhost:4200/verfyEmail/" + verifyToken;
      // let verfyLink = "http://localhost:8080/api/verify/" + verifyToken;
      sendVerficationEmail(email, verfyLink);
      console.log("id,email", id, email);
      res.status(200).json("OK");
    }
  });

  /*
   * @method: <post>("/api/verify/:verifyToken")
   * @param:
   * @header:
   * @returns: res.status(_isUpdated ? 200 : 400).json(_isUpdated);
   */
  router.get("/api/verfyEmail/:verifyToken", async (req, res) => {
    const token = req.params.verifyToken;
    try {
      const decoded = jwt.verify(token, process.env.VR_TOKEN_KEY);
      const _obj = <vrTokenCard>decoded;
      const vr_id = _obj.vr_id;
      const vr_email = _obj.vr_email;
      const isUserExist = await DB_getUser({ _id: vr_id });
      if (!isUserExist || isUserExist.Blocked) {
        return res
          .status(400)
          .json("User Blocked or Deleted (Suspended By Admin)");
      } else if (isUserExist.isEmailActive) {
        return res.status(409).json("Verfied Before");
      } else {
        const _isVerfied = await DB_verfyEmail({ _id: vr_id });

        res
          .status(_isVerfied ? 200 : 500)
          .json(_isVerfied ? "Email Verfied" : "something Bad haappnd!");
      }
    } catch (err) {
      console.log("err", err);
      return res.status(401).json("Invalid Token");
    }
    // console.log("token:", token);
    // console.log("vr_id:", vr_id);
    // console.log("vr_email:", vr_email);
  });
  return router;
}

export default createRouter;
