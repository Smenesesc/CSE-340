const express = require("express")
const router = express.Router()

const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

/* ****************************************
*  Default account landing (management) — protected
* *************************************** */
// I only want logged-in users to see account management.
// checkJWTToken runs globally in server.js; this adds the simple gate.
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)

/* ****************************************
*  Deliver login view
* *************************************** */
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

/* ****************************************
*  Deliver registration view
* *************************************** */
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

/* ****************************************
*  Process Registration (hash done in controller)
* *************************************** */
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

/* ****************************************
*  Process the login request
* *************************************** */
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

module.exports = router
