const db = require('../config/db');

async function logChange(adminId, action, tableName, recordId, previousData, newData) {
  await db.query(
    `INSERT INTO activity_log (admin_id, action, table_name, record_id, previous_data, new_data)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [adminId, action, tableName, recordId, previousData, newData]
  );

  // Keep only the last 10 unreverted entries
  await db.query(
    `DELETE FROM activity_log
     WHERE id NOT IN (
       SELECT id FROM activity_log
       WHERE reverted = FALSE
       ORDER BY created_at DESC
       LIMIT 10
     ) AND reverted = FALSE`
  );
}

module.exports = { logChange };