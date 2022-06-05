const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,       
    }
}

async function getRandomRecipes() {
    const response = await axios.get(`${api_domain}/random`,{
        params: {
            number:10,
            apiKey: process.env.spooncular_apiKey

        }
    });
    return response;
}
//select the recipe from the DB and return recipe details as JSON object
async function getLocalRecipeDetails(recipe_id){
    const recipe_details = await DButils.execQuery(`select * from recipes where recipe_id='${recipe_id}'`);
    return {
        id: recipe_details[0].recipe_id,
        title: recipe_details[0].recipe_name,
        readyInMinutes: recipe_details[0].timetoprepare,
        image: recipe_details[0].image_url,
        popularity: recipe_details[0].numoflikes,
        vegan: recipe_details[0].vegan,
        vegetarian: recipe_details[0].vegetarian,
        glutenFree: recipe_details[0].glutenfree,       
    }
}


// preview of local recipes from the DB, return array of JSON objects
async function getLocalRecipesPreview(local_recipes_id_array){
    let local_recipes_array = [];
    local_recipes_id_array.map((element) => local_recipes_array.push(getLocalRecipeDetails(element))); //extracting the local recipe ids into array
    return local_recipes_array;
}
//priview of external recipes from the API, rturn array of JSON objects
async function getExternalRecipesPreview(external_recipes_id_array){
    let external_recipes_array = [];
    external_recipes_id_array.map((element) => external_recipes_array.push(getRecipeDetails(element))); //extracting the external recipes as JSON object into array
    return external_recipes_array;
}

exports.getRecipeDetails = getRecipeDetails;
exports.getRandomRecipes = getRandomRecipes;
exports.getLocalRecipesPreview = getLocalRecipesPreview;
exports.getExternalRecipesPreview = getExternalRecipesPreview;



