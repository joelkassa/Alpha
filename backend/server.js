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
const publicRoutes = require('./routes/publicRoutes');

const donateRoutes = require('./routes/donateRoutes');

const sessionMiddleware = require('./config/session');
const adminRoutes = require('./routes/adminRoutes');

const adminLocals = require('./middleware/adminLocals');

const adminApiRoutes = require('./routes/adminApiRoutes');

const adminListRoutes = require('./routes/adminListRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const { doubleCsrfProtection, generateCsrfToken } = require('./middleware/csrf');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Security & performance middleware ---
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Basic rate limiting (protects against brute force / abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// --- Body parsing ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(language);
app.use(sessionMiddleware);
app.use(doubleCsrfProtection);

// Make the token available to every template
app.use((req, res, next) => {
  res.locals.csrfToken = generateCsrfToken(req, res);
  next();
});

app.use(adminLocals);



// --- View engine setup ---
// We use EJS as the rendering engine, but keep .html as the file extension
app.set('views', path.join(__dirname, '../frontend/html'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// --- Static assets ---
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));
app.use('/fonts', express.static(path.join(__dirname, '../frontend/fonts')));

app.use('/', publicRoutes);
app.use('/donate', donateRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/api', adminApiRoutes);

app.use('/admin/api/lists', adminListRoutes);
app.use('/admin/api/upload', uploadRoutes);

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});