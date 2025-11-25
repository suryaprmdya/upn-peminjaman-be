import express from "express";
import cors from "cors";
import db from "./config/db.js";
import allRoute from "./routes/index.js";
import cookieParser from "cookie-parser";

const app = express();

const port = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://upn-peminjaman-fe.vercel.app",
];

db.then(() => {
  console.log("success connect to mongoDB");
}).catch(() => {
  console.log("failed connect to mongoDB");
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// app.use(cors())
// Middleware CORS dengan konfigurasi cookie-friendly
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests without origin (mobile app, POSTMAN, server-side)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true); // allow
    } else {
      callback(new Error("Not allowed by CORS")); // block
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.get("/", (req, res) => {
  res.send("Hello this is from Web Service Express");
});

app.use(allRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
