const express = require("express");
const { PORT } = require("./config");
const connectDB = require("./config/connectDB");
const expressLayouts = require("express-ejs-layouts");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
const path = require("path");

const app = express();

// Import path
app.use(express.static(__dirname + "/public"));
app.use(cors());
// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

// Bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieparser());

// Import router
app.use("/admin", require("./routes/admin"));

app.listen(PORT, connectDB, () => {
  console.log(`Server running at ${PORT}`);
});
