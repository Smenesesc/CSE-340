/* ******************************************
 * Accounts controller
 * Only requires utilities for nav at this stage
 ******************************************/
const utilities = require("../utilities") // nav, helpers
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
    })
  } catch (err) { next(err) }
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  } catch (err) { next(err) }
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res, next) {
  try {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // hash password before storing
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
      req.flash("notice", "Sorry, there was an error processing the registration.")
      return res.status(500).render("account/register", {
        title: "Register",
        nav,
        errors: null,
      })
    }

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult && regResult.rows && regResult.rows.length) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`)
      return res.status(201).render("account/login", { title: "Login", nav })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      return res.status(501).render("account/register", { title: "Register", nav })
    }
  } catch (err) { return next(err) }
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    const nav = await utilities.getNav()

    // I rely on res.locals.accountData set by JWT check
    const user = res.locals.accountData || null

    return res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
      user, // pass in case I want it explicitly
    })
  } catch (err) { next(err) }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password

      // NOTE: expiresIn wants *seconds*. 3600 = 1 hour.
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 }
      )

      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 3600 * 1000 })
      }

      return res.redirect("/account/")
    } else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    // global error handler will 403 this
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver account update view (Task 4/5)
 *  GET /account/update/:accountId
 * ************************************ */
async function buildUpdateAccount(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const account_id = parseInt(req.params.accountId, 10)

    // I fetch current data to prefill the form
    const account = await accountModel.getAccountById(account_id)
    if (!account) {
      req.flash("notice", "Account not found.")
      return res.redirect("/account/")
    }

    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      // sticky values live in res.locals.* but I also seed the initial values here
      account_firstname: account.account_firstname,
      account_lastname: account.account_lastname,
      account_email: account.account_email,
      account_id: account.account_id,
    })
  } catch (err) { next(err) }
}

/* ****************************************
 *  Update account info (names/email) — POST
 *  POST /account/update
 * ************************************ */
async function updateAccount(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const { account_id, account_firstname, account_lastname, account_email } = req.body

    // perform update via model
    const result = await accountModel.updateAccount(
      parseInt(account_id, 10),
      account_firstname,
      account_lastname,
      account_email
    )

    if (!result) {
      req.flash("notice", "Sorry, the account update failed.")
      return res.status(400).render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email,
        account_id,
      })
    }

    // fetch fresh data to update the JWT (so header + management reflect changes)
    const updated = await accountModel.getAccountById(parseInt(account_id, 10))
    if (updated) {
      const payload = {
        account_id: updated.account_id,
        account_firstname: updated.account_firstname,
        account_lastname: updated.account_lastname,
        account_email: updated.account_email,
        account_type: updated.account_type
      }
      const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", token, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 3600 * 1000 })
      }
    }

    req.flash("notice", "Account information updated successfully.")
    return res.redirect("/account/")
  } catch (err) { next(err) }
}

/* ****************************************
 *  Change password — POST
 *  POST /account/update-password
 * ************************************ */
async function updatePassword(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const { account_id, account_password } = req.body

    // hash the new password
    let hashedPassword
    try {
      hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (e) {
      req.flash("notice", "Sorry, there was an error hashing the new password.")
      return res.status(400).render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        account_id,
      })
    }

    const ok = await accountModel.updatePassword(parseInt(account_id, 10), hashedPassword)
    if (!ok) {
      req.flash("notice", "Password change failed.")
      return res.status(400).render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        account_id,
      })
    }

    req.flash("notice", "Password updated successfully.")
    return res.redirect("/account/")
  } catch (err) { next(err) }
}

/* ****************************************
 *  Logout (Task 6)
 *  GET /account/logout
 * ************************************ */
async function logoutAccount(req, res, next) {
  try {
    // remove token cookie and bounce home
    res.clearCookie("jwt")
    req.flash("notice", "You have been logged out.")
    return res.redirect("/")
  } catch (err) { next(err) }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  buildAccountManagement,
  accountLogin,
  buildUpdateAccount, // new
  updateAccount,      // new
  updatePassword,     // new
  logoutAccount,      // new
}
