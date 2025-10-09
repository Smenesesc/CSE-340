const express = require("express")
const router = express.Router()
const invController = require("../controllers/inventoryController")
const utilities = require("../utilities") // I want handleErrors + requireEmployee for admin routes
const {
  classificationRules,
  checkClassification,
  inventoryRules,
  checkInventory,
  checkUpdateData, // validation handler for update flow
} = require("../utilities/inv-validation")

function renderVehicleHTML({ image, name, price, description, color, miles }) {
  return `
    <h1>${name}</h1>
    <div class="vehicle-detail">
      <div class="vehicle-detail__image">
        <img src="${image}" alt="${name}" onerror="this.src='/images/vehicles/no-image.png'"/>
      </div>
      <div class="vehicle-detail__info">
        <ul class="vehicle-detail__meta">
          <li><strong>Price:</strong> ${new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(price)}</li>
          <li><strong>Color:</strong> ${color}</li>
          <li><strong>Miles:</strong> ${new Intl.NumberFormat("en-US").format(miles)}</li>
        </ul>
        <p><strong>Description:</strong> ${description}</p>
      </div>
    </div>
  `
}

/* ===== Assignment Task 1/2: Management View (ADMIN ONLY) =====
 * Access only by direct URL: /inv  (guarded by requireEmployee)
 */
router.get(
  "/inv",
  utilities.checkLogin,
  utilities.requireEmployee,
  utilities.handleErrors(invController.buildManagement)
)

/* ===== JSON endpoint used by management view (ADMIN ONLY) ===== */
router.get(
  "/inv/getInventory/:classification_id",
  utilities.checkLogin,
  utilities.requireEmployee,
  utilities.handleErrors(invController.getInventoryJSON)
)

/* ===== Edit inventory (ADMIN ONLY) ===== */
router.get(
  "/inv/edit/:inv_id",
  utilities.checkLogin,
  utilities.requireEmployee,
  utilities.handleErrors(invController.editInventoryView)
)

/* ===== Update inventory (ADMIN ONLY) ===== */
router.post(
  "/inv/update",
  utilities.checkLogin,
  utilities.requireEmployee,
  inventoryRules(),      // same rules as "add"
  checkUpdateData,       // errors return to the edit view
  utilities.handleErrors(invController.updateInventory)
)

/* ===== Delete inventory (ADMIN ONLY) ===== */
router.get(
  "/inv/delete/:inv_id",
  utilities.checkLogin,
  utilities.requireEmployee,
  utilities.handleErrors(invController.buildDeleteConfirmation)
)

router.post(
  "/inv/delete",
  utilities.checkLogin,
  utilities.requireEmployee,
  utilities.handleErrors(invController.deleteInventory)
)

/* ===== Add Classification (ADMIN ONLY) ===== */
router.get(
  "/inv/add-classification",
  utilities.checkLogin,
  utilities.requireEmployee,
  utilities.handleErrors(invController.buildAddClassification)
)

router.post(
  "/inv/add-classification",
  utilities.checkLogin,
  utilities.requireEmployee,
  classificationRules(),
  checkClassification,
  utilities.handleErrors(invController.addClassification)
)

/* ===== Add Inventory (ADMIN ONLY) ===== */
router.get(
  "/inv/add-inventory",
  utilities.checkLogin,
  utilities.requireEmployee,
  utilities.handleErrors(invController.buildAddInventory)
)

router.post(
  "/inv/add-inventory",
  utilities.checkLogin,
  utilities.requireEmployee,
  inventoryRules(),
  checkInventory,
  utilities.handleErrors(invController.addInventory)
)

/* ===== Public demo/detail routes (left public on purpose) ===== */
router.get("/custom", (req, res, next) => {
  try {
    const vehicleHTML = renderVehicleHTML({
      image: "/images/vehicles/delorean.jpg",
      name: "DMC Delorean (Custom)",
      price: 88000,
      description: "Gull-wing icon.",
      color: "Stainless",
      miles: 1985
    })
    res.render("inventory/detail", { active: "custom", title: "DMC Delorean (Custom)", vehicleHTML })
  } catch (e) { next(e) }
})

router.get("/sedan", (req, res, next) => {
  try {
    const vehicleHTML = renderVehicleHTML({
      image: "/images/vehicles/crwn-vic.jpg",
      name: "2011 Ford Crown Victoria",
      price: 23995,
      description: "Roomy, smooth ride.",
      color: "White",
      miles: 85912
    })
    res.render("inventory/detail", { active: "sedan", title: "2011 Ford Crown Victoria", vehicleHTML })
  } catch (e) { next(e) }
})

router.get("/sport", (req, res, next) => {
  try {
    const vehicleHTML = renderVehicleHTML({
      image: "/images/vehicles/camaro.jpg",
      name: "2019 Chevy Camaro",
      price: 45100,
      description: "Fast and fun.",
      color: "Black",
      miles: 22980
    })
    res.render("inventory/detail", { active: "sport", title: "2019 Chevy Camaro", vehicleHTML })
  } catch (e) { next(e) }
})

router.get("/suv", (req, res, next) => {
  try {
    const vehicleHTML = renderVehicleHTML({
      image: "/images/vehicles/escalade.jpg",
      name: "2019 Cadillac Escalade",
      price: 75195,
      description: "Lux interior.",
      color: "Black",
      miles: 41958
    })
    res.render("inventory/detail", { active: "suv", title: "2019 Cadillac Escalade", vehicleHTML })
  } catch (e) { next(e) }
})

router.get("/truck", (req, res, next) => {
  try {
    const vehicleHTML = renderVehicleHTML({
      image: "/images/vehicles/wrangler.jpg",
      name: "2010 Jeep Wrangler",
      price: 31250,
      description: "Trail-ready.",
      color: "Yellow",
      miles: 67340
    })
    res.render("inventory/detail", { active: "truck", title: "2010 Jeep Wrangler", vehicleHTML })
  } catch (e) { next(e) }
})

/* DB-backed detail by ID (public) */
router.get("/detail/:invId", (req, res, next) => {
  try { return invController.buildDetail(req, res, next) } catch (e) { next(e) }
})

/* Intentional 500 route (test) */
router.get("/debug/error", (req, res, next) => {
  try {
    const err = new Error("Intentional test error")
    err.status = 500
    throw err
  } catch (e) { next(e) }
})

module.exports = router
