var axios = require("axios");

getRecipeDetails = async function(recipes_id) {
    let promises = [];
    recipes_id.map((id) => promises.push(axios.get(`https://api.spoonacular.com/recipes/${id}/information?${process.env.spooncular_apiKey}`)));
    let recipes_info = await Promise.all(promises);
    relevant_data = getRelevantData(recipes_info);
    return relevant_data;
}

getRecipeExtraDetails = async function(recipes_id) {
    let promises = [];
    recipes_id.map((id) => promises.push(axios.get(`https://api.spoonacular.com/recipes/${id}/information?${process.env.spooncular_apiKey}`)));
    let recipes_info = await Promise.all(promises);
    relevant_data = getExtraData(recipes_info);
    return relevant_data;
}

getRelevantData = function(recipes_data) {
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
}

getExtraData = function(recipes_data) {
    const {
        extendedIngredients,
        instructions,
        servings
    } = recipes_data.data;
    return {
        ingredients: extendedIngredients,
        instructions: instructions,
        serving_num: servings
    }
}

exports.getRecipeDetails = getRecipeDetails;