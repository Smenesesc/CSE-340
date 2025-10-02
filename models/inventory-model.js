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

/* ******************************************
 * Get all inventory items for a classification
 * (re-used by the management JSON endpoint)
 ******************************************/
async function getInventoryByClassificationId(classification_id) {
  const sql = `
    SELECT inv_id, inv_make, inv_model, inv_year, inv_price, inv_miles,
           inv_color, inv_description, inv_image, inv_thumbnail, classification_id
    FROM inventory
    WHERE classification_id = $1
    ORDER BY inv_make, inv_model
  `
  const result = await pool.query(sql, [classification_id])
  return result.rows
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
// I mirror the course example; return the updated row to the controller.
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

module.exports = {
  getClassifications,
  insertClassification,
  insertInventory,
  getVehicleById,
  getInventoryByClassificationId,
  updateInventory, // <- added export
}
