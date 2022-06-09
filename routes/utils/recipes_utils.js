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
        aggregateLikes: aggregateLikes,
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
//TODO: need to delete this, i add a function from lab8 getRecipesPreview
// preview of local recipes from the DB, return array of JSON objects
// async function getLocalRecipesPreview(local_recipes_id_array){
//     let local_recipes_array = [];
//     local_recipes_id_array.map((element) => local_recipes_array.push(getLocalRecipeDetails(element))); //extracting the local recipe ids into array
//     return local_recipes_array;
// }
// //priview of external recipes from the API, rturn array of JSON objects
// async function getExternalRecipesPreview(external_recipes_id_array){
//     let external_recipes_array = [];
//     external_recipes_id_array.map((element) => external_recipes_array.push(getRecipeDetails(element))); //extracting the external recipes as JSON object into array
//     return external_recipes_array;
// }

async function getRecipesPreview(recipes_ids_list){
    let promises =[];
    recipes_ids_list.map((id)=>{
        promises.push(getRecipeInformation(id));
    });
    let info_res = await Promise.all(promises);
    return extractPreviewRecipeDetails(info_res);
}

function extractPreviewRecipeDetails(recipes_info){
    //check the data type so it can work with diffrent types of data
    return recipes_info.map((recipe_info)=> {
        let data = recipe_info;
        if(recipe_info.data){
            data = recipe_info.data;
        }
        const{ id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = data;
        return{
            id: id,
            title: title,
            readyInMinutes: readyInMinutes,
            image: image,
            aggregateLikes: aggregateLikes,
            vegan: vegan,
            vegetarian: vegetarian,
            glutenFree: glutenFree,   
        }
    })
}

async function getRandomThreeRecipes(){
    let random_pool = await getRandomRecipes();
    let filterd_random_pool = random_pool.data.recipes.filter((random)=>(random.instructions != "") && random.image && random.title && random.readyInMinutes && random.aggregateLikes && random.vegan 
    && random.vegetarian && random.glutenFree)
    if(filterd_random_pool.length < 3){
        return getRandomThreeRecipes();
    }
    return extractPreviewRecipeDetails([filterd_random_pool[0], filterd_random_pool[1], filterd_random_pool[2]]);
}
//select the recipe from the DB and return recipe details as JSON object
// async function getLocalRecipeDetails(recipe_id){
//     const recipe_details = await DButils.execQuery(`select * from recipes where recipe_id='${recipe_id}'`);
//     return {
//         id: recipe_details[0].recipe_id,
//         title: recipe_details[0].title,
//         image: recipe_details[0].image,
//         readyInMinutes: recipe_details[0].timetoprepare,
//         popularity: recipe_details[0].numoflikes,
//         vegan: recipe_details[0].vegan,
//         vegetarian: recipe_details[0].vegetarian,
//         glutenFree: recipe_details[0].glutenfree,       
//     }
// }




exports.getRecipeDetails = getRecipeDetails;
exports.getRandomRecipes = getRandomRecipes;
exports.getRandomThreeRecipes = getRandomThreeRecipes;
exports.getRecipesPreview = getRecipesPreview;



