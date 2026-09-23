const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const TeamMember = require('../models/TeamMember');

const LOCAL_STORE_FILE = path.join(__dirname, '../data/local_team_members.json');

// Helper to read local JSON store
const readLocalStore = () => {
  try {
    if (!fs.existsSync(LOCAL_STORE_FILE)) {
      return [];
    }
    const content = fs.readFileSync(LOCAL_STORE_FILE, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error('Error reading local team store:', err);
    return [];
  }
};

// Helper to write local JSON store
const writeLocalStore = (data) => {
  try {
    fs.mkdirSync(path.dirname(LOCAL_STORE_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local team store:', err);
  }
};

const isDbConnected = () => mongoose.connection.readyState === 1;

// Get all team members
const getAllTeamMembers = async (req, res) => {
  try {
    if (isDbConnected()) {
      const teamMembers = await TeamMember.find().sort({ order: 1, name: 1 }).select('-createdAt');
      return res.status(200).json({
        success: true,
        message: 'All team members fetched successfully',
        data: teamMembers,
        count: teamMembers.length,
      });
    }

    // Fallback when MongoDB is offline
    const localData = readLocalStore();
    return res.status(200).json({
      success: true,
      message: "All team members fetched successfully",
      data: teamMembers,
      count: teamMembers.length
    });

  } catch (error) {
    console.error("Error in getAllTeamMembers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch team members",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getTeamMemberById = async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (teamMember) {
      res.json({ success: true, data: teamMember });
    } else {
      res.status(404).json({ success: false, message: 'Team member not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createTeamMember = async (req, res) => {
  try {
    const newTeamMember = new TeamMember(req.body);
    const savedTeamMember = await newTeamMember.save();
    res.status(201).json({ success: true, data: savedTeamMember });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateTeamMember = async (req, res) => {
  try {
    const updatedTeamMember = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedTeamMember) {
      res.json({ success: true, data: updatedTeamMember });
    } else {
      res.status(404).json({ success: false, message: 'Team member not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteTeamMember = async (req, res) => {
  try {
    const deletedTeamMember = await TeamMember.findByIdAndDelete(req.params.id);
    if (deletedTeamMember) {
      res.json({ success: true, message: 'Team member deleted' });
    } else {
      res.status(404).json({ success: false, message: 'Team member not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Upload a team member photo to Cloudinary
// Called AFTER multer middleware has already streamed the file to Cloudinary.
// multer attaches req.file with the Cloudinary response (including secure_url).
const uploadTeamMemberImage = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({
        success: false,
        message: 'No image file was provided. Please select an image to upload.',
      });
    }

    // req.file.path is the Cloudinary secure_url when using multer-storage-cloudinary
    const imageUrl = req.file.path;

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: imageUrl,
        public_id: req.file.filename, // Cloudinary public_id for future deletion if needed
      },
    });
  } catch (error) {
    console.error('Error uploading team member image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getAllTeamMembers,
  getTeamMemberById,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  uploadTeamMemberImage,
};