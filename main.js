var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");

require("dotenv").config();

var app = express();
var port = process.env.port || "3000";

users_route = require("./routes/user");
recipes_route = require("./routes/recipe");

app.use(logger("dev"))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/user", users_route);
app.use("/recipe", recipes_route);


app.get("/", function(req, res) {
    res.send("Hello World")
});

// error middleware
app.use(function(err, req, res, next) {
    res.status(500).send("Error: " + err);
});

app.listen(port, () => {
  console.log(`app listening on port ${port}!`);
});