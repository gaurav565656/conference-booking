const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// @route   POST /api/bookings
// @desc    Request a room booking
// @access  Protected
router.post("/", protect, async (req, res) => {
  const { room, date, startTime, endTime, purpose } = req.body;

  if (!room || !date || !startTime || !endTime) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  try {
    // Check if room exists
    const roomDoc = await Room.findById(room);
    if (!roomDoc) return res.status(404).json({ message: "Room not found" });

    // Check if already booked at same time
    const conflict = await Booking.findOne({
      room,
      date,
      status: "approved",
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });
    if (conflict) return res.status(400).json({ message: "Room already booked at that time" });

    // Create booking (default = pending)
    const booking = await Booking.create({
      user: req.user._id,
      room,
      date,
      startTime,
      endTime,
      purpose,
      status: "pending"
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/bookings/my
// @desc    Get current user's bookings
// @access  Protected
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("room")
      .sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   PATCH /api/bookings/:id/status
// @desc    Approve/Reject booking (admin only)
// @access  Admin
router.patch("/:id/status", protect, adminOnly, async (req, res) => {
  const { status } = req.body; // "approved" or "rejected"

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel booking (owner or admin)
// @access  Protected
router.delete("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Allow cancel if admin OR the user who created it
    if (req.user.role !== "admin" && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await booking.deleteOne();
    res.json({ message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
