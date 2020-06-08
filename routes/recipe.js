const DButils = require(".././DButils");
const axios = require('axios');
var express = require("express");
search_recipes = require("./utils/search_recipes");
var router = express.Router();
User

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

router.post("/recipeDetailes", async function (req, res) {
    let recipe_id = req.body.recipe_id;
    await search_recipes.getRecipeDetails([recipe_id]);

});

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