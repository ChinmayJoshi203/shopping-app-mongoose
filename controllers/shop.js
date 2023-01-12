const Product = require("../models/product");
const User = require("../models/user");
const mongodb = require("mongodb");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const pdfDocument = require("pdfkit");
const stripe= require('stripe')('sk_test_51MPL8HSAbZScGAxzv08dyf4HRxlmC5WjUbKLzl2uUB8YIHkGGZTNlwjcfIQ1FBW7vNQzaCcaiYTyU2S261feAzsV00qaGpC09h')

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      // console.log(products)
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user.populate("cart.items.productId").then((user) => {
    let products = user.cart.items;
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products: products,
      isAuthenticated: req.session.isLoggedIn,
    });
  });
};

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

  Product.findById(prodId)
    .then((product) => {
      //console.log(req.session.user)

      return req.user.addToCart(product);
    })
    .then((result) => res.redirect("/cart"))
    .catch((err) => console.log(err));
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
  req.user
    .removeItemFromCart(prodId)
    .then((result) => res.redirect("/cart"))
    .catch((err) => console.log(err));
};

exports.getCheckoutSuccess = (req, res, next) => {
  // let fetchedCart;
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      let products = user.cart.items.map((i) => {
        return { product: { ...i.productId._doc }, quantity: i.quantity };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .then((res) => req.user.clearCart())
    .catch((err) => console.log(err));
};


exports.postOrder = (req, res, next) => {
  // let fetchedCart;
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      let products = user.cart.items.map((i) => {
        return { product: { ...i.productId._doc }, quantity: i.quantity };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .then((res) => req.user.clearCart())
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.email": req.user.email })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((err) => console.log(err));
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId).then((order) => {
    if (!order) {
      return next(new Error("No order found"));
    }
    if (order.user.userId != req.user._id.toString()) {
      return next(new Error("No user found"));
    }
  

  const fileName = "invoice-" + orderId + ".pdf";
  const filePath = path.join("data", "invoices", fileName);
  const pdfDoc = new pdfDocument();
  res.setHeader("Content-Type", "application/pdf");

  pdfDoc.pipe(fs.createWriteStream(filePath));
  pdfDoc.pipe(res);

  pdfDoc.fontSize(26).text("Invoice",{
    bold: true,
    underline: true,
  });

  pdfDoc.text('--------------------------------------')
  let total=0
  order.products.forEach(product=>{
    total=total+product.quantity*product.product.price
    pdfDoc.fontSize(14).text(product.product.title+'-  '+product.quantity+'X'+product.product.price)
  })

  pdfDoc.text('--------------------------------------')
  pdfDoc.text('')
  pdfDoc.fontSize(20).text('Total'+'- '+total, {
    bold: true
  })

  pdfDoc.end();
});
};


exports.getCheckout=(req,res,next)=>{
  let products
  let total=0
  req.user.populate("cart.items.productId").then((user) => {
     products = user.cart.items;
    products.forEach(product=>{
      total+=product.quantity*product.productId.price
    })
    return stripe.checkout.sessions.create({
      payment_method_types:['card'],
      line_items: products.map(p=>{
        return{
          price_data:{
            currency: 'usd',
            unit_amount: p.productId.price*100,
            product_data:{
              name: p.productId.title,
              description: p.productId.description,
            }
          },
          
          quantity: p.quantity
        }
      }),
      mode:'payment',
      success_url: req.protocol+'://'+req.get('host')+'/checkout/success',
      cancel_url:req.protocol+'://'+req.get('host')+'/checkout/cancel'
    })
  })
  .then( session=>{
    res.render("shop/checkout", {
      path: "/checkout",
      pageTitle: "Checkout",
      products: products,
      totalSum: total,
      sessionId: session.id
    });
  });
}