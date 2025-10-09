/* ******************************************
 * Account model
 * DB access for account registration + updates
 ******************************************/
const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

/* ****************************************
*   Check for existing email (registration)
**************************************** */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* ****************************************
* Return account data using email address
**************************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email]
    )
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* ****************************************
* NEW: Return account data by id (Task 5)
**************************************** */
async function getAccountById (account_id) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1',
      [account_id]
    )
    return result.rows[0]
  } catch (error) {
    return null
  }
}

/* ****************************************
* NEW: Update basic account info (Task 5)
**************************************** */
async function updateAccount (account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = `
      UPDATE account
         SET account_firstname = $1,
             account_lastname  = $2,
             account_email     = $3
       WHERE account_id        = $4
       RETURNING account_id
    `
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id
    ])
    return result.rows.length === 1
  } catch (error) {
    return null
  }
}

/* ****************************************
* NEW: Update password hash (Task 5)
**************************************** */
async function updatePassword (account_id, hashedPassword) {
  try {
    const sql = `
      UPDATE account
         SET account_password = $1
       WHERE account_id       = $2
       RETURNING account_id
    `
    const result = await pool.query(sql, [hashedPassword, account_id])
    return result.rows.length === 1
  } catch (error) {
    return null
  }
}

/* ****************************************
* NEW: Check email for update (exclude self)
**************************************** */
async function checkExistingEmailForUpdate (account_email, account_id) {
  try {
    const sql = "SELECT 1 FROM account WHERE account_email = $1 AND account_id <> $2"
    const result = await pool.query(sql, [account_email, account_id])
    return result.rowCount // >0 means someone else already uses this email
  } catch (error) {
    return error.message
  }
}

module.exports = { 
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,                 // new
  updateAccount,                  // new
  updatePassword,                 // new
  checkExistingEmailForUpdate,    // new
}
