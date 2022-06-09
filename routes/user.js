var express = require("express");
const app = express();
const morgan = require("morgan"); // logging library
const port = process.env.PORT || "3000";
app.use(express.json()); // parse application/json
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");



router.get("/", (req, res) => res.send("im in user"));
/**
 * Authenticate all incoming requests by middleware - cheking if the user is loged in 
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


router.post("/CreateRecipe", async (req, res, next) => {
  try {
    // parameters exists
    // valid parameters
    // username exists
    let recipe_details = {

      image_url: req.body.image_url,
      recipename: req.body.recipename,
      timetoprepare: req.body.timetoprepare ,
      numoflikes: req.body.numoflikes,
      glutenfree: req.body.glutenfree,
      is_watched_recipe: req.body.is_watched_recipe,
      favorite_recipe: req.body.favorite_recipe,
      ingredients_and_quantity_list: req.body.ingredients_and_quantity_list,
      instructions: req.body.instructions,
      numberofserving: req.body.numberofserving,
      vegan: req.body.vegan,
      vegetarian: req.body.vegetarian
    }

    let recipes = [];
    recipes = await DButils.execQuery("SELECT recipe_id from recipes");

    if (recipes.find((x) => x.recipe_id === recipe_details.recipe_id))
      throw { status: 409, message: "recipe id taken" };

    // add the new recipe
 
    await DButils.execQuery(
      `INSERT INTO recipes(image_url,recipename,timetoprepare,numoflikes,glutenfree,is_watched_recipe,favorite_recipe,ingredients_and_quantity_list,instructions,numberofserving,vegan,vegetarian) VALUES 
      ( '${recipe_details.image_url}', '${recipe_details.recipename}',
      '${recipe_details.timetoprepare}', '${recipe_details.numoflikes}', '${recipe_details.glutenfree}',
       '${recipe_details.is_watched_recipe}', '${recipe_details.favorite_recipe}', '${recipe_details.ingredients_and_quantity_list}',
        '${recipe_details.instructions}', '${recipe_details.numberofserving}', '${recipe_details.vegan}', '${recipe_details.vegetarian}')`
    );

    res.status(201).send({ message: "recipe created", success: true });
  } catch (error) {
    next(error);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id; 
    // const user_id = req.body.user_id;
    const recipe_id = req.body.recipe_id;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
 router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});




/**
 * This path returns the recipes that the user search by cusine
 */
 router.get('/search', async (req,res,next) => {
  try {
    let m_recipes_cusine = await recipes_utils.get_m_recipes_cusine(req.params.number, req.params.cusine, req.params.cusine, req.params.diet, req.params.intolerance);
    res.send(m_recipes_cusine);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the recipes that the user search by diet
 */
 router.get('/search/diet', async (req,res,next) => {

});

/**
 * This path returns the recipes that the user search by intolerance
 */
 router.get('/search/intolerance', async (req,res,next) => {

});




// router.get('/favorites', async (req,res,next) => {
//   try{
//     const user_id = req.session.user_id;
//     let favorite_recipes = {};
//     const local_recipes_id = await user_utils.getFavoriteLocalRecipes(user_id);
//     const external_recipes_id = await user_utils.getFavoriteExternalRecipes(user_id);

//     let local_recipes_id_array = [];
//     let external_recipes_id_array = [];
//     local_recipes_id.map((element) => local_recipes_id_array.push(element.local_recipe_id)); //extracting the local recipe ids into array
//     external_recipes_id.map((element) => external_recipes_id_array.push(element.external_recipes_id)); //extracting the external recipe ids into array
//     // array of JSON object represents recipe details
//     const local_results = await recipe_utils.getLocalRecipesPreview(local_recipes_id_array);
//     // array of JSON object represents recipe details
//     const external_results = await recipe_utils.getExternalRecipesPreview(external_recipes_id_array);
//     results = [local_results,external_results]
//     res.status(200).send(results);
//   } catch(error){
//     next(error); 
//   }
// });
// -------------------------------API-------------------------------




module.exports = router;
