const express = require('express');

const Complaint = require('../models/Complaint');
const User = require('../models/User');

const { authenticate } =
  require('../middleware/auth');

const router = express.Router();


// =====================================================
// STUDENT - GET OWN COMPLAINTS
// =====================================================

router.get('/my', authenticate, async (req, res) => {

  try {

    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Students only.'
      });
    }

    const complaints =
      await Complaint.find({
        student: req.user.id
      })
      .populate(
        'student',
        'name email room'
      )
      .sort({
        createdAt: -1
      });

    res.json(complaints);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Could not retrieve complaints.'
    });

  }

});


// =====================================================
// WARDEN - GET ALL COMPLAINTS
// =====================================================

router.get('/', authenticate, async (req, res) => {

  try {

    if (req.user.role !== 'warden') {
      return res.status(403).json({
        message: 'Warden access required.'
      });
    }

    const complaints =
      await Complaint.find()
      .populate(
        'student',
        'name email room phone'
      )
      .sort({
        createdAt: -1
      });

    res.json(complaints);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Could not retrieve complaints.'
    });

  }

});


// =====================================================
// STUDENT - CREATE COMPLAINT
// =====================================================

router.post('/', authenticate, async (req, res) => {

  try {

    if (req.user.role !== 'student') {
      return res.status(403).json({
        message: 'Students only.'
      });
    }

    const {
      category,
      priority,
      description
    } = req.body;

    if (
      !category ||
      !description
    ) {
      return res.status(400).json({
        message:
          'Category and description are required.'
      });
    }

    const student =
      await User.findById(req.user.id);

    if (!student) {
      return res.status(404).json({
        message: 'Student not found.'
      });
    }

    const complaint =
      await Complaint.create({

        student: student._id,

        room: student.room,

        category,

        priority:
          priority || 'Medium',

        description,

        status: 'Pending',

        wardenMessage: ''

      });

    const populatedComplaint =
      await complaint.populate(
        'student',
        'name email room'
      );

    res.status(201).json(
      populatedComplaint
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Could not create complaint.'
    });

  }

});


// =====================================================
// WARDEN - UPDATE COMPLAINT
// =====================================================

router.put('/:id', authenticate, async (req, res) => {

  try {

    if (req.user.role !== 'warden') {
      return res.status(403).json({
        message: 'Warden access required.'
      });
    }

    const {
      status,
      wardenMessage
    } = req.body;

    const allowedStatuses = [
      'Pending',
      'In Progress',
      'Completed'
    ];

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message: 'Invalid complaint status.'
      });
    }

    const complaint =
      await Complaint.findById(
        req.params.id
      );

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found.'
      });
    }

    if (status !== undefined) {
      complaint.status = status;
    }

    if (wardenMessage !== undefined) {
      complaint.wardenMessage =
        wardenMessage;
    }

    await complaint.save();

    const updatedComplaint =
      await complaint.populate(
        'student',
        'name email room'
      );

    res.json(updatedComplaint);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Could not update complaint.'
    });

  }

});


// =====================================================
// WARDEN - DELETE COMPLAINT
// =====================================================

router.delete('/:id', authenticate, async (req, res) => {

  try {

    if (req.user.role !== 'warden') {
      return res.status(403).json({
        message: 'Warden access required.'
      });
    }

    const complaint =
      await Complaint.findByIdAndDelete(
        req.params.id
      );

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found.'
      });
    }

    res.json({
      message: 'Complaint deleted successfully.'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Could not delete complaint.'
    });

  }

});


module.exports = router;