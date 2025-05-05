import dotenv from "dotenv";
import connectToMongo from "./config/db.js";
import express from "express";
import cors from "cors";
import auth from "./routes/auth.js";
import notes from "./routes/notes.js";
dotenv.config();

connectToMongo(); // Establish MongoDB connection

const app = express();
const port = process.env.PORT || 5000;
//Available Routes
const allowedOrigins = [process.env.frontend_url, process.env.frontend_url1];
app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "auth-token"],
  })
);
//app.use(cors({ origin: 'https://i-notebook-one-delta.vercel.app' }))
app.use(express.json()); //t be able to use req.body

app.use("/api/auth", auth);
app.use("/api/notes", notes);

app.listen(port, () => {
  console.log(`MyNotes backend listening at ${port}`);
});
