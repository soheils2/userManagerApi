import sha1 from "sha1";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import bearerToken from "express-bearer-token";
import verifyToken from "./auth.js";
import router from "./router.js";
import "dotenv/config";

const { MONGO_URI } = process.env;
const port = process.env.PORT || 8080;

const app = express()
  .use(cors())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded())
  .use(bearerToken())
  .use(verifyToken)
  .use(router());

mongoose.connect(MONGO_URI).then(() => {
  console.log("Connected to database");
  app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
  });
});
