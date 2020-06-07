const DButils = require(".././DButils");
const axios = require('axios');
var express = require("express");
var router = express.Router();


router.get("/randomRecipes", async function (req, res) {
    axios.get(`https://api.spoonacular.com/recipes/random?number=3&apiKey=${process.env.spooncular_apiKey}`)
    .then(resp => {
        res.status(200).send(resp.data)
    })
    .catch(error => {
        console.log(error)
        res.send('401')
    })    
});

// router.post("/lastViewedRecipes", function (req, res) {
    
// });

// router.post("/recipeDetailes", function (req, res) {
    
// });

router.post("/like", async function (req, res) {
    let recipeID = req.body.recipe_id;
    await addLikeToRecipe(recipeID);
    res.send('200')  
});


addLikeToRecipe = async function(recipeID){
    let recipe = await DButils.execQuery(`SELECT recipe_id, popularity FROM [dbo].[recipes] WHERE recipe_id = ${recipeID}`);
    let likes = recipe[0].popularity+1;
    await DButils.execQuery(`UPDATE [dbo].[recipes] SET popularity=${likes} WHERE recipe_id = ${recipeID}`);
}

module.exports = router;