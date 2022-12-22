const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session=require('express-session')
const mongoose=require('mongoose')
const csrf= require('csurf')
const flash=require('connect-flash')

const MongoDBStore=require('connect-mongodb-session')(session)
const store= new MongoDBStore({
  uri: 'mongodb+srv://chinmayj:tarmak007@cluster.cneduzo.mongodb.net/shop',
  collection: 'session'
})

//const mongoConnect=require('./util/database').MongoConnect
const errorController = require('./controllers/error');
const User=require('./models/user')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

 const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes=require('./routes/auth')
const user = require('./models/user');
const csrfProtection=csrf()


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store
}))

app.use(csrfProtection)

app.use(flash())
app.use((req,res,next)=>{
  if(!req.session.user){
    next();
  }
  else {User.findById(req.session.user._id)
  .then(user=>{
    req.user=user
    next()
  })
}})

app.use((req,res,next)=>{
  res.locals.isAuthenticated= req.session.isLoggedIn
  res.locals.csrfToken= req.csrfToken()

  next()
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);



// mongoConnect(()=>{
//   app.listen(3000)
// }
// )

mongoose.connect('mongodb+srv://chinmayj:tarmak007@cluster.cneduzo.mongodb.net/shop')
.then(result=>
  {

  app.listen(3000)
  })
  .catch(err=> console.log(err))
