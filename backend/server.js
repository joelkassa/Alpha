const path = require('path');
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const language = require('./middleware/language');
const sessionMiddleware = require('./config/session');
const adminLocals = require('./middleware/adminLocals');
const { doubleCsrfProtection, generateCsrfToken } = require('./middleware/csrf');

const publicRoutes = require('./routes/publicRoutes');
const donateRoutes = require('./routes/donateRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminApiRoutes = require('./routes/adminApiRoutes');
const adminListRoutes = require('./routes/adminListRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Security & performance middleware ---
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Global rate limiting (protects against general abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// --- Body parsing ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Cookies, language, sessions, admin awareness ---
app.use(cookieParser());
app.use(language);
app.use(sessionMiddleware);
app.use(adminLocals);

// --- CSRF protection ---
// Excludes the payment provider webhook, which is called by Telebirr/CBE
// directly (an external server), not by a form submitted from our own pages,
// so it can never carry our CSRF token.
app.use((req, res, next) => {
  if (req.path === '/donate/callback') {
    return next();
  }
  return doubleCsrfProtection(req, res, next);
});

app.use((req, res, next) => {
  res.locals.csrfToken = generateCsrfToken(req, res);
  next();
});

// --- View engine setup ---
app.set('views', path.join(__dirname, '../frontend/html'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// --- Static assets ---
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));
app.use('/fonts', express.static(path.join(__dirname, '../frontend/fonts')));

// --- Routes ---
app.use('/', publicRoutes);
app.use('/donate', donateRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/api', adminApiRoutes);
app.use('/admin/api/lists', adminListRoutes);
app.use('/admin/api/upload', uploadRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).render('500', { title: 'Something Went Wrong' });
  }
  res.status(500).render('500', { title: 'Something Went Wrong' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});