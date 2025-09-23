const pool = require("../database/")

async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  )
}

// single-vehicle fetch by id (parameterized)
async function getVehicleById(invId) {
  const sql = `
    SELECT inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, classification_id
    FROM public.inventory
    WHERE inv_id = $1
  `
  return await pool.query(sql, [invId])
}

module.exports = { getClassifications, getVehicleById }
