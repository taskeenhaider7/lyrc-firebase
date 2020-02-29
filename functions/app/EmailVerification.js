const crypto = require('crypto');
const User = require('../models/users');
const EmailSender = require('./EmailSender');
const path    = require("path");

exports.sendRequest = function(uid, callback){
    if(!uid) return callback(401, {"status": false, "message": "Invalid user"});
    User.getUserByIdProfile(uid, (user)=>{
      if(!user) return callback(401, {"status": false, "message": "Invalid user"});
      let token = uid+""+crypto.randomBytes(40).toString('hex');
      User.saveTokenEmailVerification(uid, token, (err, msg)=>{
          if(err) return callback(500, {"status": false, "message": "Internal Server Error"});
          let header = {
              email: user.email,
              subject: 'Confirm your email?'
          }
          let linkVerification = 'https://www.cameraco.org/verify_email?token='+token;
          let body =  "<p>Hi "+user.username+",</p>" +
          "<br><p>Thanks for adding your email address on Lyrc. Please confirm your email below, so you can recover your account if you forget your password! </p>" +
          '<p><a href="'+linkVerification+'">CONFIRM EMAIL</a></p>'+
          "<p>If this is not your Lyrc account or you did not sign up for Lyrc, please get in touch with us and we'll ensure your email is removed.</p>"+
          "<p>-Lyrc team</p>";
          EmailSender.sendEmail(header, body, (err, res)=>{
              if(err) return callback(500, {"status": false, "message": "Internal Server Error"});
              return callback(200, {"status": true, "message": "Email sent"});
          });
      });
    });
    
}
exports.verifyEmailToken = function(token, res){
    if(!token) return res.sendFile(path.join(__dirname+'/templates/no_valid_token.html'));
    User.verifyTokenEmail(token, (err, msg)=>{
      if(err) return res.sendFile(path.join(__dirname+'/templates/no_valid_token.html'));
      return res.sendFile(path.join(__dirname+'/templates/verify_email.html'));
    });
    /*User.findOne({hash_email_verify:token}, '_id hash_email_verify ', (error, user)=>{
      if(error) return res.sendFile(path.join(__dirname+'/templates/no_valid_token.html'));
      if(!user) return res.sendFile(path.join(__dirname+'/templates/no_valid_token.html'));
      if(!user.hash_email_verify) return res.sendFile(path.join(__dirname+'/templates/no_valid_token.html'));
      if(user.hash_email_verify != token) return res.sendFile(path.join(__dirname+'/templates/no_valid_token.html'));
      user.hash_email_verify = undefined;
      user.verificated_email = true;
      user.save(function(error, us_new){
        if(error) return res.send("Internal Server Error");
        return res.sendFile(path.join(__dirname+'/templates/verify_email.html'));
      });
    });*/
  }