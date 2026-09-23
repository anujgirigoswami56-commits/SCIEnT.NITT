const express = require('express');
const router = express.Router();
const multer = require('multer');
const teamController = require('../controllers/teamController');
const { protect, adminOnly } = require('../middleware/auth');
const { teamStorage } = require('../config/cloudConfig');

// Multer instance using Cloudinary's Team_Members storage
const uploadTeamImage = multer({ storage: teamStorage });

let seedTeams;
try {
  seedTeams = require('../scripts/AddTeamInDB').seedTeams;
} catch (e) {
  seedTeams = (req, res) => res.status(404).json({ message: "Seed module not available in this environment" });
}

// GET /api/team/all - Get all team members (public)
router.get('/all', teamController.getAllTeamMembers);

// POST /api/team/seed - Seed team data (dev/setup utility)
router.post('/seed', seedTeams);

// POST /api/team/upload-image - Upload a team member photo to Cloudinary (Admin only)
// NOTE: This route MUST be declared before /:id to prevent Express treating
// the string 'upload-image' as a MongoDB ObjectId parameter.
router.post(
  '/upload-image',
  protect,
  adminOnly,
  uploadTeamImage.single('image'), // 'image' = the form field name expected
  teamController.uploadTeamMemberImage
);

// GET /api/team/:id - Get single member by ID (public)
router.get('/:id', teamController.getTeamMemberById);

// POST /api/team - Create new team member (Admin only)
router.post('/', protect, adminOnly, teamController.createTeamMember);

// PUT /api/team/:id - Update team member (Admin only)
router.put('/:id', protect, adminOnly, teamController.updateTeamMember);

// DELETE /api/team/:id - Delete team member (Admin only)
router.delete('/:id', protect, adminOnly, teamController.deleteTeamMember);

module.exports = router;