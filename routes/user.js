
const DButils = require(".././DButils")

var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var app = express()
var searcher = require("./utils/search_recipes")
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router. use(async function (req, res, next) {
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
        next(err);
    }
});

router.post('/addToFavorites', async function(req, res, next) {
    try{
        let user_id = req.user.user_id;
        let recipe_to_favorites = req.body.recipe;
        
        if(!await isFavorite(user_id, recipe_to_favorites)) {
            await DButils.execQuery(`INSERT INTO [dbo].[favorites] VALUES ('${user_id}','${recipe_to_favorites}')`);
            res.status(200).send("Added to favorites successfully");
        }
        else
            res.status(401).send("Recipe is already in favorites");
        
    } catch(err) {
        next(err);
    }
});

router.post('/addToSeen'), async function(req, res, next) {
    try{
        let user_id = req.user.user_id;
        let recipe_to_seen = req.body.recipe;
        
        if(!await isSeen(user_id, recipe_to_seen))
            await DButils.execQuery(`INSERT INTO [dbo].[Views] VALUES ('${user_id}','${recipe_to_seen}')`);
        res.send(200);
    } catch(err) {
        next(err);
    }
}

router.post("/getFavorites", async function (req, res) {
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

router.get("/myFamilyRecipes", async function (req, res, next) {
    try{
        let user_id = req.user.user_id;
        my_family_recipes = await getUserFamilyRecipes(user_id);
        res.send(my_family_recipes);
    } catch (err) {
        next(err);
    }
});

router.post("/lastViewedRecipes", function (req, res) {
    
});

getUserRecipes = async function(user_id) {
    my_recipes = await DButils.execQuery(`SELECT * FROM [dbo].[recipes] WHERE [created_by]=${user_id}`)
    return my_recipes.map((my_recipes) => {
        const {
            image,
            name,
            preperation_time,
            popularity,
            vegeterian,
            gluten,
            num_of_dishes
        } = my_recipes
        return {
            image: image,
            name: name,
            preperationTime: preperation_time,
            popularity: popularity,
            veganOrVegeterian: vegeterian,
            isGlutenFree: gluten,
            dishesNum: num_of_dishes
        }
    })
}

isFavorite = async function(user_id, recipe_id) {
    result = await DButils.execQuery(`SELECT * FROM [dbo].[favorites] WHERE [user_id]=${user_id} AND [recipe_id]=${recipe_id}`);
    if(result.length == 0)
        return false;
    return true;
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

module.exports = router;