const utilities = require("../utilities")
const invModel = require("../models/inventory-model")

const invController = {}

/* Management view — central hub for add classification / add inventory */
invController.buildManagement = async function (req, res, next) {
  try {
    // I just render the management page; nav is already injected globally in server.js
    res.render("inventory/management", {
      title: "Inventory Management",
      active: "inv-mgmt",
    })
  } catch (err) { next(err) }
}

/* ===== Task 2: Add Classification (GET + POST) ===== */

/* Deliver add-classification view */
invController.buildAddClassification = async function (req, res, next) {
  try {
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      active: "inv-mgmt",
      errors: null,
    })
  } catch (err) { next(err) }
}

/* Handle add-classification POST */
invController.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body

    // attempt the insert
    const result = await invModel.insertClassification(classification_name)

    if (result?.rows?.length) {
      req.flash("notice", `Classification "${classification_name}" added successfully.`)
      // re-render management so I can see it reflected in the navbar immediately
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        active: "inv-mgmt",
      })
    }

    // fallthrough = failure
    req.flash("notice", "Sorry, the classification could not be added.")
    res.status(500).render("inventory/add-classification", {
      title: "Add New Classification",
      errors: null,
    })
  } catch (err) {
    // handle e.g., unique constraint or other DB errors gracefully
    req.flash("notice", "Sorry, there was an error adding the classification.")
    res.status(500).render("inventory/add-classification", {
      title: "Add New Classification",
      errors: null,
    })
  }
}

/* ===== Task 3: Add Inventory (GET + POST) ===== */

/* Deliver add-inventory view */
invController.buildAddInventory = async function (req, res, next) {
  try {
    const classificationSelect = await utilities.buildClassificationList()
    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      active: "inv-mgmt",
      classificationSelect,
      errors: null,
    })
  } catch (err) { next(err) }
}

/* Handle add-inventory POST */
invController.addInventory = async function (req, res, next) {
  try {
    // since I used DB field names in the form, I can forward the body as-is
    const payload = {
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: parseInt(req.body.inv_year, 10),
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price: parseFloat(req.body.inv_price),
      inv_miles: parseInt(req.body.inv_miles, 10),
      inv_color: req.body.inv_color,
      classification_id: parseInt(req.body.classification_id, 10),
    }

    const result = await invModel.insertInventory(payload)

    if (result?.rows?.length) {
      req.flash("notice", "Vehicle added successfully.")
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        active: "inv-mgmt",
      })
    }

    // failure path
    req.flash("notice", "Sorry, the vehicle could not be added.")
    const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
    return res.status(500).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      classificationSelect,
      errors: null,
    })
  } catch (err) {
    req.flash("notice", "Sorry, there was an error adding the vehicle.")
    const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
    return res.status(500).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      classificationSelect,
      errors: null,
    })
  }
}

/* ===== Existing detail view (kept from your file) ===== */
invController.buildDetail = async function (req, res, next) {
  try {
    const { invId } = req.params
    const result = await invModel.getVehicleById(invId)

    if (!result.rows || result.rows.length === 0) {
      const err = new Error("Vehicle not found")
      err.status = 404
      return next(err)
    }

    const vehicle = result.rows[0]
    const vehicleHTML = utilities.buildVehicleDetail(vehicle)
    const pageTitle = `${vehicle.inv_make} ${vehicle.inv_model}`

    res.render("inventory/detail", {
      title: pageTitle,
      vehicleHTML,
    })
  } catch (err) { next(err) }
}

module.exports = invController
