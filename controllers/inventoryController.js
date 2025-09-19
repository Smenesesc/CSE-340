const utilities = require("../utilities")
const invModel = require("../models/inventory-model")

const invController = {}

// Build detail view for a single vehicle
invController.buildDetail = async function (req, res, next) {
  try {
    const { invId } = req.params
    const result = await invModel.getVehicleById(invId)

    // if no vehicle is found, throw a 404
    if (!result.rows || result.rows.length === 0) {
      const err = new Error("Vehicle not found")
      err.status = 404
      return next(err)
    }

    const vehicle = result.rows[0]
    const nav = await utilities.getNav()
    const vehicleHTML = utilities.buildVehicleDetail(vehicle)
    const pageTitle = `${vehicle.inv_make} ${vehicle.inv_model}`

    res.render("inventory/detail", {
      title: pageTitle,
      nav,
      vehicleHTML,
    })
  } catch (err) {
    // pass any errors to error middleware
    next(err)
  }
}

// export so routes can use it
module.exports = invController
