// const getDB=require('../util/database').getDB
// const mongodb=require('mongodb')

const mongoose=require('mongoose')

const Schema=mongoose.Schema

const productSchema=new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description:{
      type: String,
      required: true
    },
    price:{
      type: Number,
      required:true
    },
    imageUrl:{
      type: String,
      required: true
    },
    userId:{
      type: Schema.Types.ObjectId,
      ref:'user'
    }
  }
)

module.exports=mongoose.model('Product',productSchema)

// class Product{
//   constructor(title,price,description,imageUrl,_id, userId)
//   {
//     this.title=title
//     this.price=price
//     this.imageUrl=imageUrl
//     this.description=description
//     this._id=_id ? new mongodb.ObjectId(_id) : null
//     this.userId=userId
//   }
//   save(){
//     const db=getDB()
//     let dbOp;
//     if(!this._id)
//     {
//       dbOp=db.collection('products').insertOne(this)
//     }
//     else{
//       dbOp=db.collection('products').updateOne({_id: new mongodb.ObjectId(this._id)},{$set:this})
//     }
//     return dbOp.then(res=> console.log(res)).catch(err=> console.log(err))
//   }

//   static fetchAll()
//   {
//     const db=getDB()
//     return db.collection('products').find().toArray().then(products=> products).catch(err=> console.log(err))
//   }

//   static fetchProduct(prodId)
//   {
//     const db=getDB()
//     return db.collection('products').find({_id:new mongodb.ObjectId(prodId)}).next().then(data=> data).catch(err=> console.log(err))
//   }

//   static deleteProduct(prodId)
//   {
//     const db=getDB()
//     return db.collection('products').deleteOne({_id: new mongodb.ObjectId(prodId)}).then(res=>console.log(res)).catch(err=>console.log(err))
//   }
// }
// // const Product = sequelize.define('product', {
// //   id: {
// //     type: Sequelize.INTEGER,
// //     autoIncrement: true,
// //     allowNull: false,
// //     primaryKey: true
// //   },
// //   title: Sequelize.STRING,
// //   price: {
// //     type: Sequelize.DOUBLE,
// //     allowNull: false
// //   },
// //   imageUrl: {
// //     type: Sequelize.STRING,
// //     allowNull: false
// //   },
// //   description: {
// //     type: Sequelize.STRING,
// //     allowNull: false
// //   }
// // });

// module.exports = Product;
