const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Department = require('../models/Department'); // 🔧 FIX
require('dotenv').config();

const router = express.Router();


// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @route   POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  // Map domains to department names
  const domainDeptMap = {
    "it.com": "68af47852359dfd30d3d2a69",
    "finance.com": "68af47862359dfd30d3d2a6d",
    "hr.com": "68af47862359dfd30d3d2a6b"
  };
  try {
    // Validate email domain
    const emailDomain = email.split("@")[1];
    if (!emailDomain || !Object.keys(domainDeptMap).some(domain => emailDomain.endsWith(domain))) {
      return res.status(400).json({ message: "Invalid email domain" });
    }

    // Find department by domain
    const deptId = domainDeptMap[Object.keys(domainDeptMap).find(domain => emailDomain.endsWith(domain))];
    const departmentDoc = await Department.findById(deptId);

    if (!departmentDoc) {
      return res.status(400).json({ message: "Department not found for domain" });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Write user to DB with correct departmentID
    console.log('Creating user:', {
      name,
      email,
      password: hashedPassword,
      role: "official",
      department: departmentDoc._id
    });
    
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "official",
      department: departmentDoc._id
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate("department");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
