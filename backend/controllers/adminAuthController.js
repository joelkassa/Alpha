const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.getLogin = (req, res) => {
  if (req.session && req.session.adminId) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { error: null });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('admin/login', { error: 'Please enter email and password.' });
  }

  try {
    const result = await db.query(`SELECT * FROM admin_users WHERE email = $1`, [email]);
    const admin = result.rows[0];

    if (!admin) {
      return res.render('admin/login', { error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.render('admin/login', { error: 'Invalid email or password.' });
    }

    req.session.adminId = admin.id;
    req.session.adminEmail = admin.email;
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Login error:', err.message);
    res.render('admin/login', { error: 'Something went wrong. Please try again.' });
  }
};

exports.postLogout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
};