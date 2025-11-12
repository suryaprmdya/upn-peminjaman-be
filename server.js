import express from "express";
import db from "./config/db.js";
import allRoute from "./routes/index.js";

const app = express();

const port = process.env.PORT || 3000;

db.then(() => {
  console.log("success connect to mongoDB");
}).catch(() => {
  console.log("failed connect to mongoDB");
});

app.use(cors())
// Middleware CORS dengan konfigurasi cookie-friendly
// app.use(cors({
//   origin: "http://localhost:5173", // alamat frontend
//   credentials: true, // wajib agar cookies dikirim
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }));

app.get("/", (req, res) => {
  res.send("Hello this is from Web Service Express");
});

app.use(express.urlencoded({extended: true}));
app.use(express.json());
// app.use(cookieParser());
app.use(allRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
