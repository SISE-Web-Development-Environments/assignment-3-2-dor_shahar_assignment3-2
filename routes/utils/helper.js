var DButils = require("../../DButils");

exports.isFavorite = async function(user_id, recipe_id) {
    result = await DButils.execQuery(`SELECT * FROM [dbo].[favorites] WHERE [user_id]=${user_id} AND [recipe_id]=${recipe_id}`);
    if(result.length == 0)
        return false;
    return true;
}

exports.isSeen = async function(user_id, recipe_id) {
    result = await DButils.execQuery(`SELECT * FROM [dbo].[Views] WHERE [user_id]=${user_id} AND [recipe_id]=${recipe_id}`);
    if(result.length == 0)
        return false;
    return true;
}

exports.extractInfo = async function(recipes_data, session) {
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
    if(session && session.user_id)
        isFavorite = await helper.isFavorite(session.user_id, id);
    return {
        id: id,
        image: image,
        name: title,
        preperation_time: readyInMinutes,
        popularity: aggregateLikes,
        vegan: vegan,
        Vegetarian: vegetarian,
        isGlutenFree: glutenFree,
        isFavorite: isFavorite
    }
}