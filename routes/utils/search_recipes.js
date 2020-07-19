var axios = require("axios");
var helper = require("./helper.js");

exports.getRecipeDetails = async function(recipes_id, session) {
    var recipes_id = recipes_id.filter(function (el) {
        return el != null;
    });
    let promises = [];
    recipes_id.map((id) => promises.push(axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.spooncular_apiKey}`)));
    let recipes_info = await Promise.all(promises);
    relevant_data = await getRelevantData(recipes_info, session);
    return relevant_data;
}

exports.getRecipeExtraDetails = async function(recipes_id) {
    let promises = [];
    recipes_id.map((id) => promises.push(axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.spooncular_apiKey}`)));
    let recipes_info = await Promise.all(promises);
    relevant_data = getAllData(recipes_info);
    return relevant_data;
}

getRelevantData = async function(recipes_data, session) {
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
        } = recipes_data.data;
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

getAllData = function(recipes_data) {
    return recipes_data.map((recipes_data) => {
        const {
            analyzedInstructions,
            title,
            readyInMinutes,
            aggregateLikes,
            vegetarian,
            vegan,
            glutenFree,
            image,
            extendedIngredients,
            instructions,
            servings
        } = recipes_data.data;
        return {
            analyzedInstructions: analyzedInstructions,
            image: image,
            name: title,
            preperation_time: readyInMinutes,
            popularity: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            isGlutenFree: glutenFree,
            ingredients: extendedIngredients,
            instructions: instructions,
            serving_num: servings
        }
    });
}
