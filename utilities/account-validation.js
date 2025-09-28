/* ******************************************
 * Account Validation Utilities
 * Server-side validation rules + handlers
 ******************************************/
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")

/* ****************************************
*  Registration Validation Rules
*  Ensures all fields valid + email unique
* *************************************** */
const registrationRules = () => {
  return [
    // first name required
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("First name is required."),

    // last name required
    body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Last name is required."),

    // email must be valid + not already in DB
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() // per validator.js docs
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        // ADDED: check duplicate email in DB
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          // throw to mark this rule as failed (separate message)
          throw new Error("Email exists. Please log in or use different email")
        }
      }),

    // strong password required (per course spec)
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
*  Renders the registration view with errors
*  Also sets sticky fields into res.locals
* *************************************** */
const checkRegData = async (req, res, next) => {
  const errors = validationResult(req)

  // make inputs "sticky" (safe if undefined on first load)
  res.locals.account_firstname = req.body.account_firstname
  res.locals.account_lastname  = req.body.account_lastname
  res.locals.account_email     = req.body.account_email

  if (!errors.isEmpty()) {
    return res.status(400).render("account/register", {
      title: "Register",
      errors: errors.array(), // pass array for list rendering
    })
  }
  next()
}

/* ****************************************
*  Login Validation Rules
*  Simple: email + password required
* *************************************** */
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
*  Renders login with errors + sticky email
* *************************************** */
const checkLoginData = async (req, res, next) => {
  const errors = validationResult(req)

  // sticky email (do not stick password)
  res.locals.account_email = req.body.account_email

  if (!errors.isEmpty()) {
    return res.status(400).render("account/login", {
      title: "Login",
      errors: errors.array(),
    })
  }
  next()
}

module.exports = {
  registrationRules,
  checkRegData,
  loginRules,
  checkLoginData,
}
