const express = require('express');
const { getUsers, getUserById, updateProfile, blockUser, unblockUser, getOnlineUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getUsers);                       // GET /api/users?search=
router.get('/online', getOnlineUsers);           // GET /api/users/online
router.get('/:id', getUserById);                 // GET /api/users/:id
router.put('/profile', uploadAvatar, updateProfile);  // PUT /api/users/profile
router.post('/block/:id', blockUser);            // POST /api/users/block/:id
router.post('/unblock/:id', unblockUser);        // POST /api/users/unblock/:id

module.exports = router;
