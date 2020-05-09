const express = require('express');

const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { findByUserId, addOrderToUserHistory } = require('../controllers/user');
const { findByOrderId, create, getOrders, getOrderStatus, updateOrderStatus } = require('../controllers/order');
const { decrementQuantity } = require('../controllers/product');

const router = express.Router();

router.post('/order/create/:userId', 
  requireSignin, 
  isAuth, 
  addOrderToUserHistory, 
  decrementQuantity, 
  create
);

router.get('/orders/:userId', requireSignin, isAuth, isAdmin, getOrders);
router.get('/orders/status/:userId', requireSignin, isAuth, isAdmin, getOrderStatus);
router.put('/orders/:orderId/status/:userId', requireSignin, isAuth, isAdmin, updateOrderStatus);

router.param('userId', findByUserId);
router.param('orderId', findByOrderId);

module.exports = router;