const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken") // verify JWT from cookie
require("dotenv").config()

const Util = {}

/* Build the navigation bar — I reuse classifications so the nav always reflects the DB */
Util.getNav = async function () {
  const data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* Build the vehicle detail HTML — tiny helper I keep in utilities to keep views simple */
Util.buildVehicleDetail = function (item) {
  const make  = item.inv_make  || "Unknown Make"
  const model = item.inv_model || "Unknown Model"
  const desc  = item.inv_description || "No description available."
  const img   = item.inv_image || "/images/vehicles/no-image.png"
  const year  = item.inv_year  ?? null
  const color = item.inv_color ?? null

  const priceStr = (typeof item.inv_price === "number")
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.inv_price)
    : null

  const milesStr = (typeof item.inv_miles === "number")
    ? new Intl.NumberFormat("en-US").format(item.inv_miles)
    : null

  const title = `${year ? year + " " : ""}${make} ${model}`

  return `
    <article class="vehicle-detail" aria-labelledby="vehicle-title">
      <div class="vehicle-detail__image">
        <img src="${img}" alt="Image of ${title}">
      </div>

      <div class="vehicle-detail__info">
        <h1 id="vehicle-title" class="vehicle-detail__title">${title}</h1>

        <ul class="vehicle-detail__meta">
          <li><strong>Make:</strong> ${make}</li>
          <li><strong>Model:</strong> ${model}</li>
          ${year   ? `<li><strong>Year:</strong> ${year}</li>`     : ""}
          ${color  ? `<li><strong>Color:</strong> ${color}</li>`   : ""}
          ${priceStr ? `<li><strong>Price:</strong> ${priceStr}</li>` : ""}
          ${milesStr ? `<li><strong>Miles:</strong> ${milesStr}</li>` : ""}
        </ul>

        <p>${desc}</p>
      </div>
    </article>
  `
}

/* Build the classification <select> for forms — sticky via selected attr */
Util.buildClassificationList = async function (classification_id = null) {
  const data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"${
      (classification_id != null && row.classification_id == classification_id) ? " selected" : ""
    }>${row.classification_name}</option>`
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies && req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        // make token payload available to every view
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    next()
  }
}

/* ****************************************
* Small helper: async route error wrapper
**************************************** */
Util.handleErrors = (fn) => (req, res, next) => Promise
  .resolve(fn(req, res, next))
  .catch(next)

/* ****************************************
 *  Check Login (simple guard for protected views)
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 *  Require Employee/Admin for inventory admin areas
 *  I only use this for add/edit/delete management routes (not public views).
 * ************************************ */
Util.requireEmployee = (req, res, next) => {
  const user = res.locals.accountData
  if (user && (user.account_type === "Employee" || user.account_type === "Admin")) {
    return next()
  }
  // on failure, bounce to login with message (per assignment)
  req.flash("notice", "You must be an Employee or Admin to access Inventory Management.")
  return res.redirect("/account/login")
}

module.exports = Util
