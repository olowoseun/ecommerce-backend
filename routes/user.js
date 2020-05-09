const express = require('express');

const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { findByUserId, getUserProfile, updateProfile, getUserPurchaseHistory } = require('../controllers/user');
const { userSignupValidator } = require('../validators');

router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req, res) => {
  res.json({
    user: req.profile
  })
});

router.get('/user/:userId', requireSignin, isAuth, getUserProfile);
router.put('/user/:userId', requireSignin, isAuth, updateProfile);
router.get('/user/orders/:userId', requireSignin, isAuth, getUserPurchaseHistory);

router.param('userId', findByUserId);

module.exports = router;