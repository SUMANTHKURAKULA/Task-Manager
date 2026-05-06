const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getTasks, getTask, createTask, updateTask, deleteTask, getDashboardStats
} = require('../controllers/taskController');

const router = express.Router();

router.use(protect);

router.get('/stats', getDashboardStats);

router.route('/')
  .get(getTasks)
  .post(authorize('admin'), createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)  // Both admin and member can update (with restrictions in controller)
  .delete(authorize('admin'), deleteTask);

module.exports = router;
