const express = require("express");
const mongoose = require("mongoose");
const env = require("dotenv");
const cors = require("cors");

env.config();
const app = express();
const PORT = process.env.PORT || 3030;
const MongoDB = process.env.MongoDB;

console.log("MongoDB", MongoDB);
mongoose
  .connect(MongoDB)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.json());

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));

// Routes


app.get("/", (req, res) => {
  res.send("hello!");
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
