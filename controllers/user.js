const User = require('../models/user');
const { Order } = require('../models/order');
const jwt = require('jsonwebtoken'); // to generate signed token
const expressJwt = require('express-jwt'); // authorization check

const { errorHandler } = require('../helpers/dbErrorHandler');

exports.findByUserId = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if(err || !user) {
      return res.status(400).json({
        error: 'User not found.'
      });
    }

    req.profile = user;
    next();
  });
}

 exports.getUserProfile = (req, res) => {
   req.profile.hashed_password = undefined;
   req.profile.salt = undefined;

   return res.json(req.profile);
 }

 exports.updateProfile = (req, res) => {
   User.findOneAndUpdate({ _id: req.profile._id}, {$set: req.body}, {$new: true}, (err, user) => {
    if(err) {
      return res.status(401).json({
        error: 'You are not authorized to perform this action.'
      });
    }

    user.hashed_password = undefined;
    user.salt = undefined;

    res.json(user);
   })
 }

 exports.addOrderToUserHistory = (req, res, next) => {
  let history = [];

  req.body.order.products.forEach(product => {
    history.push({
      _id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      quantity: product.count,
      transaction_id: req.body.order.transaction_id,
      amount: req.body.order.amount
    });
  });

  User.findOneAndUpdate({ _id: req.profile._id}, {$push: { history: history}}, { new: true }, 
    (err, data) => {
      if(err) {
        return res.status(400).json({
          error: 'Could not update user purchase history.'
        });
      }
      next();
  });
 };

 exports.getUserPurchaseHistory = (req, res) => {
  Order.find({ user: req.profile._id })
        .populate('user', '_id name')
        .sort('-created')
        .exec((err, orders) => {
          if(err) {
            return res.status(400).json({
              error: errorHandler(err)
            });
          }
          res.json(orders);
        });
 };