// seed.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Department = require('./models/Department');
const Building = require('./models/Building');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const seed = async () => {
  await connectDB();

  try {
    // Clear old data
    await User.deleteMany();
    await Department.deleteMany();
    await Building.deleteMany();
    await Room.deleteMany();

    // Create buildings
    const building1 = await Building.create({ name: "Shastri Bhavan", address: "Rajpath, New Delhi" });
    const building2 = await Building.create({ name: "Udyog Bhavan", address: "Rajpath, New Delhi" });

    // Create departments
    const deptIT = await Department.create({ name: "IT Department", building: building1._id });
    const deptHR = await Department.create({ name: "HR Department", building: building1._id });
    const deptFinance = await Department.create({ name: "Finance Department", building: building2._id });

    // Create rooms
    await Room.create([
      { name: "Conference Room A", capacity: 20, building: building1._id, allowedDepartments: [deptIT._id] },
      { name: "Conference Room B", capacity: 15, building: building1._id },
      { name: "Conference Room C", capacity: 25, building: building2._id, allowedDepartments: [deptFinance._id] },
    ]);

    // Create users
    await User.create([
      { name: "Admin User", email: "admin@test.com", password: "123456", role: "admin", department: deptIT._id },
      { name: "Official User", email: "official@test.com", password: "123456", role: "official", department: deptHR._id }
    ]);

    console.log('🌱 Dummy data seeded');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
