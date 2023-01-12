const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

const isAuth= require('../middleware/is-auth')

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', shopController.getCart);

router.post('/cart', shopController.postCart);

router.post('/cart-delete-item', shopController.postCartDeleteProduct);

router.post('/create-order', shopController.getOrders);

router.get('/orders', shopController.getOrders);

router.get('/checkout', isAuth, shopController.getCheckout)

router.get('/checkout/success', shopController.getCheckoutSuccess)

router.get('/checkout/cancel',shopController.getCheckout)

router.get('/orders/:orderId',isAuth,shopController.getInvoice)

module.exports = router;
