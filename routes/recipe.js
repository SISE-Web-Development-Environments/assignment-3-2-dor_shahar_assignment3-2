var express = require("express");
var router = express.Router();
var axios = require("axios");
var searcher = require("./utils/search_recipes");

// router.get("/randomRecipes", function (req, res) {
    
// });

// router.post("/recipeDetailes", function (req, res) {
    
// });

router.get("/searchRecipe/query/:searchQuery/recipesNum/:num", async function (req, res, next) {
    try{
        search_params = {};
        search_params.query = req.params.searchQuery;
        search_params.number = req.params.num;
        search_params.instructionsRequired = true;
        extractExtraParams(req.query, search_params);

        recipes_info =  await searchForRecipes(search_params);
        res.send(recipes_info);
        } catch(err) {
            next(err)
    }
});

// router.post("/like", function (req, res) {
    
// });

extractExtraParams = function(query_params, search_params) {
    const params_list = ["diet", "cuisine", "intolerance"];
    params_list.forEach((param) => {
        if(query_params[param])
            search_params[param] = query_params[param];
    });
}

searchForRecipes = async function(search_params) {
    let search_response = await axios.get(
        `https://api.spoonacular.com/recipes/search?apiKey=${process.env.spooncular_apiKey}`,
        {
            params: search_params
        }
    );

    const recipes_id_list = extractResultId(search_response);
    let info_arr = await searcher.getRecipeDetails(recipes_id_list);
    return info_arr;
}

extractResultId = function(search_results) {
    let recipes = search_results.data.results;
    id_res = [];
    recipes.map((recipe) => {
        id_res.push(recipe.id);
    });

    return id_res;
}

module.exports = router;