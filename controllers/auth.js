const nodemailer = require('nodemailer');
const Recipient = require('mailersend').Recipient
const EmailParams = require('mailersend').EmailParams
const MailerSend = require('mailersend').MailerSend
const Sender = require('mailersend').Sender
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');


const mailerSendConfig = {apiKey: 'mlsn.c59908742ca4fc2711df6f7a713e8dc26da5d8b02c5a7bb7e509aaa526242e21'}
const mailerSend = new MailerSend(mailerSendConfig)


// const Mailjet = require('node-mailjet');
// const mailjet = Mailjet.apiConnect(
//   process.env.MJ_APIKEY_PUBLIC || 'b5b3c08c169214e2d8576aecea22f2d1',
//   process.env.MJ_APIKEY_PRIVATE || '7fe7e37500418ae08d5b12a877822b0f',
// );
const User = require('../models/user');
const user = require('../models/user');



exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).render
    ('auth/login', {
      path: '/login',
      pageTitle: 'login',
      errorMessage: errors.array()[0].msg
    });
  }
  User.findOne({ email: email })
    .then(user => {
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Please enter a valid password.');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    console.log(errors.array());
    return res.status(422).render
    ('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg
    });
  }

  
    bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');

      const sentFrom = new Sender('MS_Nx2TRU@trial-neqvygmev7z40p7w.mlsender.net', 'Pranav Lande');

      const recipients = [new Recipient(req.body.email)];

      const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setSubject('Password Reset')
          .setHtml(`<p>You have successfully signed up</p>
                      `)
          .setText("Greetings from the team, you got this message through MailerSend.");
      




      return mailerSend.email.send(emailParams);
    })
    .then(result => {
      const { Status } = result.body;
      console.log('Email status:', Status);
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next)=>{
  crypto.randomBytes(32,(err, buffer)=>{
    if(err){
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex'); //buffer will store hex values, tostring needed that to convert those hex values to ascii characters
    User.findOne({email:req.body.email})
    .then(user => {
      if(!user){
        req.flash('error', 'NO ACCOUNT WITH SUCH USERNAME');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    }).then(result => {
        res.redirect('/');
  
        const sentFrom = new Sender('MS_Nx2TRU@trial-neqvygmev7z40p7w.mlsender.net', 'Pranav Lande');
  
        const recipients = [new Recipient(req.body.email)];
  
        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setSubject('Password Reset')
            .setHtml(`<p>You requested a password reset</p>
                      <p>Click this <a href="http://localhost:3000/reset/${token}">Link</a> to set a new Password<p>
                      <p>If that doesn't work please copy and paste the link below in your browser</p>
                      <p>http://localhost:3000/reset/${token}</p>
                        `)
            .setText("Greetings from the team, you got this message through MailerSend.");
        
  
  
  
  
        return mailerSend.email.send(emailParams);
      
    })
  }); 
}

exports.getNewPassword = (req, res, next) =>{
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
  .then(user => {
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'New Password',
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token,
    });
  })
  .catch(err =>{
    console.log(err);
  });

  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }


}

exports.postNewPassword = (req, res, next) =>{
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

  User.findOne({resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}, _id: userId})
  .then(user =>{
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  }).then(hashedPassword =>{
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  }

  ).then(result =>{
    res.redirect('/login')
  }).catch(err => {
    console.log(err);
  })
}