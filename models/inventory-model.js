// models/inventory-model.js
const pool = require("../database/");

async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

//get a single vehicle by id (parameterized $1)
async function getVehicleById(invId) {
  const sql = `
    SELECT inv_id, inv_make, inv_model, inv_year, inv_price, inv_miles,
           inv_color, inv_description, inv_image, inv_thumbnail
    FROM public.inventory
    WHERE inv_id = $1
  `;
  return await pool.query(sql, [invId]);
}

// export both
module.exports = { getClassifications, getVehicleById };
