const mongoDB=require('mongodb')
const MongoClient=mongoDB.MongoClient
let _db;

exports.MongoConnect=(callback)=>{MongoClient.connect('mongodb+srv://chinmayj:tarmak007@cluster.cneduzo.mongodb.net/shop?retryWrites=true&w=majority')
.then(client=>{
  console.log('connected');
  _db=client.db()
  callback()
})
.catch(err=>{
console.log("Error is "+err.message);
})
}

 exports.getDB=()=>{
  if(_db)
  {
    return _db
  }
   console.log('No database found!')
}


