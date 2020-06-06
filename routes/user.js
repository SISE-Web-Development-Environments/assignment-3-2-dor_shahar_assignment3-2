router.post("/getFavorites", function (req, res) {
    res.send("favorites")
});

router.post("/myRecipes", function (req, res) {
    res.send("my recipes")
});

module.exports = router;