/**
 * User Management Controller for PhishGuard
 * CRUD operations, role assignment, and active status toggling.
 */

const bcrypt = require('bcryptjs');
const { inMemoryStore } = require('../config/db');

exports.getUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;

    let users = inMemoryStore.users.map(u => ({
      userId: u.UserID,
      fullName: u.FullName,
      email: u.Email,
      role: u.RoleName,
      roleId: u.RoleID,
      isActive: u.IsActive,
      createdAt: u.CreatedAt
    }));

    if (role && role !== 'ALL') {
      users = users.filter(u => u.role.toLowerCase() === role.toLowerCase());
    }

    if (status && status !== 'ALL') {
      const activeBool = status.toLowerCase() === 'active';
      users = users.filter(u => u.isActive === activeBool);
    }

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }

    res.json({
      success: true,
      roles: inMemoryStore.roles,
      data: users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { fullName, email, password, roleId } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existing = inMemoryStore.users.find(u => u.Email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const targetRoleId = parseInt(roleId, 10) || 4;
    const roleObj = inMemoryStore.roles.find(r => r.RoleID === targetRoleId) || inMemoryStore.roles[3];

    const newUser = {
      UserID: inMemoryStore.users.length + 1,
      FullName: fullName,
      Email: email.toLowerCase(),
      PasswordHash: passwordHash,
      RoleID: roleObj.RoleID,
      RoleName: roleObj.RoleName,
      IsActive: true,
      CreatedAt: new Date().toISOString()
    };

    inMemoryStore.users.push(newUser);

    inMemoryStore.userActivity.unshift({
      ActivityID: inMemoryStore.userActivity.length + 1,
      UserID: req.user ? req.user.userId : 1,
      ActivityType: 'USER_MANAGED',
      Description: `Created user ${fullName} (${roleObj.RoleName})`,
      ActivityDate: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        userId: newUser.UserID,
        fullName: newUser.FullName,
        email: newUser.Email,
        role: newUser.RoleName,
        isActive: newUser.IsActive,
        createdAt: newUser.CreatedAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create user', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { fullName, email, roleId, isActive } = req.body;

    const user = inMemoryStore.users.find(u => u.UserID === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (fullName) user.FullName = fullName;
    if (email) user.Email = email.toLowerCase();
    if (roleId) {
      const roleObj = inMemoryStore.roles.find(r => r.RoleID === parseInt(roleId, 10));
      if (roleObj) {
        user.RoleID = roleObj.RoleID;
        user.RoleName = roleObj.RoleName;
      }
    }
    if (typeof isActive === 'boolean') {
      user.IsActive = isActive;
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        userId: user.UserID,
        fullName: user.FullName,
        email: user.Email,
        role: user.RoleName,
        roleId: user.RoleID,
        isActive: user.IsActive
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user', error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    // Prevent deleting main admin
    if (userId === 1) {
      return res.status(400).json({ success: false, message: 'Cannot delete primary root administrator' });
    }

    const index = inMemoryStore.users.findIndex(u => u.UserID === userId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    inMemoryStore.users.splice(index, 1);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: err.message });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (userId === 1) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate primary administrator' });
    }

    const user = inMemoryStore.users.find(u => u.UserID === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.IsActive = !user.IsActive;
    res.json({
      success: true,
      message: `User account ${user.IsActive ? 'activated' : 'deactivated'} successfully`,
      data: { userId: user.UserID, isActive: user.IsActive }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle status', error: err.message });
  }
};
