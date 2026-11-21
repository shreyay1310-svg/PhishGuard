const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, authorizeRoles('Super Admin', 'Admin'), usersController.getUsers);
router.post('/', authenticateToken, authorizeRoles('Super Admin', 'Admin'), usersController.createUser);
router.put('/:id', authenticateToken, authorizeRoles('Super Admin', 'Admin'), usersController.updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('Super Admin', 'Admin'), usersController.deleteUser);
router.patch('/:id/toggle-status', authenticateToken, authorizeRoles('Super Admin', 'Admin'), usersController.toggleStatus);

module.exports = router;
