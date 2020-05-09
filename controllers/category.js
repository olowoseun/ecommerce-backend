const Category = require('../models/category');

const { errorHandler } = require('../helpers/dbErrorHandler');

exports.findByCategoryId = (req, res, next, id) => {
  Category.findById(id).exec((err, category) => {
    if(err || !category) {
      return res.status(400).json({
        error: 'Category not found.'
      });
    }

    req.category = category;
    next();
  });  
}

exports.getCategory = (req, res) => {
  return res.json(req.category);
}

exports.getCategories = (req, res) => {
  Category.find().exec((err, categories) => {
    if(err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }

    res.json(categories);
  });
}

exports.create = (req, res) => {
  // console.log('Request body', req.body);

  const category = new Category(req.body);
  category.save((err, category) => {
    if(err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    
    res.json({ category });
  });
}

exports.update = (req, res) => {
  // console.log('Request body', req.body);

  const category = req.category;
  category.name = req.body.name;

  category.save((err, category) => {
    if(err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    
    res.json({ category });
  });
}

exports.remove = (req, res) => {
  let category = req.category;

  category.remove((err, category) => {
    if(err) {
      return res.status(400).json({
         error: errorHandler(err)
      });
    }
    res.json({
      message: 'Category deleted successfully.'
    })
  });
}