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

const multer = require('multer');


//const mongoConnect=require('./util/database').MongoConnect
const errorController = require('./controllers/error');
const User=require('./models/user')

const app = express();

const fileStorage=multer.diskStorage({
  destination: (req,file, cb)=>{
    cb(null,'images')
  },
  filename: (req, file,cb)=>{
    cb(null, new Date().getDate().toISOString+'-'+ file.originalname)
  }
})

const fileFilter= (req,file,cb)=>{
  if(file.mimetype==='image/png' || file.mimetype==='image/jpg' || file.mimetype==='image/jpeg')
  {
    cb(null, true)
  }
  else
  cb(null, false)
}
app.set('view engine', 'ejs');
app.set('views', 'views');

 const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes=require('./routes/auth')
const user = require('./models/user');
const csrfProtection=csrf()


app.use(bodyParser.urlencoded({ extended: false }));

app.use(multer({storage: fileStorage, filter: fileFilter}).single('image'))
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')))
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
  .catch(err=>{
    throw new Error('Error')
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

app.get('/500',errorController.get500)
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
