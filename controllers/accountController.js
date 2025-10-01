/* ******************************************
 * Accounts controller
 * Only requires utilities for nav at this stage
 ******************************************/
const utilities = require("../utilities") // nav, helpers
const accountModel = require("../models/account-model") // model for DB writes
const bcrypt = require("bcryptjs") // for password hashing
const jwt = require("jsonwebtoken") // <-- added: JWT for login auth
require("dotenv").config() // <-- added: read ACCESS_TOKEN_SECRET

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
  } catch (err) {
    next(err)
  }
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
  } catch (err) {
    next(err)
  }
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
      req.flash(
        "notice",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      )
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      return res.status(501).render("account/register", {
        title: "Register",
        nav,
      })
    }
  } catch (err) {
    return next(err)
  }
}

/* ****************************************
 *  Deliver account management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    const nav = await utilities.getNav()
    return res.render("account/management", {
      title: "Account Management",
      nav,
      errors: null,
    })
  } catch (err) {
    next(err)
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  // look up account by email (includes hashed password)
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email, // sticky
    })
    return
  }

  try {
    // compare plain text vs hashed password
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      // don't keep the hash in memory we send forward
      delete accountData.account_password

      // NOTE: expiresIn wants *seconds*. I’m using 3600 = 1 hour.
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 } // 1 hour in seconds
      )

      // set cookie; secure only in non-dev
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 3600 * 1000 })
      }

      return res.redirect("/account/")
    } else {
      // wrong password
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    // let the global error handler convert this into a 403
    throw new Error('Access Forbidden')
  }
}

// export controller API
module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  buildAccountManagement, // <- added
  accountLogin,           // <- added
}
