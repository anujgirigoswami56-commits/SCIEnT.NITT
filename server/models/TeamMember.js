const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  role: {
    type: String,
    required: true,
    enum: [
      "Faculty Advisor",
      "Core",
      "Ex-Core",
      "Senior Manager",
      "Manager",
      "Deputy Manager",
      "Ex-Manager",
      "Senior Project Manager",
      "Project Manager",
      "Admin Executive",
      "Technical Executive",
      "Facility Executive",
      "External Affairs Executive",
      "Internal Affairs Executive",
      "Project Operations Executive"
    ]
  },

  subteam: {
    type: String,
    enum: [
      "Cores",
      "Ex-Cores",
      "Project Management",
      "DevOps",
      "Corporate Communications",
      "Corporate Communication",
      "Creatives",
      null
    ],
    default: null
  },

  isMock: {
    type: Boolean,
    default: false
  },

  Department: {
    type: String,
    default: null
  },

  photoUrl: {
    type: String,
    default: null
  },

  linkedin: {
    type: String,
    default: ""
  },

  instagram: {
    type: String,
    default: ""
  },

  email: {
    type: String,
    default: ""
  },

  year: {
    type: String,
    default: null
  },

  description: {
    type: String,
    default: ""
  },

  order: {
    type: Number,
    default: 0
  },

  cardColor: {
    type: String,
    default: "#facc15"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster filtering by role or subteam
teamMemberSchema.index({ role: 1, subteam: 1 });

const TeamMember = mongoose.model("TeamMember", teamMemberSchema);

module.exports = TeamMember;