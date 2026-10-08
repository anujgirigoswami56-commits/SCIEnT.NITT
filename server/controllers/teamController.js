const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const TeamMember = require('../models/TeamMember');
const { getBucket } = require('../config/firebaseConfig');

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
      data: localData,
      count: localData.length
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
    // Surface Mongoose validation errors as 400 Bad Request so the
    // frontend can display the exact field-level message to the admin.
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join('; ');
      return res.status(400).json({ success: false, message: messages });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateTeamMember = async (req, res) => {
  try {
    const updatedTeamMember = await TeamMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (updatedTeamMember) {
      res.json({ success: true, data: updatedTeamMember });
    } else {
      res.status(404).json({ success: false, message: 'Team member not found' });
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join('; ');
      return res.status(400).json({ success: false, message: messages });
    }
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

/**
 * Upload a team member photo to Firebase Storage.
 *
 * Expects multer memoryStorage → req.file contains:
 *   buffer, originalname, mimetype
 *
 * Optional query params to build the storage path:
 *   ?year=24-25   (omit for faculty/admin → stored under 'admin' subfolder)
 *   ?memberId=<mongoId>  (used as filename prefix for uniqueness)
 *
 * Storage path convention (matches existing Firebase bucket structure):
 *   Team/team-members/<year>/<memberId>_<filename>   — student members
 *   Team/team-members/admin/<memberId>_<filename>    — faculty / admin
 *
 * Returns: { success, message, data: { url, storagePath } }
 */
const uploadTeamMemberImage = async (req, res) => {
  try {
    // 1. Validate file presence
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'No image file was provided. Please select an image to upload.',
      });
    }

    // 2. Validate Firebase is configured
    const bucket = getBucket();
    if (!bucket) {
      return res.status(503).json({
        success: false,
        message: 'Firebase Storage is not configured. Check FIREBASE_* environment variables.',
      });
    }

    // 3. Build destination path
    const { year, memberId } = req.query;
    const subfolder = year ? year : 'admin';
    const prefix    = memberId ? `${memberId}_` : `${Date.now()}_`;
    const safeName  = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const destPath  = `Team/team-members/${subfolder}/${prefix}${safeName}`;

    // 4. Upload buffer to Firebase Storage
    const fileRef = bucket.file(destPath);
    await fileRef.save(req.file.buffer, {
      contentType: req.file.mimetype,
      metadata: { cacheControl: 'public, max-age=31536000' },
    });

    // 5. Generate a download token and build a firebasestorage.googleapis.com URL
    // This matches the approach used by the Firebase console and linkFirebasePhotos.js
    const { randomUUID } = require('crypto');
    const token = randomUUID();
    await fileRef.setMetadata({
      metadata: { firebaseStorageDownloadTokens: token },
    });
    const encodedPath = encodeURIComponent(destPath);
    const downloadUrl =
      `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;

    console.log(`[Firebase] Uploaded → ${destPath}`);

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully to Firebase Storage',
      data: {
        url: downloadUrl,
        storagePath: destPath,
      },
    });
  } catch (error) {
    console.error('Error uploading team member image to Firebase:', error);
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