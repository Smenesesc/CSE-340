const express = require("express")
const router = express.Router()
const invController = require("../controllers/inventoryController")
const {
  classificationRules,
  checkClassification,
  inventoryRules,
  checkInventory,
} = require("../utilities/inv-validation")

/* ===== Small helper kept from your demo routes (optional showcase) ===== */
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

/* ===== Assignment Task 1: Management View =====
 * Access only by direct URL: /inv
 * (I’m not linking this from anywhere per the instructions)
 */
router.get("/inv", invController.buildManagement)

/* ===== Assignment Task 2: Add Classification ===== */
router.get("/inv/add-classification", invController.buildAddClassification)

router.post(
  "/inv/add-classification",
  classificationRules(),
  checkClassification,
  invController.addClassification
)

/* ===== Assignment Task 3: Add Inventory ===== */
router.get("/inv/add-inventory", invController.buildAddInventory)

router.post(
  "/inv/add-inventory",
  inventoryRules(),
  checkInventory,
  invController.addInventory
)

/* ===== Existing demo routes (kept) ===== */
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

/* DB-backed detail by ID (already part of your assignment) */
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
