exports.getDashboard = (req, res) => {
  res.render('admin/dashboard', {
    adminEmail: req.session.adminEmail,
  });
};