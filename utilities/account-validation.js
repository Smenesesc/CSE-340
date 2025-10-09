/* ******************************************
 * Account Validation Utilities
 * Server-side validation rules + handlers
 ******************************************/
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")

/* ****************************************
*  Registration Validation Rules
**************************************** */
const registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("First name is required."),
    body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Last name is required."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email")
        }
      }),
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 chars and include 1 uppercase, 1 number, and 1 special character."),
  ]
}

/* ****************************************
*  Registration Error Handler
**************************************** */
const checkRegData = async (req, res, next) => {
  const errors = validationResult(req)

  // sticky inputs
  res.locals.account_firstname = req.body.account_firstname
  res.locals.account_lastname  = req.body.account_lastname
  res.locals.account_email     = req.body.account_email

  if (!errors.isEmpty()) {
    return res.status(400).render("account/register", {
      title: "Register",
      errors: errors.array(),
    })
  }
  next()
}

/* ****************************************
*  Login Validation Rules
**************************************** */
const loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Password is required."),
  ]
}

/* ****************************************
*  Login Error Handler
**************************************** */
const checkLoginData = async (req, res, next) => {
  const errors = validationResult(req)

  res.locals.account_email = req.body.account_email

  if (!errors.isEmpty()) {
    return res.status(400).render("account/login", {
      title: "Login",
      errors: errors.array(),
    })
  }
  next()
}

/* ****************************************
*  NEW: Update Account Rules (Task 5)
*  — validate names + email; ensure email unique if changed
**************************************** */
const updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("First name is required."),
    body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Last name is required."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (value, { req }) => {
        const account_id = parseInt(req.body.account_id, 10)
        const existsElsewhere = await accountModel.checkExistingEmailForUpdate(value, account_id)
        if (existsElsewhere) {
          throw new Error("Email already in use by another account.")
        }
      }),
    body("account_id").trim().isInt({ min: 1 }).withMessage("Invalid account id."),
  ]
}

/* ****************************************
*  NEW: Update Account Error Handler
**************************************** */
const checkUpdateAccountData = async (req, res, next) => {
  const errors = validationResult(req)

  // keep sticky values for the update form
  res.locals.account_firstname = req.body.account_firstname
  res.locals.account_lastname  = req.body.account_lastname
  res.locals.account_email     = req.body.account_email
  res.locals.account_id        = req.body.account_id

  if (!errors.isEmpty()) {
    const utilities = require("../utilities")
    const nav = await utilities.getNav()
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      account_firstname: req.body.account_firstname,
      account_lastname:  req.body.account_lastname,
      account_email:     req.body.account_email,
      account_id:        req.body.account_id,
    })
  }
  next()
}

/* ****************************************
*  NEW: Update Password Rules
**************************************** */
const updatePasswordRules = () => {
  return [
    body("account_password")
      .trim()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password must be at least 12 chars and include 1 uppercase, 1 number, and 1 special character."),
    body("account_id").trim().isInt({ min: 1 }).withMessage("Invalid account id."),
  ]
}

/* ****************************************
*  NEW: Update Password Error Handler
**************************************** */
const checkUpdatePasswordData = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const utilities = require("../utilities")
    const nav = await utilities.getNav()
    // I keep the account_id so the hidden field stays populated
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      account_id: req.body.account_id,
    })
  }
  next()
}

module.exports = {
  registrationRules,
  checkRegData,
  loginRules,
  checkLoginData,
  updateAccountRules,        // new
  checkUpdateAccountData,    // new
  updatePasswordRules,       // new
  checkUpdatePasswordData,   // new
}
