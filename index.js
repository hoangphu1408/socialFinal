const express = require("express");
const { PORT } = require("./config");
const connectDB = require("./config/connectDB");
const expressLayouts = require("express-ejs-layouts");

const app = express();

// Import path
app.use(express.static(__dirname + "/public"));

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

// Bodyparser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Import router
app.use("/admin", require("./routes/admin"));

app.listen(PORT, connectDB, () => {
  console.log(`Server running at ${PORT}`);
});
