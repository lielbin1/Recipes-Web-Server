var express = require("express");
const app = express();
const morgan = require("morgan"); // logging library
const port = process.env.PORT || "3000";
app.use(express.json()); // parse application/json
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const recipes_utils = require("./utils/recipes_utils");


// router.get("/", (req, res) => res.send("im in recipes"));

// ---------------------------API--------------------------------

/**
 * This path returns a full details of chosen recipe
 */
 router.get('/FullRecipeDetailsAPI/:recipe_id', async (req,res,next) => {
  try{
    // const user_id = req.session.user_id;
    const user_id = req.session.user_id;
    const recipes_info = await recipes_utils.getFullRecipeDetails(user_id,req.params.recipe_id);
  
    res.status(200).send(recipes_info);
  } catch(error){
    next(error); 
  }
});


/**
 * This path returns a full details of three random recipes
 */
 router.get("/random", async (req, res, next) => {
    try {
    let random_3_recipes = await recipes_utils.getRandomThreeRecipes();
    res.send(random_3_recipes);
  } catch (error) {
    next(error);
  }
});
/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns the recipes for an Unauthorized USER that the user search by cusine, diet or intolerance
 */
 router.get('/guest/search', async (req,res,next) => {
  try {
    // let m_recipes = await recipes_utils.getRecipesFromSearch(req.query.query, req.query.number, req.query.cuisine, req.query.diet, req.query.intolerance,req.query.sort,-1);
    let m_recipes = await recipes_utils.getFilteredSearchRecipes(req.query.query, req.query.number, req.query.cuisine, req.query.diet, req.query.intolerance,req.query.sort,-1,0);

    res.send(m_recipes);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
