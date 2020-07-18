
const DButils = require(".././DButils")

var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var app = express()
var searcher = require("./utils/search_recipes")
var helper = require("../routes/utils/helper")
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.use(async function (req, res, next) {
    try{
        if(req.session && req.session.user_id){
            const id = req.session.user_id;
            const user = (await DButils.execQuery(`SELECT * FROM [dbo].[users] WHERE user_id=${id}`));
            if(user.length>0){
                req.user = user[0];
                next();
            }
        } else{
            res.sendStatus(401);
        }
    } catch(err) {
        next(err)
    }
});

router.post("/createNewRecipe", async function (req, res, next) {
    try{
        let recipe_data = req.body;
        let user_id = req.user.user_id;
        
        await createRecipe(recipe_data, user_id);

        res.status(200).send("Recipe created");
    } catch (err) {
        res.status(406).send("There was a problem with the recipe details");
    }
});

router.post('/addToFavorites', async function(req, res, next) {
    try{
        let user_id = req.user.user_id;
        let recipe_to_favorites = req.body.recipe;
        
        if(!await helper.isFavorite(user_id, recipe_to_favorites)) {
            await DButils.execQuery(`INSERT INTO [dbo].[favorites] VALUES ('${user_id}','${recipe_to_favorites}')`);
            res.status(200).send("Added to favorites successfully");
        }
        else
            res.status(401).send("Recipe is already in favorites");
        
    } catch(err) {
        next(err);
    }
});

router.post('/addToSeen', async function(req, res, next) {
    try{
        let user_id = req.user.user_id;
        let recipe_to_seen = req.body.recipe;
        
        if(!await helper.isSeen(user_id, recipe_to_seen)) {
            await DButils.execQuery(`INSERT INTO [dbo].[Views] VALUES ('${user_id}','${recipe_to_seen}')`);
            res.status(200).send("Added to Seen successfully");
        }
        else
            res.status(401).send("Recipe is already in Seen");
        
    } catch(err) {
        next(err);
    }
});

router.get("/getFavorites", async function (req, res, next) {
    try{
        let user_id = req.user.user_id;
        my_favorites = await getUserfavorites(user_id);
        res.send(my_favorites);
    } catch (err) {
        next(err);
    }
});

router.get("/myRecipes", async function (req, res, next) {
    try{
        let user_id = req.user.user_id;
        my_recipes = await getUserRecipes(user_id);
        res.send(my_recipes);
    } catch (err) {
        next(err);
    }
});

/** Returns the last viewed recipes for the given user */
router.get("/lastViewedRecipes", async function (req, res, next) {
    try {
        let user_id = req.user.user_id;
        let recipes_ids = await DButils.execQuery(`SELECT ls_1, ls_2, ls_3 FROM [dbo].[users] WHERE user_id = ${user_id}`);
        let recipe_deatails = await searcher.getRecipeDetails(Object.values(recipes_ids[0]))
        res.status(200).send(recipe_deatails);
    } catch(err) {
        next(err);
    }
});

router.get("/myFamilyRecipes", async function (req, res, next) {
    try{
        let user_id = req.user.user_id;
        my_family_recipes = await getUserFamilyRecipes(user_id);
        res.send(my_family_recipes);
    } catch (err) {
        next(err);
    }
});


getUserRecipes = async function(user_id) {
    my_recipes = await DButils.execQuery(`SELECT * FROM [dbo].[recipes] WHERE [created_by]=${user_id}`)
    return my_recipes.map((my_recipes) => {
        const {
            image,
            name,
            ingredients,
            instructions,
            preperation_time,
            popularity,
            vegeterian,
            vegan,
            gluten,
            num_of_dishes
        } = my_recipes
        return {
            image: image,
            name: name,
            ingredients: ingredients,
            instructions: instructions,
            preperationTime: preperation_time,
            popularity: popularity,
            vegeterian: vegeterian,
            vegan: vegan,
            isGlutenFree: gluten,
            dishesNum: num_of_dishes
        }
    })
}

getUserFamilyRecipes = async function(user_id) {
    my_recipes = await DButils.execQuery(`SELECT * FROM [dbo].[familyRecipes] WHERE [created_by]=${user_id}`)
    return my_recipes.map((my_recipes) => {
        const {
            image,
            name,
            ingredients,
            instructions,
            preperation_time,
            popularity,
            vegeterian,
            vegan,
            gluten,
            num_of_dishes,
            given_by,
            preperation_events
        } = my_recipes
        return {
            image: image,
            name: name,
            ingredients: ingredients,
            instructions: instructions,
            preperationTime: preperation_time,
            popularity: popularity,
            vegeterian: vegeterian,
            vegan: vegan,
            isGlutenFree: gluten,
            dishesNum: num_of_dishes,
            givenBy: given_by,
            preperationEvents: preperation_events
        }
    })
}

getUserfavorites = async function(user_id) {
    my_favorites = await DButils.execQuery(`SELECT [recipe_id] FROM [dbo].[favorites] WHERE [user_id]=${user_id}`);
    recipe_id = []
    my_favorites.map((recipe) => {
        recipe_id.push(recipe.recipe_id);
    });
    favorite_recipes = await searcher.getRecipeDetails(recipe_id);
    return favorite_recipes;
}

createRecipe = async function(recipe_data, creator_user_id) {
    const {
        image,
        name,
        preperationTime,
        veganOrVegetarian,
        isGlutenFree,
        ingredients,
        instructions,
        dishesNum
    } = recipe_data;

    await DButils.execQuery(`INSERT INTO [dbo].[recipes] VALUES (
        '${name}',
        '${image}',
        '${ingredients}',
        '${instructions}',
        ${preperationTime},
        0,
        ${veganOrVegetarian},
        ${isGlutenFree},
        ${dishesNum},
        ${creator_user_id}
        )`)
}

/** areange the last viewd recipes according to the current viewed recipe */
arrangeLastViewd = function(recipe_id, last_viewd){
    orgenaized = {
        ls_1: recipe_id,
        ls_2: last_viewd.ls_1,
        ls_3: last_viewd.ls_2
    }
    if (recipe_id == last_viewd.ls_2){
        orgenaized.ls_3 = last_viewd.ls_3
    }
    if (recipe_id == last_viewd.ls_1){
        return last_viewd;
    }
    return orgenaized;
}



module.exports = router;