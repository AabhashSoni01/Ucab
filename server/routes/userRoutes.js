const express = require('express');
const router = express.Router();
const {
  registerUser, loginUser, getUserProfile, updateUserProfile,
} = require('../controllers/userController');
const { protectUser } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protectUser, getUserProfile);
router.put('/profile', protectUser, updateUserProfile);

module.exports = router;