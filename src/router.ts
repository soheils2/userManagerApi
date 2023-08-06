import express from "express";
import { DB_User, DashCard, LoginResponse, Register } from "./model.js";
import * as dataModels from "./consts.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DB_addUser, DB_getDash, DB_getUser, DB_getUsersList } from "./db.js";

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
          req.body.firstName &&
          req.body.lastName &&
          req.body.email &&
          req.body.password &&
          req.body.confirmPassword &&
          req.body.recaptcha
        )
      ) {
        res.status(401).json("All input is required");
      }

      const _reqRegiter: Register = {
        ...dataModels.RegisterRequest, //* preSet data in case of undefined pointers
        firstName: req.body.firstName.trim(),
        lastName: req.body.lastName.trim(),
        email: req.body.email.trim(),
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
      console.log("user created:", user);

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
          process.env.ADMIN_USER == email &&
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
   * @method: <post>("/api/getusers")
   * @param:
   * @header: <BearerToken>
   * @returns: tokenIncludes(isSuperUser)
   *           ? <DashCard[Limit:none]>{  email: String, firstName: String, lastName: String, phone: String, isEmailActive: boolean, isPhoneActive: boolean,}
   */
  router.get("/api/getusers", async (req, res) => {
    if (req?.["isSuperUser"] == "true") {
      const usersList = await DB_getUsersList();
      res.status(200).json(usersList);
    } else {
      res.status(400).json("not SuperUser!");
    }
  });

  return router;
}

export default createRouter;
