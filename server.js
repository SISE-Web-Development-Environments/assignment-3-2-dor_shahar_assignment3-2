const DButils = require("./DButils")

var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var session = require("client-sessions")

require("dotenv").config();

var app = express();
var port = process.env.PORT || 3000;

var cors = require('cors');

const corsConfig = {
  origin: true,
  credentials: true
};

app.use(cors(corsConfig));
app.options("*", cors(corsConfig));


users_route = require("./routes/user");
recipes_route = require("./routes/recipe");
auth_route = require("./routes/auth")

app.use(logger("dev"))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    cookieName: process.env.COOKIE_NAME,
    secret: process.env.COOKIE_SECRET,
    duration: 20 * 60 * 1000,
    activeDuration: 0,
    cookie: {
      httpOnly: false
    }
  })
);

app.use("/user", users_route);
app.use("/recipe", recipes_route);
app.use(auth_route)


app.get("/", function(req, res) {
    res.send("Hello World")
});

// error middleware
app.use(function(err, req, res, next) {
    res.send("500");
});

app.listen(port, () => {
  console.log(`app listening on port ${port}!`);
});