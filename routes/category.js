const express = require('express');

const router = express.Router();

const { create, update, remove, findByCategoryId, getCategory, getCategories } = require('../controllers/category');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { findByUserId } = require('../controllers/user');

router.get('/category/:categoryId', getCategory);
router.get('/categories', getCategories);
router .post('/category/create/:userId', requireSignin, isAuth, isAdmin, create);
router.put('/category/update/:categoryId/:userId', requireSignin, isAuth, isAdmin, update);
router.delete('/category/remove/:categoryId/:userId', requireSignin, isAuth, isAdmin, remove);

router.param('userId', findByUserId);
router.param('categoryId', findByCategoryId);

module.exports = router;