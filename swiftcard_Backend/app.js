const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const app = express();

morgan.token("time", () => {
  return new Date().toLocaleTimeString();
});

const customFormat =
  "[:time] :method :url :status :response-time ms - :res[content-length]";

app.use(morgan(customFormat));
app.use(express.json());
app.use("/swift-card/users", require("./routes/user"));
app.use("/swift-card/users/login", require("./routes/login"));

app.use(cors());
const PORT = process.env.PORT ?? 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to DB");
    app.listen(PORT, () => {
      console.log(`listening to port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Could not connect to DB", err);
  });
