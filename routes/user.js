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

router.get('/CreateRecipe', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipes_info = await user_utils.getCreatedRecipes(user_id);
  
    res.status(200).send(recipes_info);
  } catch(error){
    next(error); 
  }
});

router.post("/CreateRecipe", async (req, res, next) => {
  try {
    // parameters exists
    // valid parameters
    // username exists
    let recipe_details = {
      user_id: req.session.user_id,
      image: req.body.image,
      title: req.body.title,
      readyInMinutes: req.body.readyInMinutes ,
      aggregateLikes: req.body.aggregateLikes,
      glutenFree: req.body.glutenFree,
      instructions: req.body.instructions,
      servings: req.body.servings,
      vegan: req.body.vegan,
      vegetarian: req.body.vegetarian,
      // ingredients: req.body.ingredients -> "ingredients": [{"name": ,"amount":},{"name": ,"amount":}...]
      ingredients: req.body.ingredients
    }

    let recipes_titles = [];
    recipes_titles = await DButils.execQuery("SELECT title from recipes");
    if (recipes_titles.find((x) => x.title === recipe_details.title))
      throw { status: 409, message: "recipe title taken" };

    // add the new recipe
    await DButils.execQuery(
      `INSERT INTO recipes(user_id,title,image,servings,readyInMinutes,aggregateLikes,vegan,vegetarian, glutenFree,instructions) VALUES 
      ( '${recipe_details.user_id}','${recipe_details.title}','${recipe_details.image}', '${recipe_details.servings}', '${recipe_details.readyInMinutes}', '${recipe_details.glutenFree}',
        '${recipe_details.aggregateLikes}', '${recipe_details.vegan}', '${recipe_details.glutenFree}', '${recipe_details.instructions}')`
    );
    let recipes_id = [];
    recipes_id = await DButils.execQuery(`SELECT MAX(recipe_id) as recipe_id from recipes`);

    await recipe_details.ingredients.map((element) => DButils.execQuery(
      `INSERT INTO recipe_ingredients VALUES ('${recipes_id[0].recipe_id}', '${element.name}','${element.amount}')`
    ));
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
    let recipes_ids = [];
    recipes_ids = await DButils.execQuery(`SELECT recipe_id from favoriterecipes where user_id='${user_id}'`);
    if (recipes_ids.find((x) => x.recipe_id === recipe_id))
      throw { status: 500, message: "Already in favorites" };
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
 * This path gets body with recipeId and save this recipe in the last watched list of the logged-in user
 */
 router.post('/lastWatched', async (req,res,next) => {
  try{
    const user_id = req.session.user_id; 
    // const user_id = req.body.user_id;
    const recipe_id = req.body.recipe_id;
    let recipes_ids = [];
    recipes_ids = await DButils.execQuery(`SELECT recipe_id from last_recipes where user_id='${user_id}'`);
    if (recipes_ids.find((x) => x.recipe_id === recipe_id))
      throw { status: 500, message: "Already in lastWatched" };
    await user_utils.markAsLastWatched(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as lastWatched");
    } catch(error){
      next(error);
  }
})

/**
 * This path returns the last watched recipes that were saved by the logged-in user
 */
 router.get('/lastWatched', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const three_last_recipes_id = await user_utils.getLastWatchedRecipes(user_id);
    let recipes_id_array = [];
    three_last_recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
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
    let m_recipes_cusine = await recipe_utils.get_m_recipes_cusine(req.query.query, req.query.number, req.query.cusine, req.query.diet, req.query.intolerance);
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
