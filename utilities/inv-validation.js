/* ******************************************
 * Inventory Validation (server-side)
 * I validate strictly here and keep the form sticky on error.
 ******************************************/
const { body, validationResult } = require("express-validator")

/* Add Classification — rules */
const classificationRules = () => [
  body("classification_name")
    .trim()
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Classification name must be letters/numbers only (no spaces or special characters).")
    .isLength({ min: 1, max: 50 })
    .withMessage("Classification name is required and must be 1–50 chars."),
]

/* Check classification + render with errors (sticky single field) */
const checkClassification = async (req, res, next) => {
  const errors = validationResult(req)
  res.locals.classification_name = req.body.classification_name
  if (!errors.isEmpty()) {
    return res.status(400).render("inventory/add-classification", {
      title: "Add New Classification",
      errors: errors.array(),
    })
  }
  next()
}

/* Add Inventory — rules */
const inventoryRules = () => [
  body("inv_make").trim().isLength({ min: 1 }).withMessage("Make is required."),
  body("inv_model").trim().isLength({ min: 1 }).withMessage("Model is required."),
  body("inv_year").trim().isInt({ min: 1900, max: 2100 }).withMessage("Year must be a valid 4-digit year."),
  body("inv_description").trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters."),
  body("inv_image").trim().isLength({ min: 1 }).withMessage("Image path is required."),
  body("inv_thumbnail").trim().isLength({ min: 1 }).withMessage("Thumbnail path is required."),
  body("inv_price").trim().isFloat({ min: 0 }).withMessage("Price must be a valid number."),
  body("inv_miles").trim().isInt({ min: 0 }).withMessage("Miles must be a non-negative whole number."),
  body("inv_color").trim().isLength({ min: 1 }).withMessage("Color is required."),
  body("classification_id").trim().isInt({ min: 1 }).withMessage("Please choose a classification."),
]

/* Check inventory + render with errors (I make every field sticky here) */
const checkInventory = async (req, res, next) => {
  const errors = validationResult(req)

  // stick everything back into locals so the form doesn’t lose user input
  const fields = [
    "inv_make", "inv_model", "inv_year", "inv_description",
    "inv_image", "inv_thumbnail", "inv_price", "inv_miles",
    "inv_color", "classification_id"
  ]
  fields.forEach(f => res.locals[f] = req.body[f])

  if (!errors.isEmpty()) {
    // build the classification select with the chosen option selected
    const utilities = require("./")
    const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)

    return res.status(400).render("inventory/add-inventory", {
      title: "Add New Vehicle",
      classificationSelect,
      errors: errors.array(),
    })
  }
  next()
}

/* ******************************************
 * Update Inventory — check + return errors to the EDIT view
 ******************************************/
// Same validations as "add", but I also keep inv_id, and re-render the edit view.
const checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)

  // stick everything (including inv_id) back into locals so the form stays sticky
  const fields = [
    "inv_id",
    "inv_make", "inv_model", "inv_year", "inv_description",
    "inv_image", "inv_thumbnail", "inv_price", "inv_miles",
    "inv_color", "classification_id"
  ]
  fields.forEach(f => res.locals[f] = req.body[f])

  if (!errors.isEmpty()) {
    const utilities = require("./")
    const classificationSelect = await utilities.buildClassificationList(req.body.classification_id)
    const itemName = `${req.body.inv_make || ""} ${req.body.inv_model || ""}`.trim()

    return res.status(400).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      classificationSelect,
      errors: errors.array(),
    })
  }
  next()
}

module.exports = {
  classificationRules,
  checkClassification,
  inventoryRules,
  checkInventory,
  checkUpdateData, // <- export for update flow
}
