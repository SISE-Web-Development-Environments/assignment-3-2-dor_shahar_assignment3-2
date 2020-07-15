var axios = require("axios");

exports.getRecipeDetails = async function(recipes_id) {
    let promises = [];
    recipes_id.map((id) => promises.push(axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.spooncular_apiKey}`)));
    let recipes_info = await Promise.all(promises);
    relevant_data = getRelevantData(recipes_info);
    return relevant_data;
}

exports.getRecipeExtraDetails = async function(recipes_id) {
    let promises = [];
    recipes_id.map((id) => promises.push(axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.spooncular_apiKey}`)));
    let recipes_info = await Promise.all(promises);
    relevant_data = getExtraData(recipes_info);
    return relevant_data;
}

getRelevantData = function(recipes_data) {
    return recipes_data.map((recipes_data) => {
        const {
            title,
            readyInMinutes,
            aggregateLikes,
            vegeterian,
            vegan,
            glutenFree,
            image
        } = recipes_data.data;
        return {
            image: image,
            name: title,
            preperation_time: readyInMinutes,
            popularity: aggregateLikes,
            vegan: vegan,
            Vegetarian: vegeterian,
            isGlutenFree: glutenFree
        }
    });
}

getAllData = function(recipes_data) {
    return recipes_data.map((recipes_data) => {
        const {
            title,
            readyInMinutes,
            aggregateLikes,
            vegeterian,
            vegan,
            glutenFree,
            image,
            extendedIngredients,
            instructions,
            servings
        } = recipes_data.data;
        return {
            image: image,
            name: title,
            preperation_time: readyInMinutes,
            popularity: aggregateLikes,
            vegan: vegan,
            Vegetarian: vegeterian,
            isGlutenFree: glutenFree,
            ingredients: extendedIngredients,
            instructions: instructions,
            serving_num: servings
        }
    });
}
