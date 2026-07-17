module.exports = function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }

  // API/fetch requests expect JSON, not a redirect
  if (req.originalUrl.startsWith('/admin/api')) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  return res.redirect('/admin/login');
};