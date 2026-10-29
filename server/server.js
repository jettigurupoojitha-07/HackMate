
const express = require('express');
const Project = require('./models/Project');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ]
}));
app.use(express.json());

// Student database model
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
    },
    skills: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);

// Test route
app.get('/', (req, res) => {
  res.json({
    message: 'HackMate backend is running!',
  });
});

app.get('/api/test-projects', (req, res) => {
  res.json({ message: 'Project routes are reachable!' });
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students.' });
  }
});
// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// Create a project
app.post('/api/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    const savedProject = await project.save();

    res.status(201).json({
      message: 'Project created successfully',
      project: savedProject,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(400).json({
      message: error.message || 'Failed to create project',
    });
  }
});

// Register a student
app.post('/api/students', async (req, res) => {
  try {
    const { name, email, department, skills } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !department ||
      !skills?.trim()
    ) {
      return res.status(400).json({
        message: 'All fields are required.',
      });
    }

    const student = await Student.create({
      name: name.trim(),
      email: email.trim(),
      department,
      skills: skills.trim(),
    });

    res.status(201).json({
      message: 'Student registered successfully.',
      student,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'This email is already registered.',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Invalid student details.',
      });
    }

    console.error(error);
    res.status(500).json({
      message: 'Server error while registering student.',
    });
  }
});

// Start server after connecting to MongoDB

/* PROJECT API ROUTES */

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Fetch projects error:', error.message);
    res.status(500).json({ message: 'Failed to fetch projects.' });
  }
});

// Create a new project
app.post('/api/projects', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      requiredSkills,
      maxMembers,
      createdBy,
    } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !category ||
      !requiredSkills?.trim() ||
      !createdBy?.trim() ||
      !Number.isInteger(Number(maxMembers)) ||
      Number(maxMembers) < 1
    ) {
      return res.status(400).json({
        message: 'Please provide valid details for every field.',
      });
    }

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      category,
      requiredSkills: requiredSkills.trim(),
      maxMembers: Number(maxMembers),
      createdBy: createdBy.trim(),
      members: [createdBy.trim()],
    });

    res.status(201).json({
      message: 'Project created successfully.',
      project,
    });
  } catch (error) {
    console.error('Create project error:', error.message);
    res.status(500).json({ message: 'Failed to create project.' });
  }
});







async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing from server/.env');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`HackMate backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Backend startup failed:', error.message);
    process.exit(1);
  }
}

startServer();
