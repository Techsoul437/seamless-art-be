import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes/index.js";
import connectDB from "./config/db.js";

dotenv.config();
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.urlencoded({ extended: false }));

app.use("/", routes);

app.get("/", (req, res) => {
  res.send("Seamless's backend is up and running!");
});

const PORT = process.env.PORT || 8000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server listening on port ${PORT}`);
  });
});

export default app;
