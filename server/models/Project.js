
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    requiredSkills: {
      type: String,
      required: true,
      trim: true,
    },
    maxMembers: {
      type: Number,
      required: true,
      min: 1,
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
    members: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
