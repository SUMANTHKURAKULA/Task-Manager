const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getProjects, getProject, createProject, updateProject,
  deleteProject, addMember, removeMember
} = require('../controllers/projectController');

const router = express.Router();

router.use(protect); // All project routes require authentication

router.route('/')
  .get(getProjects)
  .post(authorize('admin'), createProject);

router.route('/:id')
  .get(getProject)
  .put(authorize('admin'), updateProject)
  .delete(authorize('admin'), deleteProject);

router.post('/:id/members', authorize('admin'), addMember);
router.delete('/:id/members/:userId', authorize('admin'), removeMember);

module.exports = router;
