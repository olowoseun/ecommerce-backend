const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');

const Product = require('../models/product');

const { errorHandler } = require('../helpers/dbErrorHandler');


exports.findByProductId = (req, res, next, id) => {
  Product.findById(id)
  .populate('category')
  .exec((err, product) => {
    if(err || !product) {
      return res.status(400).json({
        error: 'Product not found.'
      });
    }

    req.product = product;
    next();
  });  
}

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
}

exports.create = (req, res) => {
  // console.log('Request body', req.body);
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if(err) {
      return res.status(400).json({
        error: 'Image could not be uploaded.'
      });
    }

    const { name, description, price, category, quantity, shipping } = fields;

    if(!name || !description || !price || !category || !quantity || !shipping) {
      return res.status(400).json({
        error: 'All fields are required.'
      });
    }

    let product = new Product(fields);

    if(files.photo) {
      // console.log('Files Photos:', files.photo);

      if(files.photo.size > 1000000) {
        return res.status(400).json({
          error: 'Image size should be less than 1MB.'
        });
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    product.save((err, product) => {
      if(err) {
        return res.status(400).json({
          error: errorHandler(err)
        })
      }
      res.json({ product });
    });
  });

}

exports.update = (req, res) => {
  // console.log('Request body', req.body);
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if(err) {
      return res.status(400).json({
        error: 'Image could not be uploaded.'
      });
    }

    const { name, description, price, category, quantity, shipping } = fields;

    if(!name || !description || !price || !category || !quantity || !shipping) {
      return res.status(400).json({
        error: 'All fields are required.'
      });
    }

    let product = req.product;
    product = _.extend(product, fields);

    if(files.photo) {
      // console.log('Files Photos:', files.photo);

      if(files.photo.size > 1000000) {
        return res.status(400).json({
          error: 'Image size should be less than 1MB.'
        });
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    product.save((err, product) => {
      if(err) {
        return res.status(400).json({
          error: errorHandler(err)
        })
      }
      res.json({ product });
    });
  });

}

exports.remove = (req, res) => {
  let product = req.product;

  product.remove((err, product) => {
    if(err) {
      return res.status(400).json({
         error: errorHandler(err)
      });
    }
    res.json({
      message: 'Product deleted successfully.'
    })
  });
} 

/** 
 * Sold/Arrival
 * By sold: /products?sortBy=sold&order=desc&limit=4
 * By arrival: /products?sortBy=createAt&order=desc&limit=4
 * if no params, return all products
 **/ 
exports.getProducts = (req, res) => {
  let order = req.query.order ? req.query.order : 'asc';
  let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
  let limit = req.query.limit ? parseInt(req.query.limit) : 5;

  Product.find()
    .select('-photo')
    .populate('category')
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, products) => {
      if(err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }

      res.json(products);
    });
  
}

/** 
 * find the product based on the requested product category.
 * other products that have same category will be returned
 **/ 
exports.getRelatedProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 5;

  Product.find({ _id: { $ne: req.product}, category: req.product.category })
          .limit(limit)
          .populate('category', '_id name')
          .exec((err, products) => {
            if(err) {
              return res.status(400).json({
                error: 'Related products not found. '
              });
            }
      
            res.json(products);
          });
}

exports.getProductCategories = (req, res) => {
  Product.distinct('category', {}, (err, categories) => {
    if(err) {
      return res.status(400).json({
        error: 'Categories not found. '
      });
    }

    res.json(categories);
  });
}

/** 
 * list products by search
 * implement product search in React frontend
 * show categories in checkbox and price range in radio buttons
 * make api request and show the products based on user selections
 **/ 
exports.getProductsBySearch = (req, res) => {
  let order = req.query.order ? req.query.order : 'desc';
  let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
  let limit = req.query.limit ? parseInt(req.query.limit) : 6; 
  let skip = parseInt(req.body.skip);
  let findArgs = {};

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log('findArgs', findArgs);

  for(let key in req.body.filters) {
    if(req.body.filters[key].length > 0) {
      if(key === 'price') {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  Product.find(findArgs)
    .select('-photo')
    .populate('category')
    .sort([[sortBy, order]])
    .skip(skip)
    .limit(limit)
    .exec((err, products) => {
      if(err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }

      res.json({
        size: products.length,
        products
      });
    });
}

exports.all = (req, res) => {
  // create query object to hold search value and category
  const query = {};
  // assign search term to query.name
  if(req.query.term) {
    query.name = { $regex: req.query.term, $options: 'i' };
    // assign category to query.category
    if(req.query.category && req.query.category != 'all') {
      query.category = req.query.category;
    }
    // find the product based on term and category
    Product.find(query, (err, products) => {
      if(err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      res.json(products);
    }).select('-photo');
  }
};

exports.getProductPhoto = (req, res, next) => {
  if(req.product.photo.data) {
    res.set('Content-Type', req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.decrementQuantity = (req, res, next) => {
  let bulkOps = req.body.order.products.map(product => {
    return {
      updateOne: {
        filter: { _id: product._id },
        update: { $inc: { quantity: -product.count, sold: +product.count }}
      }
    }
  });

  Product.bulkWrite(bulkOps, {}, (err, products) => {
    if(err) {
      return res.status(400).json({
        error: 'Could not update product'
      })
    }
    next();
  });
};