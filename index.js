const express = require("express");
const { PORT } = require("./config");
const connectDB = require("./config/connectDB");
const expressLayouts = require("express-ejs-layouts");
const cookieparser = require("cookie-parser");

const app = express();

// Import path
app.use(express.static(__dirname + "/public"));

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

// Bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser());

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type, Authorization"
  );
  next();
});

// Import router
app.use("/admin", require("./routes/admin"));

app.listen(PORT, connectDB, () => {
  console.log(`Server running at ${PORT}`);
});
