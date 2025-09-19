const express = require("express")
const router = express.Router()
const invController = require("../controllers/inventoryController")

// Route to show details for one vehicle by its ID
router.get("/detail/:invId", invController.buildDetail)

module.exports = router
