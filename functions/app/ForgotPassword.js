const User = require('../models/users');
const crypto = require('crypto');
const EmailSender = require('./EmailSender');
const fs = require('fs');
const path    = require("path");

exports.saveForgotPassword = function(email, callback){
    if(!email) return callback(400, {"status": false, "message": "Missing parameters"});
    User.getUserByEmail(email, (err, msg)=>{
        if(err) return callback(500, {"status": false, "message": msg});
        let user = msg;
        crypto.randomBytes(20, function(err, buff){
            if(err) return callback(500, {"status": false, "message": "Internal Server Error"});
            let token = buff.toString('hex');
            let item = {
                email: email,
                token: token,
                expires_on: Date.now() + 3600000
            }
            User.saveRequestPassword(item, (err, res)=>{
                if(err) return callback(500, {"status": false, "message": "Internal Server Error"});
                getTemplatePassword(user, token, (templateEmail)=>{
                    EmailSender.sendEmail(templateEmail.header, templateEmail.body, (err, res)=>{
                        if(err) return callback(500, {"status": false, "message": "Internal Server Error"});
                        return callback(200, {"status": true, "message": "Email sent"});
                    });
                });
            });
        });
    });
}
exports.getViewForgot = function(token, res){
    //console.log("token");
    //console.log(token);
    if(!token) return res.sendFile(path.join(__dirname+'/templates/no_valid_token.html'));
    User.verifyTokenRecoverPassword(token, (err, msg)=>{
        //console.log("verifyTokenRecoverPassword");
        //console.log(err, msg);
        if(err) return res.sendFile(path.join(__dirname+'/templates/no_valid_token.html'));
        let now = new Date();
        let expires_on = new Date(msg.expires_on);
        if(now.getTime() > expires_on.getTime()){
            //console.log("now.getTime() > expires_on.getTime()");
            //console.log(now, expires_on);
            return res.sendFile(path.join(__dirname+'/templates/no_valid_token.html'));
        }else{
            fs.readFile('app/templates/recover_password.html', "utf8", function(err,data){
                //console.log("readFile");
                //console.log(err);
                if(err) return res.sendFile(path.join(__dirname+'/templates/no_valid_token.html'));
                let template = data;
                template = template.replace("{token_value}",token);
                return res.send(template);
            });
            //return res.sendFile(path.join(__dirname+'/templates/recover_password.html'));
        }
        //return res.sendFile(path.join(__dirname+'/templates/verify_email.html'));
    });
}
exports.resetPassword = function(passuno, passdos, token, res){
    if(!passuno || !passdos || !token) return res.sendFile(path.join(__dirname+'/templates/no_valid_token.html'));
    if(passuno != passdos) return res.sendFile(path.join(__dirname+'/templates/no_valid_token.html'));
    User.verifyTokenRecoverPassword(token, (err, msg)=>{
        //console.log("------verifyTokenRecoverPassword");
        //console.log(err, msg);
        if(err) return res.sendFile(path.join(__dirname+'/templates/no_valid_token.html'));
        let now = new Date();
        let expires_on = new Date(msg.expires_on);
        if(now.getTime() > expires_on.getTime()){
            //console.log("------now.getTime() > expires_on.getTime()");
            //console.log(now, expires_on);
            return res.sendFile(path.join(__dirname+'/templates/no_valid_token.html'));
        }else{
            User.changePassword(msg.email, passuno, (err, msg)=>{
                //console.log("------changePassword");
                //console.log(err, msg);
                if(err) return res.sendFile(path.join(__dirname+'/templates/no_valid_token.html'));
                return res.sendFile(path.join(__dirname+'/templates/password_changed.html'));
            });
        }
    });
}
function getTemplatePassword(user, token, callback){
    fs.readFile('app/templates/email_recover_password.html', "utf8", function(err,data){
        if(err){
            return callback(getTemplatePasswordSimple(user, token));
        }else{
            let linkVerification = 'https://www.cameraco.org/reset_password?token='+token;
            let template = data;
            template = template.replace("{username}",user.username);
            template = template.replace("{url_verify}",linkVerification);
            let header = {
                email: user.email,
                subject: 'Reset password (Lyrc)'
            }
            return callback({header: header, body: template});
        }
    });
}
function getTemplatePasswordSimple(user, token){
    let header = {
        email: user.email,
        subject: 'Reset password (Lyrc)'
    }
    let linkVerification = 'https://www.cameraco.org/reset_password?token='+token;
    let body =  "<p>Hi "+user.username+",</p>" +
    "<br><p>We've received a request to reset your password. If you didn't make the request, </p>" +
    "<p>just ignore this email. Otherwise, you can reset your password using this link: </p>" +
    '<p><a href="'+linkVerification+'">Click here to reset your password</a></p>'+
    "<p>Thanks, </p>"+
    "<p>The Lyrc team</p>";
    return {header: header, body: body};
}