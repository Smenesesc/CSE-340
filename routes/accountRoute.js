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
*  Process Registration
* *************************************** */
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

/* ****************************************
*  Process the login request (validator runs first)
* *************************************** */
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

/* ****************************************
*  Logout
* *************************************** */
router.get(
  "/logout",
  utilities.handleErrors(accountController.logoutAccount)
)

/* ****************************************
*  Account Update
* *************************************** */
router.get(
  "/update/:accountId",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
)

// update base info
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccount)
)

// change password
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkUpdatePasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

/* ****************************************
*  Admin: security tools (locked accounts)
* *************************************** */
router.get(
  "/security/locked",
  utilities.checkLogin,
  utilities.requireEmployee,          // only Employee/Admin may view
  utilities.handleErrors(accountController.buildLockedAccounts)
)

router.post(
  "/security/unlock",
  utilities.checkLogin,
  utilities.requireEmployee,          // only Employee/Admin may unlock
  utilities.handleErrors(accountController.unlockAccount)
)

module.exports = router
