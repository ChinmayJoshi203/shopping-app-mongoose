const User = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
const user = require("../models/user");
const { validationResult } = require("express-validator/check");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);
  // const isLoggedIn=req.get('cookie').split(';')[1].trim().split('=')[1]
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: req.flash("error"),
    oldInput:{email: ''}
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid username or password");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save().then((result) => res.redirect("/"));
          }
          req.flash("error", "Invalid username or password");
         return res.render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            isAuthenticated: req.session.isLoggedIn,
            errorMessage: req.flash("error"),
            oldInput:{email: req.body.email}
          });
        })
        .catch((err) => res.redirect("/login"));
    })

    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};

exports.getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Sign Up",
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: req.flash("Sign Up Error"),
    oldInput:{email: '', password: '', confirmPassword: ''}

  });
};

exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    console.log(error.array())
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Sign Up",
      isAuthenticated: req.session.isLoggedIn,
      errorMessage: error.array().map(i=>{
        return i.msg}),
        oldInput:{email: req.body.email, password: req.body.password, confirmPassword: req.body.confirmPassword}
    });
  }
  
       bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then((result) => {
          return transporter
            .sendMail({
              to: email,
              from: "joshichinmay44@gmail.com",
              subject: "Sign Up Succesfull",
              html: "<h1>Welcome to the HP7 community</h1>",
            })
            .then((result) => res.redirect("/login"))
            .catch((err) => {
              console.log(err);
            });
        })
    .catch((err) => console.log(err));
};

exports.getResetPassword = (req, res, next) => {
  req.flash("error", "Invalid email");
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: req.flash("error"),
  });
};

exports.postResetPassword = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/login");
    }
    const token = buffer.toString("hex");
    const email = req.body.email;
    let resetUser;
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No such account found");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 360000;
        resetUser = user;
        return user.save();
      })
      .then((result) => {
        return transporter.sendMail({
          to: email,
          from: "joshichinmay44@gmail.com",
          subject: "Reset Password",
          html: `
                <h1>Click on the following link to reset your password</h1>
                <a href='https://localhost:3000/reset/${token}'>Link</a>
                `,
        });
      })
      .then(() => {
        res.redirect("/login");
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  req.flash("error", "Invalid");
  res.render("auth/new-password", {
    path: "/new-password",
    pageTitle: "Set Password",
    isAuthenticated: req.session.isLoggedIn,
    resetToken: req.params.token,
    errorMessage: req.flash("error"),
  });
};

exports.postNewPassword = (req, res, next) => {
  const token = req.body.resetToken;
  User.findOne({ resetToken: token })
    .then((user) => {
      if (!user) {
        req.flash("error");
        return res.redirect("/reset/:token");
      }
      bcrypt
        .hash(req.body.password, 32)
        .then((hashedPassword) => {
          user.password = hashedPassword;
          console.log("Password Reset successfull");
          return user.save();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};
