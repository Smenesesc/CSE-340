/* ******************************************
 * Accounts controller
 * Only requires utilities for nav at this stage
 ******************************************/
const utilities = require("../utilities") // nav, helpers
const accountModel = require("../models/account-model") // ADDED: model for DB writes

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  try {
    // get nav once here (pattern matches other controllers)
    let nav = await utilities.getNav()
    // render the login view (view folder will be "account")
    res.render("account/login", {
      title: "Login",
      nav,
    })
  } catch (err) {
    // pass any issue to the app-level error handler
    next(err)
  }
}


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  try {
    // build nav for the registration view as well
    let nav = await utilities.getNav()
    // render the registration view (inside views/account)
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null, // reserved for later validation wiring
    })
  } catch (err) {
    // forward to general error handler
    next(err)
  }
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res, next) {
  try {
    let nav = await utilities.getNav()
    // collect values from request body (names follow DB column names)
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // write to DB via model (await the result)
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    )

    // if a result object (rows) came back, treat as success
    if (regResult && regResult.rows && regResult.rows.length) {
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      )
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    } else {
      // if model returned a message string or falsy, show failure
      req.flash("notice", "Sorry, the registration failed.")
      return res.status(501).render("account/register", {
        title: "Register",
        nav,
      })
    }
  } catch (err) {
    // on unexpected error, route to general error handler
    return next(err)
  }
}

// export controller API
module.exports = { buildLogin, buildRegister, registerAccount }
