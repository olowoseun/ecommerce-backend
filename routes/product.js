const express = require('express');

const router = express.Router();

const { 
  create,
  remove, 
  update, 
  findByProductId,
  all,
  getProduct, 
  getProducts, 
  getRelatedProducts, 
  getProductCategories, 
  getProductsBySearch,
  getProductPhoto 
} = require('../controllers/product');

const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { findByUserId } = require('../controllers/user');

router.get('/product/:productId', getProduct);
router.get('/products', getProducts);
router.get('/products/search', all);
router.get('/products/categories', getProductCategories);
router.get('/products/related/:productId', getRelatedProducts);
router.get('/product/photo/:productId', getProductPhoto);

router.post('/products/search', getProductsBySearch);

router.post('/product/create/:userId', requireSignin, isAuth, isAdmin, create);
router.put('/product/update/:productId/:userId', requireSignin, isAuth, isAdmin, update);
router.delete('/product/remove/:productId/:userId', requireSignin, isAuth, isAdmin, remove);

router.param('userId', findByUserId);
router.param('productId', findByProductId);

module.exports = router;