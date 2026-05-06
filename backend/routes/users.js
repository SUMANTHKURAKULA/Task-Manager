const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getUsers, getUser, updateUserRole, deleteUser } = require('../controllers/userController');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // All user management is admin-only

router.route('/').get(getUsers);
router.route('/:id').get(getUser).delete(deleteUser);
router.put('/:id/role', updateUserRole);

module.exports = router;
