const User=require('../models/user')
const bcrypt=require('bcrypt')

exports.getLogin=(req,res,next)=>{
console.log(req.session.isLoggedIn)
   // const isLoggedIn=req.get('cookie').split(';')[1].trim().split('=')[1]
        res.render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: req.flash('error')
    })
}

exports.postLogin=(req,res,next)=>{
    const email=req.body.email
    const password=req.body.password

     User.findOne({email:email})
     .then(user=>{
        if(!user)
        {
            req.flash('error','Invalid username or password')
            return res.redirect('/login')
        }
        bcrypt.compare(password, user.password)
        .then(doMatch=>{
            if(doMatch)
            {
                req.session.user = user
               req.session.isLoggedIn=true
               return req.session.save().then(result=> res.redirect('/'))
                
            }
            req.flash('error','Invalid username or password')
            return res.redirect('/login')
        })
        .catch(err=> res.redirect('/login')
        )
     })
    
    .catch(err => console.log(err));
}

exports.postLogout=(req,res,next)=>{
    req.session.destroy((err)=>{
        res.redirect('/')
    })
}

exports.getSignUp=(req,res,next)=>{
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Sign Up',
        isAuthenticated: req.session.isLoggedIn,
        errorMessage: req.flash('Sign Up Error')
})
}

exports.postSignUp=(req,res,next)=>{
    const email=req.body.email
    const password=req.body.password
    const confirmPassword=req.body.confirmPassword

   User.findOne({email:email})
   .then(userDoc=>{
    if(userDoc)
    {  req.flash('Sign Up Error','User already exists')
       return res.redirect('/signup')
    }
   return bcrypt.hash(password,12)
    .then(hashedPassword=>{
        const user= new User({
            email,
            password:hashedPassword,
            cart:{items:[]}
        })
        return user.save()
    }).then(result=>{
        res.redirect('/login')
       })
   })
   .catch(err=>
    console.log(err))
    
}