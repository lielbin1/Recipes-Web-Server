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
var recipe_id_count = 1;

router.get("/", (req, res) => res.send("im in user"));
/**
 * Authenticate all incoming requests by middleware
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
      recipe_id: "local" + recipe_id_count.toString(),
      // recipe_id: "local2" ,
      image_url: req.body.image_url,
      recipename: req.body.recipename,
      timetoprepare: req.body.timetoprepare ,
      numoflikes: req.body.numoflikes,
      vegav_or_vegetarian: req.body.vegav_or_vegetarian,
      glutenfree: req.body.glutenfree,
      is_watched_recipe: req.body.is_watched_recipe,
      favorite_recipe: req.body.favorite_recipe,
      ingredients_and_quantity_list: req.body.ingredients_and_quantity_list,
      instructions: req.body.instructions,
      numberofserving: req.body.numberofserving,
    }
    let recipes = [];
    recipes = await DButils.execQuery("SELECT recipe_id from recipes");

    if (recipes.find((x) => x.recipe_id === recipe_details.recipe_id))
      throw { status: 409, message: "recipe id taken" };

    // add the new recipe
 
    await DButils.execQuery(
      `INSERT INTO recipes VALUES 
      ( '${recipe_details.image_url}', '${recipe_details.recipename}',
      '${recipe_details.timetoprepare}', '${recipe_details.numoflikes}', '${recipe_details.vegav_or_vegetarian}', '${recipe_details.glutenfree}',
       '${recipe_details.is_watched_recipe}', '${recipe_details.favorite_recipe}', '${recipe_details.ingredients_and_quantity_list}',
        '${recipe_details.instructions}', '${recipe_details.numberofserving}','${recipe_details.recipe_id}')`
    );

    res.status(201).send({ message: "recipe created", success: true });
    recipe_id_count++;
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
    const recipe_id = req.body.recipeId;
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
// -------------------------------API-------------------------------




module.exports = router;
