const DButils = require("./DButils");
// const recipes_utils = require("./utils/recipes_utils");


async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into favoriterecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from favoriterecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function checkIsFavorite(user_id,recipe_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from favoriterecipes where user_id='${user_id}' AND recipe_id='${recipe_id}'`);
    if(recipes_id.length > 0){ 
        return true; 
    }
    return false;
}

async function markAsLastWatched(user_id, recipe_id){
    await DButils.execQuery(`insert into last_recipes values ('${user_id}',${recipe_id})`);
}

async function getLastWatchedRecipes(user_id){
    const recipes_id = await DButils.execQuery(`SELECT recipe_id FROM last_recipes where user_id='${user_id}'`);
    if(recipes_id.length < 3){
        return recipes_id;
    }
    return recipes_id.slice(-3);
}

async function checkIsWatched(user_id,recipe_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from last_recipes where user_id='${user_id}' AND recipe_id='${recipe_id}'`);
    if(recipes_id.length > 0){ 
        return true; 
    }
    return false;
}


async function getCreatedRecipes(user_id){
    const recipes_details = await DButils.execQuery(`select title,image,readyInMinutes, aggregateLikes, vegan, vegetarian, glutenFree from recipes where user_id='${user_id}'`);
    return recipes_details;
}


async function getFullRecipeDetails(recipe_id){
    const recipes_details = await DButils.execQuery(`select * from recipes where recipe_id='${recipe_id}'`);
    const recipes_ingredients = await DButils.execQuery(`select ingredient_name,amount from recipe_ingredients where recipe_id='${recipe_id}'`);
    recipes_details[0]["extendedIngredients"] = recipes_ingredients;
    let is_favorite = user_utils.checkIsFavorite(recipe_id);
    let is_watched = user_utils.checkIsWatched(recipe_id);
    recipes_details[0]["is_favorite"]=is_favorite;
    recipes_details[0]["is_watched"]=is_watched;

    return recipes_details;
}

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getCreatedRecipes = getCreatedRecipes;
exports.markAsLastWatched = markAsLastWatched;
exports.getLastWatchedRecipes = getLastWatchedRecipes;
exports.getFullRecipeDetails =getFullRecipeDetails;
exports.checkIsFavorite=checkIsFavorite;
exports.checkIsWatched =checkIsWatched;
