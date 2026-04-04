require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Complaint Schema
const complaintSchema = new mongoose.Schema({
  student: String,
  room: String,
  category: String,
  priority: String,
  description: String,
  status: { type: String, default: 'Pending' },
  time: { type: String, default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
});

const Complaint = mongoose.model('Complaint', complaintSchema);

// Routes
app.get('/api/complaints', async (req, res) => {
  const complaints = await Complaint.find().sort({ _id: -1 });
  res.json(complaints);
});

app.post('/api/complaints', async (req, res) => {
  const complaint = new Complaint(req.body);
  await complaint.save();
  res.json(complaint);
});

app.patch('/api/complaints/:id', async (req, res) => {
  const { status } = req.body;
  const updated = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(updated);
});

app.delete('/api/complaints/:id', async (req, res) => {
  await Complaint.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted successfully' });
});

// Connect DB + start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("DB Error:", err.message);
  });