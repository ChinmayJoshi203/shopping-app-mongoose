const Product = require('../models/product');
const User = require('../models/user');
const mongodb=require('mongodb')
const Order= require('../models/order')
exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
     // console.log(products)
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
.populate('cart.items.productId').then(user => {
       let products=user.cart.items
                res.render('shop/cart', {
                  path: '/cart',
                  pageTitle: 'Your Cart',
                  products: products,
                  isAuthenticated: req.session.isLoggedIn
                });
              } )
      }
    
    //return products

    // .then(cart => {
    //   return cart
    //     .getProducts()
    //     .then(products => {
    //       res.render('shop/cart', {
    //         path: '/cart',
    //         pageTitle: 'Your Cart',
    //         products: products
    //       });
    //     })
    //     .catch(err => console.log(err));
    // })
    // .catch(err => console.log(err));


exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  
Product.findById(prodId).then(product=>{
  //console.log(req.session.user)

  return req.user.addToCart(product)
}).then(result=> res.redirect('/cart')).catch(err=>console.log(err))
  // let fetchedCart;
  // let newQuantity = 1;
  // req.user
  //   .getCart()
  //   .then(cart => {
  //     fetchedCart = cart;
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then(products => {
  //     let product;
  //     if (products.length > 0) {
  //       product = products[0];
  //     }

  //     if (product) {
  //       const oldQuantity = product.cartItem.quantity;
  //       newQuantity = oldQuantity + 1;
  //       return product;
  //     }
  //     return Product.findById(prodId);
  //   })
  //   .then(product => {
  //     return fetchedCart.addProduct(product, {
  //       through: { quantity: newQuantity }
  //     });
  //   })
  //   .then(() => {
  //     res.redirect('/cart');
  //   })
  //   .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeItemFromCart(prodId).then(result=>
     res.redirect('/cart')
  ).catch(err=>console.log(err))
};

exports.postOrder = (req, res, next) => {
 // let fetchedCart;
 req.user
 .populate('cart.items.productId').then(user=>{
  let products=user.cart.items.map(i=>{
    return {product:{...i.productId._doc}, quantity: i.quantity}
  })
  const order= new Order({
    user:{
      email: req.user.email,
      userId: req.user
    },
    products: products
  })
  return order.save()
 })
    .then(result => {
      res.redirect('/orders');
    }).then(res=> req.user.clearCart())
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({'user.email': req.user.email})
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};
