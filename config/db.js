//const result = require("dotenv").config();
//console.log("dotenv result:", result);
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
//const mongoose = require("mongoose");

const mongoURI = process.env.MONGO_URI;

//console.log(mongoURI);

//const mongoURI =process.env.MONGO_DB_URI
const connectToMongo = () => {
  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log("Connected to Mongo Successfully");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
};
export default connectToMongo;
//module.exports = connectToMongo;
