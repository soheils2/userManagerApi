import jwt from "jsonwebtoken";
import "dotenv/config";
import { DB_getUser } from "./db.js";
const config = process.env;

async function verifyToken(req, res, next) {
  try {
    // console.log("verfyng", req.url);

    if (req.url == "/api/register" || req.url == "/api/login") {
      const { email, password, isSuperUser } = req.body;

      let pattern =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      let ismailValid = pattern.test(email);
      let isPassValid = password?.length > 3;
      if (!(ismailValid && isPassValid)) {
        return res.status(401).json("invalid type of inputs");
      }
      req.isSuperUser = isSuperUser;
      req.creds = {
        email,
        password,
      };

      return next();
    }
    const token = req.token;

    if (!token) {
      return res.status(401).json("Not Authorized");
    }
    try {
      const decoded = jwt.verify(token, config.TOKEN_KEY);

      const { email, isSuperUser } = decoded;

      req.isSuperUser = String(isSuperUser);
      req.creds = {
        email,
      };
      const isUserExist = await DB_getUser({ email });
      if (!isUserExist || isUserExist.Blocked) {
        return res
          .status(400)
          .json("User Blocked or Deleted (Suspended By Admin)");
      }
    } catch (err) {
      console.log("err", err);

      return res.status(401).json("Invalid Token");
    }
    return next();
  } catch (err) {
    console.log("AUTH ERROR: ", err);
    return res.status(401).json(err.message);
  }
}

export default verifyToken;
