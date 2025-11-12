import dotenv from "dotenv";
// const dotenv = require('dotenv');
dotenv.config();
import mongoose from "mongoose";

const DB_URL = process.env.DB_URL || "mongodb:localhost/my-app";

const db = mongoose.connect(DB_URL);

// module.exports = db;
export default db;