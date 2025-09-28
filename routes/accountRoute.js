/* ******************************************
 * Accounts routes
 * Using inventory route as a pattern
 ******************************************/
const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")

// ADDED: account validators (registration + login)
const accountValidate = require("../utilities/account-validation")

// GET /account/login
router.get("/login", async (req, res, next) => {
  try {
    // delegate to controller (keeps router thin)
    return accountController.buildLogin(req, res, next)
  } catch (err) {
    next(err)
  }
})

/* ******************************************
 * GET /account/register
 ******************************************/
router.get("/register", async (req, res, next) => {
  try {
    return accountController.buildRegister(req, res, next)
  } catch (err) {
    next(err)
  }
})

/* ******************************************
 * POST /account/register
 * Add server-side validation + sticky fields
 ******************************************/
router.post(
  "/register",
  accountValidate.registrationRules(), // apply rules
  accountValidate.checkRegData,        // handle errors + stickies
  async (req, res, next) => {
    try {
      // on success, continue into real handler
      return accountController.registerAccount(req, res, next)
    } catch (err) {
      next(err)
    }
  }
)

/* ******************************************
 * POST /account/login (TEMP for validation testing)
 * Returns a simple string on success so we can
 * confirm the route was reached after validation.
 ******************************************/
router.post(
  "/login",
  accountValidate.loginRules(),   // validate fields
  accountValidate.checkLoginData, // handle errors + sticky email
  (req, res) => {
    res.status(200).send("login process") // placeholder until real auth is built
  }
)

module.exports = router // export routes
