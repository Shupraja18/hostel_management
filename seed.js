require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Complaint = require('./models/Complaint');


// ========================================
// SEED DATABASE
// ========================================

async function seed() {
  try {
    console.log('Connecting to MongoDB...');

    // ------------------------------------
    // CONNECT TO DATABASE
    // ------------------------------------

    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected.');

    // ------------------------------------
    // CLEAR EXISTING DATA
    // ------------------------------------

    await User.deleteMany({});
    await Complaint.deleteMany({});

    console.log('Old data cleared.');

    // ------------------------------------
    // CREATE PASSWORDS
    // ------------------------------------

    const studentPassword = await bcrypt.hash(
      'student123',
      12
    );

    const wardenPassword = await bcrypt.hash(
      'warden123',
      12
    );

    // ------------------------------------
    // CREATE STUDENT
    // ------------------------------------

    const student = await User.create({
      name: 'Rajesh Kumar',
      email: 'student@hostelcare.com',
      password: studentPassword,
      role: 'student',
      room: 'B-402',
      phone: '9876543210'
    });

    // ------------------------------------
    // CREATE WARDEN
    // ------------------------------------

    const warden = await User.create({
      name: 'Dr. Anil Sharma',
      email: 'warden@hostelcare.com',
      password: wardenPassword,
      role: 'warden'
    });

    console.log('Student and warden created.');

    // ------------------------------------
    // CREATE SAMPLE COMPLAINTS
    // ------------------------------------

    await Complaint.create([
  {
    student: student._id,
    room: student.room,
    category: 'Plumbing',
    priority: 'High',
    description: 'Bathroom tap is leaking continuously.',
    status: 'Pending'
  },

  {
    student: student._id,
    room: student.room,
    category: 'Internet',
    priority: 'Medium',
    description: 'Wi-Fi connection keeps disconnecting in my room.',
    status: 'In Progress'
  },

  {
    student: student._id,
    room: student.room,
    category: 'Electrical',
    priority: 'Low',
    description: 'Study room light is not working.',
    status: 'Completed'
  }
]);

    console.log('Sample complaints created.');

    // ------------------------------------
    // SUCCESS MESSAGE
    // ------------------------------------

    console.log('');
    console.log('========================================');
    console.log('DATABASE SEEDED SUCCESSFULLY ✅');
    console.log('========================================');

    console.log('');

    console.log('STUDENT LOGIN');
    console.log('Email: student@hostelcare.com');
    console.log('Password: student123');
    console.log('Room: B-402');

    console.log('');

    console.log('WARDEN LOGIN');
    console.log('Email: warden@hostelcare.com');
    console.log('Password: warden123');

    console.log('');

    // ------------------------------------
    // DISCONNECT
    // ------------------------------------

    await mongoose.disconnect();

    console.log('Database disconnected.');
    console.log('Seed completed successfully.');

    process.exit(0);

  } catch (error) {

    console.error('');
    console.error('========================================');
    console.error('SEED ERROR ❌');
    console.error('========================================');
    console.error(error);
    console.error('');

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Could not disconnect from MongoDB.');
    }

    process.exit(1);
  }
}


// ========================================
// RUN SEED
// ========================================

seed();