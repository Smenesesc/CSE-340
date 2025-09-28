/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const invRoutes = require("./routes/inventory")
const utilities = require("./utilities")
const session = require("express-session")
const pool = require('./database/')
const bodyParser = require("body-parser") // ADDED: body-parser to read form + JSON bodies

// >>> ADDED: account routes (kept with other route requires)
const accountRoutes = require("./routes/accountRoute") // accounts

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// ADDED: body parsing for JSON + URL-encoded form bodies
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/* ***********************
 * View engine and templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.use(expressLayouts)
app.set("layout", "layouts/layouts") // not at views root

// make nav available to every view/layout so I don't have to pass it each time
app.use(async (req, res, next) => {
  try {
    res.locals.nav = await utilities.getNav()
    next()
  } catch (err) {
    next(err)
  }
})


/* ***********************
 * Routes
 *************************/
app.use(static)
// mount inventory routes at root so /custom, /sedan, /sport, /suv, /truck, /detail/:invId work
app.use("/", invRoutes)
// Index route (updated to use MVC controller)
app.get("/", baseController.buildHome)

// >>> ADDED: mount /account routes (keep base at '/account' here)
app.use("/account", accountRoutes)

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000   // default so the app still starts if .env is missing
const host = process.env.HOST || "127.0.0.1"

// one-time boot log so I can verify dotenv values loaded correctly
console.log("BOOT:", { PORT: process.env.PORT, HOST: process.env.HOST, NODE_ENV: process.env.NODE_ENV })

/* ***********************
 * Error Handling (assignment requirement)
 *************************/
// 404 handler (anything not matched above lands here)
app.use((req, res, next) => {
  const err = new Error("Not Found")
  err.status = 404
  next(err)
})

// General error handler
app.use((err, req, res, next) => {
  const status = err.status || 500
  const title  = status === 404 ? "404 Not Found" : "Server Error"
  const message = status === 404
    ? "The page you’re looking for doesn’t exist."
    : "Something went wrong on our end."

  // log for me during dev
  console.error(`[${status}] ${err.message}`)

  try {
    res.status(status).render("errors/error", { title, status, message })
  } catch (renderErr) {
    // very last resort if view rendering fails
    res.status(status).send(`${title}: ${message}`)
  }
})

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
