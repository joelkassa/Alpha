const db = require('../config/db');
const transporter = require('../config/mailer');

exports.getHome = async (req, res, next) => {
  try {
    const lang = req.lang;

    const contentResult = await db.query(
      `SELECT block_key, block_value_en, block_value_am
       FROM content_blocks
       WHERE block_key IN ('home_hero_title','home_hero_subtitle','home_about_teaser','home_cta_text')`
    );
    const content = {};
    contentResult.rows.forEach((row) => {
      content[row.block_key] = lang === 'am' ? row.block_value_am : row.block_value_en;
    });

    const statsResult = await db.query(
      `SELECT id, label_en, label_am, value FROM stats ORDER BY sort_order ASC`
    );
    const stats = statsResult.rows.map((row) => ({
      id: row.id,
      label: lang === 'am' ? row.label_am : row.label_en,
      value: row.value,
    }));

    const programsResult = await db.query(
      `SELECT id, title_en, title_am, description_en, description_am, image_url
       FROM programs ORDER BY sort_order ASC LIMIT 3`
    );
    const programs = programsResult.rows.map((row) => ({
      id: row.id,
      title: lang === 'am' ? row.title_am : row.title_en,
      description: lang === 'am' ? row.description_am : row.description_en,
      image_url: row.image_url,
    }));

    const donorResult = await db.query(
      `SELECT id, name, logo_url, link_url FROM donor_logos ORDER BY sort_order ASC`
    );

    res.render('index', {
      title: 'Alpha Special Secondary School For the Deaf',
      content,
      stats,
      programs,
      donors: donorResult.rows,
      activePage: 'home',
    });
  } catch (err) {
    next(err);
  }
};

exports.getAbout = async (req, res, next) => {
  try {
    const lang = req.lang;

    const contentResult = await db.query(
      `SELECT block_key, block_value_en, block_value_am
       FROM content_blocks
       WHERE block_key IN ('about_history_title','about_history_body','about_mission_title','about_mission_body','about_staff_title')`
    );
    const content = {};
    contentResult.rows.forEach((row) => {
      content[row.block_key] = lang === 'am' ? row.block_value_am : row.block_value_en;
    });

    const staffResult = await db.query(
      `SELECT id, name, role_en, role_am, bio_en, bio_am, photo_url
       FROM staff ORDER BY sort_order ASC`
    );
    const staff = staffResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      role: lang === 'am' ? row.role_am : row.role_en,
      bio: lang === 'am' ? row.bio_am : row.bio_en,
      photo_url: row.photo_url,
    }));

    res.render('about', {
      title: lang === 'am' ? 'ስለ እኛ — አልፋ ትምህርት ቤት' : 'About Us — Alpha School',
      content,
      staff,
      activePage: 'about',
    });
  } catch (err) {
    next(err);
  }
};

exports.getPrograms = async (req, res, next) => {
  try {
    const lang = req.lang;

    const programsResult = await db.query(
      `SELECT id, title_en, title_am, description_en, description_am, image_url
       FROM programs ORDER BY sort_order ASC`
    );
    const programs = programsResult.rows.map((row) => ({
      id: row.id,
      title: lang === 'am' ? row.title_am : row.title_en,
      description: lang === 'am' ? row.description_am : row.description_en,
      image_url: row.image_url,
    }));

    const galleryResult = await db.query(
      `SELECT id, image_url, caption_en, caption_am
       FROM gallery_images ORDER BY sort_order ASC`
    );
    const gallery = galleryResult.rows.map((row) => ({
      id: row.id,
      image_url: row.image_url,
      caption: lang === 'am' ? row.caption_am : row.caption_en,
    }));

    res.render('programs', {
      title: lang === 'am' ? 'ፕሮግራሞች — አልፋ ትምህርት ቤት' : 'Programs — Alpha School',
      programs,
      gallery,
      activePage: 'programs',
    });
  } catch (err) {
    next(err);
  }
};

exports.getContact = (req, res) => {
  const lang = req.lang;
  res.render('contact', {
    title: lang === 'am' ? 'አግኙን — አልፋ ትምህርት ቤት' : 'Contact Us — Alpha School',
    activePage: 'contact',
    success: req.query.success === '1',
    error: null,
    formData: {},
  });
};

exports.postContact = async (req, res) => {
  const lang = req.lang;
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.render('contact', {
      title: lang === 'am' ? 'አግኙን — አልፋ ትምህርት ቤት' : 'Contact Us — Alpha School',
      activePage: 'contact',
      success: false,
      error: lang === 'am' ? 'እባክዎ ሁሉንም መስኮች ይሙሉ' : 'Please fill in all fields.',
      formData: { name, email, message },
    });
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_RECEIVER_EMAIL,
      replyTo: email,
      subject: `New contact form message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return res.redirect('/contact?success=1');
  } catch (err) {
    console.error('Contact form email error:', err.message);
    return res.render('contact', {
      title: lang === 'am' ? 'አግኙን — አልፋ ትምህርት ቤት' : 'Contact Us — Alpha School',
      activePage: 'contact',
      success: false,
      error: lang === 'am' ? 'መልዕክቱ አልተላከም። እባክዎ ቆይተው ይሞክሩ።' : 'Message could not be sent. Please try again later.',
      formData: { name, email, message },
    });
  }
};