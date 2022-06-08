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

// ---------------------------DB--------------------------------






// ---------------------------API--------------------------------

/**
 * This path returns a full details of a recipe by its id
 */
 router.get("/random", async (req, res, next) => {
  // try {
  //   const recipes = await recipes_utils.getRandomRecipes();
  //   res.send(recipes);
  // } catch (error) {
  //   next(error);
  // }
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



module.exports = router;
