/* ******************************************
 * Account model
 * DB access for account registration
 ******************************************/
const pool = require("../database/") // use same pattern as inventory-model

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message // return the error text (controller handles failure path)
  }
}

/* ****************************************
*   Check for existing email
*   Returns >0 if duplicate found
* *************************************** */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount // 0 = none, >0 = already exists
  } catch (error) {
    return error.message // bubble DB error message
  }
}

module.exports = { 
  registerAccount,
  checkExistingEmail, // ADDED: expose email check for validator
}

