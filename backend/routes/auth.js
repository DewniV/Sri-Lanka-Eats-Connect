const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Email transporter (uses Gmail or any SMTP — set SMTP_USER and SMTP_PASS in .env)
const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Send welcome email to new customer
async function sendCustomerWelcomeEmail(customerEmail, customerName) {
  const transporter = createTransporter();
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: `"SL Eats Connect" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Welcome to SL Eats Connect, ${customerName}! 🍛`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #c0392b; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to SL Eats Connect 🍛</h1>
          </div>
          <div style="padding: 30px; background: #fff;">
            <h2>Hi ${customerName}! 👋</h2>
            <p>Your account has been created successfully. Welcome to Sri Lanka's restaurant discovery platform!</p>
            <p>Here's what you can do:</p>
            <ul>
              <li>🔍 <strong>Browse</strong> 50+ restaurants across Sri Lanka</li>
              <li>🤖 <strong>Chat with Nila</strong> — our AI food guide who can find restaurants and book tables for you</li>
              <li>📅 <strong>Make reservations</strong> at your favourite restaurants</li>
              <li>⭐ <strong>Earn Eats Points</strong> on every booking — redeemable for discounts</li>
              <li>❤️ <strong>Save favourites</strong> so you never lose track of a great spot</li>
            </ul>
            <p style="color: #666; font-size: 14px;">Start exploring at <a href="https://sri-lanka-eats-connect.vercel.app">sri-lanka-eats-connect.vercel.app</a></p>
            <p>Enjoy your dining experiences!<br><strong>The SL Eats Connect Team</strong></p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('Failed to send customer welcome email:', err.message);
  }
}

// Send welcome email to new vendor
async function sendVendorWelcomeEmail(vendorEmail, vendorName, restaurantName) {
  const transporter = createTransporter();
  if (!transporter) return; // Skip if SMTP not configured

  try {
    await transporter.sendMail({
      from: `"SL Eats Connect" <${process.env.SMTP_USER}>`,
      to: vendorEmail,
      subject: `Welcome to SL Eats Connect — ${restaurantName} is now listed!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #c0392b; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SL Eats Connect</h1>
          </div>
          <div style="padding: 30px; background: #fff;">
            <h2>Welcome, ${vendorName}! 🎉</h2>
            <p>Your restaurant <strong>${restaurantName}</strong> has been successfully listed on SL Eats Connect.</p>
            <p>Customers can now discover your restaurant, view your menu, and make reservations through our platform.</p>
            <h3>What's next?</h3>
            <ul>
              <li>Log in to your <strong>Vendor Dashboard</strong> to update your restaurant details</li>
              <li>Set your <strong>table availability</strong> so customers know when to book</li>
              <li>Add your <strong>opening hours</strong> and a great cover photo</li>
              <li>Keep your <strong>description updated</strong> — the more detail you add, the better our AI chatbot can recommend your restaurant</li>
            </ul>
            <p style="color: #666; font-size: 14px;">If you have any questions, reply to this email and we'll be happy to help.</p>
            <p>Best wishes,<br><strong>The SL Eats Connect Team</strong></p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('Failed to send vendor welcome email:', err.message);
  }
}

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, password, role,
      // Vendor-specific restaurant fields
      restaurantName, restaurantDescription, restaurantAddress,
      restaurantCity, restaurantPhone, restaurantEmail,
      restaurantCuisineType, restaurantPriceRange, totalTables,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: role || 'customer' });

    // If registering as vendor, auto-create their restaurant listing
    let restaurant = null;
    if ((role === 'vendor') && restaurantName) {
      restaurant = await Restaurant.create({
        owner: user._id,
        name: restaurantName,
        description: restaurantDescription || '',
        address: restaurantAddress || '',
        city: restaurantCity || '',
        phone: restaurantPhone || '',
        email: restaurantEmail || email,
        cuisineType: restaurantCuisineType || '',
        priceRange: restaurantPriceRange || 'mid',
        totalTables: totalTables || 10,
        availableTables: totalTables || 10,
        isActive: true,
        isVerified: false,
      });

      // Send welcome email to vendor (fire and forget — don't block response)
      sendVendorWelcomeEmail(email, name, restaurantName);
    } else {
      // Send welcome email to customer (fire and forget — don't block response)
      sendCustomerWelcomeEmail(email, name);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
      restaurant: restaurant ? { _id: restaurant._id, name: restaurant.name } : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
