const Product = require('../models/product');
//const mongodb=require('mongodb');
const User = require('../models/user');

const {validationResult}= require('express-validator')

exports.getAddProduct = (req, res, next) => {
  console.log('In Get admin products')
  
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const userId=req.session.user._id
  const err=validationResult(req)
  const product=new Product(
    {
      title,
      price,
      description,
      imageUrl,
      userId
    }
  )
  if(!err.isEmpty())
  {

    product.save().then(result => {
      // console.log(result);
      console.log('Created Product');
      res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
      });
    })
    .catch(err => {
      console.log(err);
      res.redirect('/500')
    });
  }

  

 };

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
 // console.log(editMode);
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  const userId=null
  Product.findById(prodId)
    .then(products => {
      const product = products[0];
      console.log(products);
      if (!products) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: products,

        //User: User.findUser(products.userId ? product.userId : userId).then(user=>user.name)
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl.toString();
  const updatedDesc = req.body.description;
  //const product=new Product(updatedTitle, updatedPrice, updatedDesc,updatedImageUrl, prodId)
  Product.findById(prodId).then(product=>{
    if(product.userId.toString()!==req.user._id.toString())
    {
      return res.redirect('/')
    }
   
    product.title=updatedTitle
    product.price=updatedPrice
    product.imageUrl=updatedImageUrl
    product.description=updatedDesc
   return product.save().then(result => {
    console.log('UPDATED PRODUCT!');
    res.redirect('/admin/products');
  })
  })
  
      .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
 Product.find({userId: req.user._id})
    .then(products => {
      console.log(products)

      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedIn

      });
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
Product.deleteOne({_id:prodId, userId: req.user._id})
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};
