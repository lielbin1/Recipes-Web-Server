const DButils = require("./DButils");
// const recipes_utils = require("./utils/recipes_utils");

async function markAsFavorite(user_id, recipe_id){
    const local_racipe_id = await DButils.execQuery(`select recipe_id from recipes where recipe_id='${recipe_id}'`);

    if(local_racipe_id.length > 0 ){
        //recipe_id is in local DB
        await DButils.execQuery(`insert into favoriterecipes(local_recipe_id,user_id) values ('${recipe_id}','${user_id}')`);
    }
    else{
        // recipe_id is in external API
        await DButils.execQuery(`insert into favoriterecipes(external_recipe_id,user_id) values ('${recipe_id}', '${user_id}')`);
    }

}

async function getFavoriteLocalRecipes(user_id){
    const local_recipes_id = await DButils.execQuery(`select local_recipe_id from favoriterecipes where user_id='${user_id}'`);
    return local_recipes_id;
}
async function getFavoriteExternalRecipes(user_id){
    const external_recipes_id = await DButils.execQuery(`select external_recipe_id from favoriterecipes where user_id='${user_id}'`);
    return external_recipes_id;
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
exports.getFavoriteLocalRecipes = getFavoriteLocalRecipes;
exports.getFavoriteExternalRecipes = getFavoriteExternalRecipes;

