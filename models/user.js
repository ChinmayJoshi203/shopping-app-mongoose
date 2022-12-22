// const getDB = require("../util/database").getDB;
const mongodb = require("mongodb");
const Product = require("./product");
// class User {
//   constructor(name, email, cart, id) {
//     this.name = name;
//     this.email = email;
//     this._id = id;
//     // let items=[]
//     this.cart = cart ? cart : { items: [] };
//   }

//   save() {
//     const db = getDB();
//     return db.collection("users").insertOne(this);
//   }

//   addToCart(prodId) {
//     let updatedCart = this.cart;
//     let newQuantity = 1;
//     let newCartItem = {
//       productId: new mongodb.ObjectId(prodId),
//       quantity: newQuantity,
//     };

//     if (this.cart.items) {
//       let existingCartItemIndex = this.cart.items.findIndex(
//         (cp) => cp.productId == prodId
//       );

//       if (existingCartItemIndex >= 0) {
//         updatedCart.items[existingCartItemIndex].quantity += newQuantity;
//       } else {
//         newCartItem = {
//           productId: new mongodb.ObjectId(prodId),
//           quantity: newQuantity,
//         };
//         updatedCart.items.push(newCartItem);
//       }
//     } else {
//       this.cart.items = [];
//       this.cart.items.push(newCartItem);
//       updatedCart.items.push(newCartItem);

//     }
//     //let updatedCart={items:[{productId: new mongodb.ObjectId(prodId), quantity:newQuantity}]}
//     const db = getDB();
//     console.log(this._id);
//     return db
//       .collection("users")
//       .updateOne(
//         { _id: new mongodb.ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       );
//   }

//   getCart() {
//     const db = getDB();
//     let productIds = this.cart.items.map((i) => i.productId);
//     console.log(productIds);
//     return db.collection("products")
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then((products) => {
//         return products.map((p) => {
//           console.log(p)
//           return {
//             ...p,
//             quantity: this.cart.items.find(
//               (i) => { 
//                // console.log(i.productId)
//                 return i.productId.toString() === p._id.toString()}
//             ).quantity,
//           };
//         });
//       });
//   }

//   deleteCart(productId)
//   {
//     const db=getDB()
//     let updatedCart=this.cart.items.filter(p=>p.productId.toString()!==productId.toString())
//     console.log(updatedCart)
//     return db
//     .collection("users")
//     .updateOne(
//       {_id:new mongodb.ObjectId(this._id)},
//       {$set: {cart:{items: updatedCart}}}
//     )

//   }

//   addOrder(){
//     const db=getDB()
//     return this.getCart().then(products=>{
//       const order={
//         items: products,
//         user:{
//           _id: new mongodb.ObjectId( this._id),
//           name: this.name
//         }
//       }

//       return db.collection('orders').insertOne(order)
//     })
//    .then(
//       res=>{
//         this.cart={items:[]}
//         return db.collection('users').updateOne(
//           {_id: new mongodb.ObjectId(this._id)},
//           {$set:{cart:{items:[]}}}
//         )
//       }

//     )
//   }

//   getOrders()
//   {
//     const db=getDB()
//     return db.collection('orders').find({'user._id': new mongodb.ObjectId(this._id)}).toArray()
//   }

//   static findUser(userId) {
//     const db = getDB();
//     if (!userId) return "No User";
//     return db
//       .collection("users")
//       .find({ _id: new mongodb.ObjectId(userId) })
//       .next()
//       .then((user) => user);
//   }
// }

// module.exports = User;

const mongoose=require('mongoose')
const { schema } = require('./product');
const { LONG_PASSWORD } = require("mysql2/lib/constants/client");

const Schema=mongoose.Schema
const userSchema=new Schema({
    email:{
        type: String,
        required: true
    },
    password:{
      type: String,
      required: true
    },
    cart:{
        items:[
            {
                productId:{
                    type: Schema.Types.ObjectId,
                    ref:'Product',
                    required: true
                },
                quantity:{
                    type: Number,
                    required: true
                }
            }
        ]
          
    }

    
})

userSchema.methods.getCart=function(prodId){
    Product.findById(prodId).then(products=> console.log(products))
}

userSchema.methods.addToCart=function(product){
    let updatedCart = this.cart;
    let newQuantity = 1;
    let newCartItem = {
      productId: new mongodb.ObjectId(product._id),
      quantity: newQuantity,
    };

    if (this.cart.items) {
       // let existingCartItemIndex=-1
      let existingCartItemIndex = this.cart.items.findIndex(
        p=>p.productId.equals(product._id)
      );

    // this.cart.items.map(x=> {
    //     console.log(x.productId+'Product Id')
    //     console.log(product._id+'Product to cart ID')
    //     if() console.log('Equal')
    // })
    // console.log(this.cart.items.map(x=>{ console.log(x.productId)
    // //console.log(product._id)
    // } ))
    //console.log(existingCartItemIndex);
      if (existingCartItemIndex >= 0) {
        updatedCart.items[existingCartItemIndex].quantity += newQuantity;
      } else {
        newCartItem = {
          productId: new mongodb.ObjectId(product._id),
          quantity: newQuantity,
        };
        updatedCart.items.push(newCartItem);
      }
    } else {
      this.cart.items = [];
      this.cart.items.push(newCartItem);
      updatedCart.items.push(newCartItem);

    }
    //let updatedCart={items:[{productId: new mongodb.ObjectId(prodId), quantity:newQuantity}]}
    this.cart=updatedCart
    return this.save()
        
}

userSchema.methods.removeItemFromCart=function(productId)
{
    let updatedCartItems=this.cart.items.filter(p=>
       p.productId.toString()!==productId.toString()
        )
    this.cart.items=updatedCartItems
    return this.save()
}

userSchema.methods.clearCart=function(){
    this.cart={items:[]}
    return this.save()
}
//userSchema.methods.getCart=function(){



module.exports=mongoose.model('User',userSchema)