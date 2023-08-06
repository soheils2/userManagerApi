import express from "express";
import { DB_User, DashCard, LoginResponse, Register } from "./model.js";
import * as dataModels from "./consts.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DB_addUser, DB_getDash, DB_getUser, DB_getUsersList } from "./db.js";

function createRouter() {
  const router = express.Router();

  router.post("/api/register", async (req, res) => {
    try {
      const _reqRegiter: Register = {
        ...dataModels.RegisterRequest,
        ...(req.body as Register),
      };
      console.log("checking", _reqRegiter);

      if (
        !(
          _reqRegiter.firstName &&
          _reqRegiter.lastName &&
          _reqRegiter.email &&
          _reqRegiter.password &&
          _reqRegiter.confirmPassword &&
          _reqRegiter.recaptcha
        )
      ) {
        res.status(400).json("All input is required");
      }
      const { email, password } = _reqRegiter;

      // check if user already exist
      const oldUser = await DB_getUser({ email });
      if (oldUser) {
        return res.status(409).json("User Already Exist. Please Login");
      }

      // Create user in our database
      const user = await DB_addUser({ email, password });

      // Create token
      const token = jwt.sign({ email }, process.env.TOKEN_KEY, {
        expiresIn: process.env.TOKEN_EXP,
      });
      let _rsp: LoginResponse = {
        ...dataModels.LoginSuccesUser,
        token,
        email,
      };
      res.status(200).json(_rsp);
    } catch (err) {
      console.log(err);
    }
    // Our register logic ends here
  });

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
          const token = jwt.sign({ email }, process.env.TOKEN_KEY, {
            expiresIn: process.env.TOKEN_EXP + "m",
          });

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

  router.get("/api/dash", async (req, res) => {
    const { email } = req?.["creds"];
    console.log("req?.[creds]", req?.["creds"]);

    if (req?.["isSuperUser"] == "true") {
      console.log("super user");
      let _rsp: DashCard = {
        ...dataModels.DashRequest,
        email,
        isEmailActive: true,
      };
      res.status(200).json(_rsp);
    } else {
      const _userCard = await DB_getDash({ email });

      // res.status(200).json(userCard);

      const _rsp: DashCard = {
        ...dataModels.DashRequest,
        ..._userCard,
      };

      res.status(200).json(_rsp);
    }
  });

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
