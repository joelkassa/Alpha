module.exports = function adminLocals(req, res, next) {
  res.locals.isAdmin = !!(req.session && req.session.adminId);
  next();
};