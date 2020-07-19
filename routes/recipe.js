const DButils = require(".././DButils");
const axios = require('axios');
var express = require("express");
var router = express.Router();
var searcher = require("./utils/search_recipes");
var helper = require("./utils/helper");

/** returns 3 random recpies */
router.get("/randomRecipes", async function (req, res) {
    try {       
        let response = await axios.get(`https://api.spoonacular.com/recipes/random?number=3&apiKey=${process.env.spooncular_apiKey}`);
        let recipeDeatails = await relevantData(response.data.recipes, req.session);
        res.status(200).send(recipeDeatails)
    } catch(error) {
        res.send('503')
    }   
});

 /** Returns the Misiing Details of the recipe for display */
 router.get("/recipeDetails/:recipe_id", async function (req, res) {
    try {
        let recipe_id = parseInt(req.params.recipe_id);
        if(req.session && req.session.user_id){
            const id = req.session.user_id;
            const user = (await DButils.execQuery(`SELECT * FROM [dbo].[users] WHERE user_id=${id}`));
            if(user.length>0){
                let user_id = user[0].user_id;
                updateUserLastViewed(user_id, recipe_id);
                addToSeen(user_id, recipe_id);
            }
        }
        let recipeDeatails = undefined;
        if (recipe_id < 0) {
            recipe_id = recipe_id * -1;
            recipeDeatails = (await DButils.execQuery(`SELECT * FROM [dbo].[recipes] WHERE recipe_id=${recipe_id}`));
        } else {
            recipeDeatails = await searcher.getRecipeExtraDetails([recipe_id]);      
        }
        res.status(200).send(recipeDeatails);
    } catch(err){
        res.status(404).send("Error: Recipe wasn't found");
    }

});


router.get("/searchRecipe/query/:searchQuery/recipesNum/:num", async function (req, res) {
    try{
        search_params = {};
        search_params.query = req.params.searchQuery;
        search_params.number = req.params.num;
        search_params.instructionsRequired = true;
        extractExtraParams(req.query, search_params);

        recipes_info =  await searchForRecipes(search_params, req.session);
        res.send(recipes_info);
    } catch(err) {
        res.sendStatus(503);
    }
});

/** adds like to a curtain recipe */
router.post("/like", async function (req, res) {
    try {
        let recipeID = req.body.recipe_id;
        await addLikeToRecipe(recipeID);
        res.status(200).send("Popularity information updated") 
    } catch(err) {
        res.status(404).send('Recipe not found')  
    }
});

/** adds like to a curtain recipe - helper */
addLikeToRecipe = async function(recipeID){
    let recipe = await DButils.execQuery(`SELECT recipe_id, popularity FROM [dbo].[recipes] WHERE recipe_id = ${recipeID}`);
    let likes = recipe[0].popularity+1;
    await DButils.execQuery(`UPDATE [dbo].[recipes] SET popularity=${likes} WHERE recipe_id = ${recipeID}`);
}


extractExtraParams = function(query_params, search_params) {
    const params_list = ["diet", "cuisine", "intolerance"];
    params_list.forEach((param) => {
        if(query_params[param])
            search_params[param] = query_params[param];
    });
}

searchForRecipes = async function(search_params, session) {
    let search_response = await axios.get(
        `https://api.spoonacular.com/recipes/search?apiKey=${process.env.spooncular_apiKey}`,
        {
            params: search_params
        }
    );

    const recipes_id_list = extractResultId(search_response);
    let info_arr = await searcher.getRecipeDetails(recipes_id_list, session);
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

/** updates the last viewd recipes according to the current viewed recipe */
updateUserLastViewed = async function(user_id, recipe_id){
    let user_last_viewd = await DButils.execQuery(`SELECT ls_1, ls_2, ls_3 FROM [dbo].[users] WHERE user_id = ${user_id}`);
    user_last_viewd = arrangeLastViewd(recipe_id, user_last_viewd[0])
    await DButils.execQuery(`UPDATE [dbo].[users] SET ls_1=${user_last_viewd.ls_1}, ls_2=${user_last_viewd.ls_2}, ls_3=${user_last_viewd.ls_3} WHERE user_id = ${user_id}`);
}

/** adds the given recipe to the user seen recipes in case it not already there */
addToSeen = async function(user_id, recipe_id){
    try{
    let getSeenByUser = await DButils.execQuery(`SELECT * FROM [dbo].[Views] WHERE user_id = ${user_id} AND recipe_id = ${recipe_id}`);
    if(getSeenByUser.length == 0)
        await DButils.execQuery(`INSERT INTO [dbo].[Views] VALUES ('${user_id}','${recipe_id}')`);
    } catch(err){
        console.log(err.message);
    }
}

relevantData = async function(recipes_data, session) {
    let promises = [];
    recipes_data.map((recipes_data) => promises.push(new Promise(async function(resolve, reject){
        const {
            id,
            title,
            readyInMinutes,
            aggregateLikes,
            vegetarian,
            vegan,
            glutenFree,
            image
        } = recipes_data;
        let isFavorite = false;
        let isSeen = false;
        if(session && session.user_id) {
            isFavorite = await helper.isFavorite(session.user_id, id);
            isSeen = await helper.isSeen(session.user_id, id);
        }
        resolve( {
            id: id,
            image: image,
            name: title,
            preperation_time: readyInMinutes,
            popularity: aggregateLikes,
            vegan: vegan,
            Vegetarian: vegetarian,
            isGlutenFree: glutenFree,
            isFavorite: isFavorite,
            isSeen: isSeen
        });
    })));
    let res = await Promise.all(promises);
    return res;
}

module.exports = router;