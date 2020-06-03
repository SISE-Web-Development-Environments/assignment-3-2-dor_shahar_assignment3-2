var express = require("express");
var router = express.Router();

router.post("/register", function (req, res) {
    
});

router.post("/login", function (req, res) {
    res.send("login")
});

router.post("/getFavorites", function (req, res) {
    res.send("favorites")
});

router.post("/myRecipes", function (req, res) {
    res.send("my recipes")
});


module.exports = router;