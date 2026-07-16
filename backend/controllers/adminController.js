const db = require('../config/db');

exports.getDashboard = async (req, res, next) => {
  try {
    const totalsResult = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
        COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) AS total_raised,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
        COUNT(*) FILTER (WHERE status = 'failed') AS failed_count
      FROM donations
    `);
    const totals = totalsResult.rows[0];

    const byMethodResult = await db.query(`
      SELECT method, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
      FROM donations
      WHERE status = 'completed'
      GROUP BY method
    `);

    const recentResult = await db.query(`
      SELECT id, donor_name, amount, method, status, transaction_ref, created_at
      FROM donations
      ORDER BY created_at DESC
      LIMIT 20
    `);

    res.render('admin/dashboard', {
      adminEmail: req.session.adminEmail,
      totals,
      byMethod: byMethodResult.rows,
      recentDonations: recentResult.rows,
    });
  } catch (err) {
    next(err);
  }
};