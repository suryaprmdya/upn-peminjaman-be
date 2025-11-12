import express from "express";
import db from "./config/db.js";

const app = express();

const port = process.env.PORT || 3000;

db.then(() => {
  console.log("success connect to mongoDB");
}).catch(() => {
  console.log("failed connect to mongoDB");
});

app.get("/", (req, res) => {
  res.send("Hello this is from Web Service Express");
});

app.use(express.urlencoded({extended: true}));
app.use(express.json());
// app.use(cookieParser());
// app.use(allRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
