/* ******************************************
 * Inventory model
 * I keep all DB reads/writes here and return clean results to the controller.
 ******************************************/
const pool = require("../database/")

/* Get all classifications (used by nav + select list) */
async function getClassifications() {
  const sql = `
    SELECT classification_id, classification_name
    FROM classification
    ORDER BY classification_name
  `
  return pool.query(sql)
}

/* Insert a new classification (validated upstream) */
async function insertClassification(classification_name) {
  const sql = `
    INSERT INTO classification (classification_name)
    VALUES ($1)
    RETURNING classification_id, classification_name
  `
  return pool.query(sql, [classification_name])
}

/* Insert a new inventory row (validated upstream) */
async function insertInventory(item) {
  const sql = `
    INSERT INTO inventory
      (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
       inv_price, inv_miles, inv_color, classification_id)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING inv_id
  `
  const params = [
    item.inv_make,
    item.inv_model,
    item.inv_year,
    item.inv_description,
    item.inv_image,
    item.inv_thumbnail,
    item.inv_price,
    item.inv_miles,
    item.inv_color,
    item.classification_id,
  ]
  return pool.query(sql, params)
}

/* Get a vehicle by id (used by detail view) */
async function getVehicleById(invId) {
  const sql = `
    SELECT inv_id, inv_make, inv_model, inv_year, inv_description, inv_image,
           inv_thumbnail, inv_price, inv_miles, inv_color, classification_id
    FROM inventory
    WHERE inv_id = $1
  `
  return pool.query(sql, [invId])
}

module.exports = {
  getClassifications,
  insertClassification,
  insertInventory,
  getVehicleById,
}
