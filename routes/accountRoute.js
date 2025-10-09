const express = require("express")
const router = express.Router()

const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

/* ****************************************
*  Default account landing (management) — protected
* *************************************** */
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

/* ****************************************
*  Logout (Task 6)
* *************************************** */
router.get(
  "/logout",
  utilities.handleErrors(accountController.logoutAccount)
)

/* ****************************************
*  Account Update (Task 4/5)
*  GET view + POST handlers for info + password
* *************************************** */
router.get(
  "/update/:accountId",
  utilities.checkLogin, // must be logged in to update
  utilities.handleErrors(accountController.buildUpdateAccount)
)

// update base info: firstname/lastname/email
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.updateAccountRules(),  // new rules for update
  regValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccount)
)

// change password
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.updatePasswordRules(), // new rules for password change
  regValidate.checkUpdatePasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

module.exports = router
