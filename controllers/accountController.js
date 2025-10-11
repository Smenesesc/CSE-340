/* ******************************************
 * Accounts controller
 * Added lockout + admin unlock feature
 * Fixed login 500 by sending default values to view
 ******************************************/
const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

// Lockout policy
const MAX_ATTEMPTS = 5     // lock after 5 failed logins
const LOCK_MINUTES = 15    // minutes locked

/* ****************************************
 * Show login page
 * Added default values so view never crashes if errors undefined
 **************************************** */
async function buildLogin(req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: [],          // default empty array so EJS won't fail
      account_email: "",   // default blank sticky email
    })
  } catch (err) { next(err) }
}

/* ****************************************
 * Show register page
 **************************************** */
async function buildRegister(req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  } catch (err) { next(err) }
}

/* ****************************************
 * Register new account
 **************************************** */
async function registerAccount(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    let hashedPassword
    try {
      hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (err) {
      req.flash("notice", "Error hashing password")
      return res.status(500).render("account/register", { title: "Register", nav, errors: null })
    }

    const result = await accountModel.registerAccount(account_firstname, account_lastname, account_email, hashedPassword)

    if (result && result.rows && result.rows.length) {
      req.flash("notice", `Welcome ${account_firstname}, please log in.`)
      return res.status(201).render("account/login", { title: "Login", nav, errors: [], account_email: "" })
    } else {
      req.flash("notice", "Registration failed.")
      return res.status(501).render("account/register", { title: "Register", nav, errors: null })
    }
  } catch (err) { next(err) }
}

/* ****************************************
 * Account login with lockout
 **************************************** */
async function accountLogin(req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Invalid credentials.")
    return res.status(400).render("account/login", { title: "Login", nav, errors: [], account_email })
  }

  // Check if account is locked
  if (accountData.locked_until && new Date(accountData.locked_until).getTime() > Date.now()) {
    const until = new Date(accountData.locked_until)
    req.flash("notice", `Account locked. Try again after ${until.toLocaleString()}.`)
    return res.status(423).render("account/login", { title: "Login", nav, errors: [], account_email })
  }

  try {
    // If password correct
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      await accountModel.resetFailedAttempts(accountData.account_id)
      delete accountData.account_password

      const token = jwt.sign({
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
        account_type: accountData.account_type
      }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })

      res.cookie("jwt", token, { httpOnly: true, maxAge: 3600 * 1000 })
      return res.redirect("/account/")
    } else {
      // wrong password, record failed attempt
      const sec = await accountModel.recordFailedAttempt(accountData.account_id, MAX_ATTEMPTS, LOCK_MINUTES)
      if (sec && sec.locked_until && new Date(sec.locked_until).getTime() > Date.now()) {
        const until = new Date(sec.locked_until)
        req.flash("notice", `Too many attempts. Locked until ${until.toLocaleString()}.`)
        return res.status(423).render("account/login", { title: "Login", nav, errors: [], account_email })
      }

      const remaining = sec ? Math.max(0, MAX_ATTEMPTS - sec.failed_attempts) : null
      const msg = remaining
        ? `Invalid credentials. (${remaining} attempt${remaining === 1 ? "" : "s"} left)`
        : "Invalid credentials."
      req.flash("notice", msg)
      return res.status(400).render("account/login", { title: "Login", nav, errors: [], account_email })
    }
  } catch (err) {
    throw new Error("Access Forbidden")
  }
}

/* ****************************************
 * Logout
 **************************************** */
async function logoutAccount(req, res, next) {
  try {
    res.clearCookie("jwt")
    req.flash("notice", "You have been logged out.")
    return res.redirect("/")
  } catch (err) { next(err) }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  logoutAccount,
}
