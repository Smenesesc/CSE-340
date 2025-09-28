/* ******************************************
 * Accounts routes
 * Using inventory route as a pattern
 ******************************************/
const express = require("express")                 // require express
const router = express.Router()                   // get a router instance
const utilities = require("../utilities")         // utilities (nav, etc.)
const accountController = require("../controllers/accountController") // controller

// GET /account/login
router.get("/login", async (req, res, next) => {
  try {
    // delegate to controller (keeps router thin)
    return accountController.buildLogin(req, res, next)
  } catch (err) {
    // make sure errors go to the error handler middleware
    next(err)
  }
})

/* ******************************************
 * GET /account/register
 * Build registration view (mirrors /login route pattern)
 ******************************************/
router.get("/register", async (req, res, next) => {
  try {
    // delegate to controller to keep consistency
    return accountController.buildRegister(req, res, next)
  } catch (err) {
    // forward any issue to the app-level error handler
    next(err)
  }
})

/* ******************************************
 * POST /account/register
 * Process registration submission (save to DB)
 ******************************************/
router.post("/register", async (req, res, next) => {
  try {
    // hand off to controller for persistence + response
    return accountController.registerAccount(req, res, next)
  } catch (err) {
    // ensure errors hit the general error handler
    next(err)
  }
})

module.exports = router// export routes
