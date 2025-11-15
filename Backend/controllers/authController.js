const User = require('../models/User');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken');
const { validationResult } = require('express-validator');
const { sendMail } = require('../utils/mailer');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    user = new User({
      name,
      email,
      password,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Fire-and-forget emails (don’t block the response)
    const adminEmail = process.env.ADMIN_EMAIL;
    const appName = process.env.APP_NAME || 'MindCare Hub';
    const appUrl = process.env.APP_URL || 'http://localhost:5173';
    try {
      if (adminEmail) {
        sendMail({
          to: adminEmail,
          subject: `New registration: ${user.name} – ${appName}`,
          html: `
            <div style="background:#f6f7fb;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#111;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.06)">
                <tr>
                  <td style="background:#4f46e5;padding:18px 24px;color:#fff;">
                    <div style="font-size:18px;font-weight:700;">${appName}</div>
                    <div style="font-size:12px;opacity:.9;">New user registration</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 24px 8px 24px;">
                    <h2 style="margin:0 0 8px 0;font-size:20px;color:#111;">A new user just joined</h2>
                    <p style="margin:0;color:#4b5563;font-size:14px;">Here are the details of the newly registered account.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 24px 4px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 8px;">
                      <tr>
                        <td style="width:140px;color:#6b7280;font-size:13px;">Name</td>
                        <td style="font-size:14px;color:#111;font-weight:600;">${user.name}</td>
                      </tr>
                      <tr>
                        <td style="width:140px;color:#6b7280;font-size:13px;">Email</td>
                        <td style="font-size:14px;color:#111;"><a href="mailto:${user.email}" style="color:#4f46e5;text-decoration:none;">${user.email}</a></td>
                      </tr>
                      <tr>
                        <td style="width:140px;color:#6b7280;font-size:13px;">Registered</td>
                        <td style="font-size:14px;color:#111;">${new Date().toLocaleString()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 24px 24px 24px;">
                    <a href="${appUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;">Open Dashboard</a>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;padding:16px 24px;color:#6b7280;font-size:12px;">
                    You’re receiving this email because admin notifications are enabled for registrations in ${appName}.
                  </td>
                </tr>
              </table>
            </div>
          `,
          text: `New registration in ${appName}\nName: ${user.name}\nEmail: ${user.email}\nRegistered: ${new Date().toLocaleString()}\nDashboard: ${appUrl}`
        }).catch(() => {});
      }
      if (user.email) {
        sendMail({
          to: user.email,
          subject: `Welcome to ${appName}!`,
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2>Welcome to ${appName}, ${user.name.split(' ')[0]}!</h2>
              <p>We’re excited to have you on board. Start tracking your mood, sleep, and stress to build healthy habits.</p>
              <p>
                <a href="${appUrl}" style="display:inline-block;padding:10px 16px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;">Go to Dashboard</a>
              </p>
              <p>If you didn’t sign up for ${appName}, please ignore this email.</p>
              <p>— The ${appName} Team</p>
            </div>
          `,
          text: `Welcome to ${appName}! Visit ${appUrl} to get started.`
        }).catch(() => {});
      }
    } catch (_) {
      // Do not fail registration on email errors
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check for user
    // Include password field for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
