/* ******************************************
 * Account model
 * DB access for account registration + updates + security
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
    const sql = "SELECT 1 FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* ****************************************
* Return account data using email address
* NOTE: I include security fields for lockout logic.
**************************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      `SELECT account_id, account_firstname, account_lastname, account_email,
              account_type, account_password, failed_attempts, locked_until
         FROM account
        WHERE account_email = $1`,
      [account_email]
    )
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* ****************************************
* NEW: Return account data by id (Task 5 baseline)
**************************************** */
async function getAccountById (account_id) {
  try {
    const result = await pool.query(
      `SELECT account_id, account_firstname, account_lastname, account_email, account_type,
              failed_attempts, locked_until
         FROM account
        WHERE account_id = $1`,
      [account_id]
    )
    return result.rows[0]
  } catch (error) {
    return null
  }
}

/* ****************************************
* Update basic account info
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
* Update password hash
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
* Check email for update (exclude self)
**************************************** */
async function checkExistingEmailForUpdate (account_email, account_id) {
  try {
    const sql = "SELECT 1 FROM account WHERE account_email = $1 AND account_id <> $2"
    const result = await pool.query(sql, [account_email, account_id])
    return result.rowCount
  } catch (error) {
    return error.message
  }
}

/* ===============================
 * Security: failed login handling
 * =============================== */

/* Increment attempts; if threshold reached, set locked_until */
async function recordFailedAttempt(account_id, maxAttempts, lockMinutes) {
  try {
    const sql = `
      UPDATE account
         SET failed_attempts = failed_attempts + 1,
             locked_until = CASE
                WHEN failed_attempts + 1 >= $2 THEN NOW() + ($3 || ' minutes')::interval
                ELSE locked_until
             END
       WHERE account_id = $1
       RETURNING failed_attempts, locked_until
    `
    const result = await pool.query(sql, [account_id, maxAttempts, String(lockMinutes)])
    return result.rows[0]
  } catch (error) {
    return null
  }
}

/* Reset attempts on successful login */
async function resetFailedAttempts(account_id) {
  try {
    const sql = `
      UPDATE account
         SET failed_attempts = 0,
             locked_until    = NULL
       WHERE account_id      = $1
       RETURNING account_id
    `
    const result = await pool.query(sql, [account_id])
    return result.rows.length === 1
  } catch (error) {
    return null
  }
}

/* Admin: list currently locked accounts */
async function getLockedAccounts() {
  try {
    const sql = `
      SELECT account_id, account_firstname, account_lastname, account_email,
             account_type, failed_attempts, locked_until
        FROM account
       WHERE locked_until IS NOT NULL
         AND locked_until > NOW()
       ORDER BY locked_until DESC
    `
    const result = await pool.query(sql)
    return result.rows
  } catch (error) {
    return []
  }
}

/* Admin: unlock a specific account */
async function unlockAccount(account_id) {
  try {
    const sql = `
      UPDATE account
         SET failed_attempts = 0,
             locked_until    = NULL
       WHERE account_id      = $1
       RETURNING account_id
    `
    const result = await pool.query(sql, [account_id])
    return result.rows.length === 1
  } catch (error) {
    return null
  }
}

module.exports = { 
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword,
  checkExistingEmailForUpdate,
  // security
  recordFailedAttempt,
  resetFailedAttempts,
  getLockedAccounts,
  unlockAccount,
}
