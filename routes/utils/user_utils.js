const DButils = require("./DButils");
// const recipes_utils = require("./utils/recipes_utils");


async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into favoriterecipes values ('${user_id}',${recipe_id})`);
}


async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from favoriterecipes where user_id='${user_id}'`);
    return recipes_id;
}
// async function getRecipesPreview(recipes_id_array){
//     //check if exists in the spoonacular
//     const recipes_array = recipes_id_array.map((recipe_id) => recipes_utils.getRecipeDetails(recipe_id));
//     //if no in the spoonacular check in the DB
//     const recipes_id = await DButils.execQuery(`select * from recepies where recipe_id in '${recipes_id_array}'`);

//     //else not found
//     return recipes_id;
// }

exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;

