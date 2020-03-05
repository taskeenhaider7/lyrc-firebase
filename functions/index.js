const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const Cookies = require("cookies");
const cors = require('cors');
const compression = require('compression');
//const Logger = require('./utils/logger.js');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});

const Users = require('./models/users');
const Fotes = require('./models/Fotes');
const FCM = require('./models/FCM');
/*const PhoneVerification = require('./models/PhoneVerification');*/
const Comments = require('./models/comments');
const GPlaces = require('./models/GPlaces');
const Dms = require('./models/Dm');
const Events = require('./models/Events');
const Tasks = require('./models/Events');
const Trips = require('./models/Trips');
const Subscribers = require('./models/Subscribers');
const Reports = require('./models/Reports');
const ImageTools = require('./models/ImageTools');
const FotesNotifications = require('./models/FotesNotifications');

const Search = require('./app/Search');
const FotesFuncs = require('./app/FotesFuncs');
const UsersFunc = require('./app/Users');
const emailVerification = require('./app/EmailVerification');
const ForgotPassword = require('./app/ForgotPassword');
const EmailValidator = require("email-validator");

/*admin.initializeApp(functions.config.firebase);

const db = admin.firestore();*/

//const logger = new Logger();

const app = express();
app.use(bodyParser.json());
app.use(require('method-override')());
app.use(compression());
app.use(cors());

app.use((req, res, next) => {
   req.identifier = uuid();
   const logString = `a request has been made with the following uuid [${req.identifier}] ${req.url} ${req.headers['user-agent']} ${JSON.stringify(req.body)}`;
   //logger.log(logString, 'info');
    console.log(logString);
   next();
});
app.get('/', function (req, res) {
   Fotes.createIndex();
    ///home/taskeen/Computer/Git/wesakh/lyrc-firebase/functions/views/index.ejs
   //res.render('index.ejs')
    res.status("400").json("a gya tain chaa gya thaa kr ka tapal dany dar.");
});
app.get('/tos', function (req, res) {
   res.render('tos.ejs')
});
app.get('/filterDemo', function (req, res) {
   res.render('filterDemo.ejs')
});
app.get('/privacy', function (req, res) {
   res.render('privacy.ejs')
});

//******************COOKIES************************//

app.get('/api/searchkey', function (req, res) {
   let word_key = req.query.word;
   let cookies = new Cookies(req, res);
   let _Cookies = require('./models/cookies');
   let idToken = cookies.get("ftoken");

   console.log(idToken);
   debugger;

   _Cookies.validateCookie(idToken, (result) => {
      if (result[0]) {
         Search.findByWord(word_key, result[2], (code, msg) => {
            return res.status(code).json(msg);
         });
      } else {
         Search.findByWord(word_key, result[2], (code, msg) => {
            return res.status(code).json(msg);
         });
      }
   });
});
app.get('/api/fotes/hashtag', function (req, res) {
   let hashtag = req.query.hashtag;
   let page = req.query.page;
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   _Cookies.validateCookie(idToken, (result) => {
      if (result[0]) {
         Search.getFotesByHashtag(hashtag, result[2], page, (code, msg) => {
            return res.status(code).json(msg);
         });
      } else {
         Search.getFotesByHashtag(hashtag, result[2], page, (code, msg) => {
            return res.status(code).json(msg);
         });
      }
   });
});

//******************Authentication************************//

app.get('/reset_password', function (req, res) {
   let token = req.query.token;
   ForgotPassword.getViewForgot(token, res);
});
app.post('/reset_password', function (req, res) {
   let email = req.body.email;
   ForgotPassword.saveForgotPassword(email, (code, msg) => {
      return res.status(code).json(msg);
   });
});
app.post('/api/reset_password', function (req, res) {
   let passuno = req.body.passuno;
   let passdos = req.body.passdos;
   let token = req.body.token;
   ForgotPassword.resetPassword(passuno, passdos, token, res);
});
app.post('/users/login', function (req, res) {
   var users = require('./models/users');
   _email = req.body.email;
   _pwd = req.body.password;
   var cookies    = new Cookies( req, res);
   //log in the user.
   function login_callback(login) {

      if (login[0]) {
         //storage cookie in browser
         var d = new Date();
         var year = d.getFullYear();
         var month = d.getMonth();
         var day = d.getDate();
         var c = new Date(year + 1, month, day); //set cookie expiration after 1 year
         cookies.set( "ftoken", login[2], { httpOnly: false,expires: c } )
         res.json({"success": true, "ftoken": login[2]});
      } else {
         res.status(400).json({"success": false, "reason": login[1].reason})

      }
   }

   users.login(_email, _pwd, login_callback);
});
app.get('/users/logout', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   var Users = require('./models/users');

   function validate_cookie(result) {
      if (result[0]) {
         uid = result[1];

         function invalidate_cookie(result) {
            function token_callback(r) {
               return res.status(200).send({"success": true});
            }

            Users.update_token(uid, "", token_callback)
         }

         _Cookies.invalidateCookie(idToken, invalidate_cookie);

      } else {
         return res.status(200).send({"success": true});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);

});
app.post('/users/login/fb', function (req, res) {
   var cookies = new Cookies(req, res);
   fbToken = req.body.fbtoken
   var Users = require('./models/users');
   var _Cookies = require('./models/cookies');

   console.log("---------INIT FB LOGIN------------");
   console.log(fbToken);
   if (fbToken != null) { //do facebook login
      // _emailIsValid = EmailValidator.validate(_email);
      //validate token and get user data
      _graph = "https://graph.facebook.com/me?fields=name,email,picture&access_token=" + fbToken;
      //TODO: pass arguments instead of creating url
      request(_graph, function (error, response, body) {
         try {
            fb_user = JSON.parse(response.body);
            fb_id = fb_user.id
            _username = fb_user.name.toLowerCase().split(" ").join("").substr(0, 16)
            _photo = fb_user.picture.data.url, //save it to s3
                console.log(_photo);
            _user = {
               "name": fb_user.name,
               "username": _username,
               "fb_id": fb_id,
               "email": fb_user.email,
               "password": "",
               "source": "facebook.com",
               "description": ""
            }

            function getFbUser(fbuser) {
               if (fbuser == null) {
                  // create
                  function create_callback(r) {
                     console.log("---------- CREATING USER RESPONSE -------------");
                     console.log(r);
                     if (r) {
                        //log in the user.
                        function login_callback(login) {
                           console.log("--------------- MAKING LOGIN ACCOUNT RECENT CREATED ------------");
                           console.log(login);
                           if (login[0]) {
                              function validate_cookie(rup) {
                                 if (rup[0]) {
                                    _uid = rup[1]
                                    // update picture
                                    var _link = "";
                                    _avatarNumber = Math.floor(Math.random() * Math.floor(5));
                                    var params = {
                                       localFile: "vendor/img/default_avatars/" + _avatarNumber + ".png",
                                       s3Params: {
                                          Bucket: "fotesapp",
                                          Key: "profiles/" + _uid + ".png",
                                          ACL: 'public-read',
                                       },
                                    };
                                    var uploader = s3Client.uploadFile(params);
                                    uploader.on('error', function (err) {
                                       console.error("unable to upload:", err.stack);
                                    });
                                    uploader.on('progress', function () {
                                       console.log("progress", uploader.progressMd5Amount,
                                           uploader.progressAmount, uploader.progressTotal);
                                    });
                                    uploader.on('end', function () {
                                       console.log("done uploading");
                                       _link = "https://s3.amazonaws.com/fotesapp/profiles/" + _uid + ".png";
                                       console.log(_link);

                                       function update_photo_callback(result_callback) {
                                          //storage cookie in browser
                                          var d = new Date();
                                          var year = d.getFullYear();
                                          var month = d.getMonth();
                                          var day = d.getDate();
                                          var c = new Date(year + 1, month, day)  //set cookie expiration after 1 year
                                          cookies.set("ftoken", login[2], {httpOnly: false, expires: c})
                                          res.json({"success": true, "token": login[2]})
                                       }

                                       Users.update_photo(_uid, _link, update_photo_callback);

                                    });
                                 }
                              }

                              _Cookies.validateCookie(login[2], validate_cookie);

                           } else {
                              res.status(400).json({"success": false, "reason": "Service unavailabe"})

                           }
                        }

                        Users.loginFb(fb_id, login_callback);

                     } else {
                        console.log(r);
                        res.status(400).json({"success": false, "reason": r[1].error})
                     }
                  }

                  Users.create(_user, create_callback)
               } else {
                  // login user
                  function login_callback(login) {
                     console.log("------- IN ELSE user already created RESPONSE LOGIN---------");
                     console.log(login);
                     if (login[0]) {
                        //storage cookie in browser
                        var d = new Date();
                        var year = d.getFullYear();
                        var month = d.getMonth();
                        var day = d.getDate();
                        var c = new Date(year + 1, month, day)  //set cookie expiration after 1 year
                        cookies.set("ftoken", login[2], {httpOnly: false, expires: c})
                        res.json({"success": true, "token": login[2]})
                     } else {
                        res.status(400).json({"success": false, "reason": "Service unavailabe"})

                     }
                  }

                  Users.loginFb(fb_id, login_callback);
               }
            }

            Users.getUserByFbId(fb_id, getFbUser);
         } catch (e) {
            res.json({"success": false, "reason": "Invalid Facebook Token"})
         }
      });
   }


   // function create_callback(r){
   //    if(r[0]){
   //      //log in the user.
   //      function login_callback(login){
   //        if(login[0]){
   //        //storage cookie in browser
   //          var d = new Date();
   //          var year = d.getFullYear();
   //          var month = d.getMonth();
   //          var day = d.getDate();
   //          var c = new Date(year + 1, month, day)  //set cookie expiration after 1 year
   //          cookies.set( "ftoken", login[2], { httpOnly: false,expires: c } )
   //          res.json({"success":true,"token":login[2]})
   //        }else{
   //          res.status(400).json({"success":false,"reason":"Service unavailabe"})
   //
   //        }
   //      }
   //      Users.login(_email,_password,login_callback);
   //    }else{
   //      console.log(r);
   //      res.status(400).json({"success":false,"reason":r[1].error})
   //    }
   //  }
   // Users.create(_user,create_callback)
});
app.post('/api/users/check_email', function (req, res) {
   console.log(req);
   _email = req.body.email;
   _emailIsValid = EmailValidator.validate(_email);
   if (!_emailIsValid) {
      res.status(400).json({"success": false, "reason": "Email is invalid."});
      return 1;
   } else {
      function check_callback(l) {
         if (l === 0) {
            res.status(200).json({"success": true, "reason": "Email is available."})
         } else {
            res.status(400).json({"success": false, "reason": "Email is not available."})
         }
      }

      Users.checkEmail(_email.trim(), check_callback)

   }
});
app.post('/api/users/check_username', function (req, res) {
   _username = req.body.username;
   if (_username === "") {
      res.status(400).json({"success": false, "reason": "Username can not be empty."})
      return 1;
   }
   else if (_username.length >= 16) {
      res.status(400).json({"success": false, "reason": "Username can not be longer than 16 characters."})
      return 1;
   }
   else if (_username.includes(" ")) {
      res.status(400).json({"success": false, "reason": "Username can not contain empty spaces."})
      return 1;
   }
   else {
      function check_callback(l) {
         console.log(l);
         if (l === 0) {
            res.status(200).json({"success": true, "reason": "Username is available."})
         } else {
            res.status(400).json({"success": false, "reason": "Username is not available."})
         }
      }

      Users.checkUsername(_username.trim(), check_callback)

   }
});
app.post('/users/create', function (req, res) {
   _name = req.body.name;
   _username = req.body.username;
   _email = req.body.email;
   _password = req.body.password;
   _user = {
      "name": _name.trim(),
      "username": _username.trim(),
      "email": _email.trim(),
      "password": _password.trim(),
      "source": "fotes.co",
      "description": ""
   };
   const cookies = new Cookies(req, res);
   if (_name.trim() === "") {
      res.status(400).json({"success": false, "reason": "Name can not be empty."});
      return 1;
   }
   if (_username.trim() === "") {
      res.status(400).json({"success": false, "reason": "Username can not be empty."});
      return 1;
   }
   if (_username.trim().length >= 16) {
      res.status(400).json({"success": false, "reason": "Username can not be longer than 16 characters."});
      return 1;
   }
   if (_username.trim().includes(" ")) {
      res.status(400).json({"success": false, "reason": "Username can not contain empty spaces"});
      return 1;
   }
   _emailIsValid = EmailValidator.validate(_email);
   if (!_emailIsValid) {
      res.status(400).json({"success": false, "reason": "Email is invalid"});
      return 1;
   }
   if (_password.trim() === "") {
      res.status(400).json({"success": false, "reason": "Password can not be empty."});
      return 1;
   }
   if (_password.trim().length <= 4) {
      res.status(400).json({"success": false, "reason": "Password can not be shorter than 5 characters."});
      return 1;
   }
   if (_password.trim().includes(" ")) {
      res.status(400).json({"success": false, "reason": "Password can not contain empty spaces"});
      return 1;
   }
   const _Cookies = require('./models/cookies');

   function create_callback(r) {
      if (r[0]) {
         //log in the user.
         function login_callback(login) {
            if (login[0]) {
               function validate_cookie(rup) {
                  if (rup[0]) {
                     _uid = rup[1]
                     // update picture
                     var _link = "";
                     _avatarNumber = Math.floor(Math.random() * Math.floor(5));
                     console.log(_avatarNumber);
                     var params = {
                        localFile: "vendor/img/default_avatars/" + _avatarNumber + ".png",
                        s3Params: {
                           Bucket: "fotesapp",
                           Key: "profiles/" + _uid + ".png",
                           ACL: 'public-read',
                        },
                     };
                     var uploader = s3Client.uploadFile(params);
                     uploader.on('error', function (err) {
                        console.error("unable to upload:", err.stack);
                     });
                     uploader.on('progress', function () {
                        console.log("progress", uploader.progressMd5Amount,
                            uploader.progressAmount, uploader.progressTotal);
                     });
                     uploader.on('end', function () {
                        console.log("done uploading");
                        _link = "https://s3.amazonaws.com/fotesapp/profiles/" + _uid + ".png";
                        console.log(_link);

                        function update_photo_callback(result_callback) {
                           console.log(result_callback);
                           // res.status(200).send({"sucess":result_callback});
                           //storage cookie in browser
                           var d = new Date();
                           var year = d.getFullYear();
                           var month = d.getMonth();
                           var day = d.getDate();
                           var c = new Date(year + 1, month, day)  //set cookie expiration after 1 year
                           cookies.set("ftoken", login[2], {httpOnly: false, expires: c})
                           res.json({"success": true, "token": login[2]})
                        }

                        Users.update_photo(_uid, _link, update_photo_callback);

                     });
                  }
               }

               _Cookies.validateCookie(login[2], validate_cookie);


            } else {
               res.status(400).json({"success": false, "reason": "Service unavailabe"})

            }
         }

         Users.login(_email, _password, login_callback);
      } else {
         console.log(r);
         res.status(400).json({"success": false, "reason": r[1].error})
      }
   }

   Users.create(_user, create_callback)
});
app.get('/users/search', function (req, res) {
   _username = req.param('username');
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");

   function validate_cookie(result) {
      if (result[0]) {
         _uid = result[1]

         function callback(results) {
            res.status(201).json(results);
         }

         Users.search(_username, result[2], callback)
      } else {
         function callback(results) {
            res.status(201).json(results);
         }

         Users.search(_username, result[2], null, callback)
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);

});
app.get('/feed/me', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");

   function validate_cookie(result) {
      function callback(results) {
         res.status(201).json(results.reverse());
      }

      if (result[0]) {
         _uid = result[2].uid
      } else {
         _following = []
         _uid = _Cookies.NULL_USER;
      }
      console.log(_uid);

      function following_callback(f) {
         console.log(f);
         following_list = f.map(x => x.uid);
         Fotes.feed(result[2], following_list, callback)
      }

      Users.following(result[1], following_callback)
   }

   _Cookies.validateCookie(idToken, validate_cookie);

});
app.get('/api/notifications', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");

   function validate_cookie(result) {

      if (result[0]) {
         _uid = result[2].uid

         function notifications_callback(notifications) {
            res.status(201).json(notifications);
         }

         FotesNotifications.getNotifications(result[2], notifications_callback);
      } else {
         return res.send({"success": false, "error": "Invalid auth"});

      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);

});
app.get('/api/me', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie
         function latestPlace(place) {
             console.log("place", place);
            _obj = result[2];
            _obj["latest_place"] = place;

            function followers_callback(f) {
               _obj["followers_full"] = f;

                console.log("followers_full", f);

               function following_callback(f) {
                  _obj["following_full"] = f;
                   console.log("following_full", f);

                  function blocked_list_callback(b) {
                     _obj["blocked_users"] = b;
                     console.log(_obj);
                     res.status(200).send(_obj);
                  }

                  Users.get_blocked_list(result[1], blocked_list_callback)
               }

               Users.following(result[1], following_callback)
            }

            Users.followers(result[1], followers_callback)
         }

         Fotes.getLatestPosition(result[1], latestPlace)

      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }

   }

   _Cookies.validateCookie(idToken, validate_cookie);

});
app.post('/api/me/phone_verification', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   countryCode = req.body.countryCode;
   phone = req.body.phone;
   console.log(countryCode);
   console.log(phone);

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie
         uid = result[1];
         var phoneVerification = require('./models/PhoneVerification');

         function callback() {
            return res.send({"success": true, "error": "sent"});
         }

         phoneVerification.sendSMS(uid, countryCode + phone, callback)

      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }

   }

   _Cookies.validateCookie(idToken, validate_cookie);

});
app.post('/api/me/phone_verification/verify', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   code = req.body.code;
   console.log(code)

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie
         uid = result[1];
         var phoneVerification = require('./models/PhoneVerification');

         function callback(c) {
            if (c) {
               res.status(200).json({"success": true, "response": "phone verified"})
            } else {
               res.status(400).json({"success": false, "response": "Invalid code"})
            }
         }

         phoneVerification.verify(uid, code, callback)

      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }

   }

   _Cookies.validateCookie(idToken, validate_cookie);

});
app.post('/api/me/email_verification', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie
         let uid = result[1];
         emailVerification.sendRequest(uid, (code, result) => {
            return res.status(code).json(result);
         });
      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);
});
app.get('/verify_email', function (req, res) {
   let token = req.query.token;
   emailVerification.verifyEmailToken(token, res);
});
app.get('/users/:user_id', function (req, res) {
   uid = req.params.user_id;
   var _Cookies = require('./models/cookies');
   var cookies = new Cookies(req, res);
   var idToken = cookies.get("ftoken");

   function validate_cookie(result) {
      if (result[0]) {
         /*function get_user_callback(user) {
            if (user.empty) {
               return res.send({"success": false, "error": "Invalid uid"});
            }

            function latestPlace(place) {
               user["latest_place"] = place;

               function followers_callback(f) {
                  user["followers_full"] = f;

                  function following_callback(f) {
                     user["following_full"] = f;
                     res.status(200).send(user);
                  }

                  Users.following(uid, following_callback)
               }

               Users.followers(uid, followers_callback)

            }

            Fotes.getLatestPosition(uid, latestPlace)

         }


         Users.getUserById(result[1], get_user_callback)*/

         console.log(result[1]);
      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);


});
app.get('/api/users/:userId/followers', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   userId = req.param("userId")

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie
         function followers_callback(f) {
            res.status(201).json(f);
         }

         Users.followers(userId, followers_callback)

      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }

   }

   _Cookies.validateCookie(idToken, validate_cookie);

});
app.get('/api/users/:userId/following', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   userId = req.param("userId")

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie
         function following_callback(f) {
            res.status(201).json(f);
         }

         Users.following(userId, following_callback)

      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }

   }

   _Cookies.validateCookie(idToken, validate_cookie);

});
app.get('/unset_cookie', function (req, res) {
   var cookies = new Cookies(req, res);
   var idToken = cookies.get("ftoken")

   function result_cookie(result) {
      res.writeHead(302, {
         'Location': '/'
      });
      res.end();
   }

   var _Cookies = require('./models/cookies');
   _Cookies.invalidateCookie(idToken, result_cookie);


});

function validateFote(fote) {
   _isValid = true;
   fote.hasOwnProperty("note") ? _isValid = true : _isValid = false;
   fote.hasOwnProperty("location") ? _isValid = true : _isValid = false;
   fote.hasOwnProperty("hashtags") ? _isValid = true : _isValid = false;
   fote.hasOwnProperty("type") ? _isValid = true : _isValid = false;
   fote.hasOwnProperty("date") ? _isValid = true : _isValid = false;
   return _isValid;
}

app.post('/notifications/update_token', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   _token = req.body.token;
   console.log(_token);

   function validate_cookie(result) {
      console.log(result);
      if (result[0]) {//if valid cookie
         var uid = result[1];

         function token_callback(r) {
            return res.status(200).send({"success": true, "message": r});
         }

         Users.update_token(uid, _token, token_callback)
      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);

});
app.post('/fotes/upload/type', function (req, res, next) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie
         _fote = req.body.fote
         try {
            _f = JSON.parse(_fote)
            _user_tags = []
            _f.note.split(" ").forEach(function (x) {
               if (x.startsWith("@")) {
                  _user_tags.push(x);
               }
            });
            _f["user_tags"] = _user_tags;

            if (!validateFote(_f)) {
               throw -1
            }
            if (_f.type != "type") {
               throw -1
            }
         } catch (ex) {
            console.log(ex);
            res.status(401).send({"success": false, "error": "Invalid JSON"});

            return 1;
         }

         _f["media"] = [];
         _f["creation_date"] = Date.now();
         _f["uid"] = result[1];

         function fote_callback(sFote) {
            _status = sFote[0] ? 201 : 401;
            if (sFote[0]) {
               FCM.notify(admin, result[2].notification_token, "Post uploaded")
               _user_tags.forEach(function (u) {
                  su = u.replace("@", "")
                  FCM.notifyUserIsTagged(admin, result[2], su);
               });
            }
            res.status(_status).send(sFote[1]);
         }

         _lat = _f.location.latitude;
         _lon = _f.location.longitude;

         if (_lat == null) {
            _lat = 0;
            _lon = 0;
         }

         _f["location_index"] = [_lat, _lon]
         Fotes.create(_f, fote_callback)

      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }

   }

   _Cookies.validateCookie(idToken, validate_cookie);


});
app.post('/fotes/upload/audiocaption', upload.fields([{name: 'photo_fote', maxCount: 1}, {
   name: 'audio_fote',
   maxCount: 1
}]), function (req, res, next) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   console.log("============================UPLOADING (audio caption) ============")

   function validate_cookie(result) {
      if (result[0]) {//if valid cookaie
         let fote = req.body.fote;
         let files = req.files;
         FotesFuncs.createFote(result, fote, files, res);
      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }

   }

   _Cookies.validateCookie(idToken, validate_cookie);
});
app.post('/fotes/upload', upload.array('media', 99), function (req, res, next) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   uploaded = false;
   console.log("============================UPLOADING============")

   function validate_cookie(result) {
      if (result[0]) {//if valid cookaie
         _fote = req.body.fote
         _isAudioUpload = false;
         try {
            _f = JSON.parse(_fote)
            _user_tags = []
            _f.note.split(" ").forEach(function (x) {
               if (x.startsWith("@")) {
                  _user_tags.push(x);
               }
            });
            _f["user_tags"] = _user_tags;

            if (!validateFote(_f)) {
               throw -1
            }
            if (_f.hasOwnProperty("activity")) {

            }
         } catch (ex) {
            console.log(ex);
            res.status(401).send({"success": false, "error": "Invalid JSON"});

            return 1;
         }
         uploadedFiles = 0;
         uploadedThumbnails = 0;

         filesArray = []
         thumbnailsArray = []

         function uploadFote() {
            _f["media"] = filesArray;
            _f["thumbnails"] = thumbnailsArray;

            _f["creation_date"] = Date.now();
            _f["uid"] = result[1];

            function fote_callback(sFote) {
               _status = sFote[0] ? 201 : 401;
               if (sFote[0]) {
                  FCM.notify(admin, result[2].notification_token, "Post uploaded")
                  _user_tags.forEach(function (u) {
                     su = u.replace("@", "")
                     FCM.notifyUserIsTagged(admin, result[2], su);
                  });
               }
               res.status(_status).send(sFote[1]);
            }

            _lat = _f.location.latitude;
            _lon = _f.location.longitude;
            if (_lat == null) {
               _lat = 0;
               _lon = 0;
            }
            _f["location_index"] = [_lat, _lon]
            Fotes.create(_f, fote_callback)
         }

         function onFileUploaded() {
            if (req.files.length == uploadedFiles) {
               if (req.files.length == uploadedThumbnails) {
                  uploadFote();
               } else if (_isAudioUpload) {
                  uploadFote();
               }
            }
         }

         function uploadThumbnailCallback(link) {
            uploadedThumbnails += 1;
            thumbnailsArray.push(link)
            onFileUploaded();

         }

         function uploadFileCallback(link) {
            uploadedFiles += 1;
            filesArray.push(link)
            onFileUploaded();

         }

         function error(err) {

         }

         if (req.files.length != 0) {
            ___file = req.files[0];
            console.log(JSON.stringify(___file))

            if (___file.mimetype == "video/quicktime") {
               // create video thumbnail
               _extension = "png";
               _fn = ___file.filename.split(".")[0];
               _thumbnailPath = "uploads/" + _fn + "_thumbnail." + _extension;
               extractFrame({
                  input: ___file.path,
                  output: _thumbnailPath,
                  offset: 1000 // seek offset in milliseconds
               }).then(function (val) {

                  _tf = {
                     "fieldname": "media",
                     "originalname": ___file.originalname,
                     "encoding": ___file.encoding,
                     "mimetype": "image/png",
                     "destination": ___file.destination,
                     "filename": _fn + "_thumbnail." + _extension,
                     "path": _thumbnailPath,
                     "size": ___file.size,
                  }
                  saveToS3(_tf, uploadThumbnailCallback)


               })
               saveToS3(___file, uploadFileCallback)
            } else if (___file.mimetype == "audio/x-aac" || ___file.mimetype == "audio/mp4") {
               // upload audio file
               saveToS3(___file, uploadFileCallback)
               _isAudioUpload = true
               //saveToS3(___file,uploadThumbnailCallback)

            } else {
               // create image thumbnail
               jimp.read(___file.path, function (err, image) {
                  console.log(err);
                  _extension = mime.extension(___file.mimetype);
                  _fn = ___file.filename.split(".")[0];
                  _w = image.bitmap.width;
                  _h = image.bitmap.height;
                  _r = _w / _h;
                  _metadata = {
                     "width": _w,
                     "height": _h,
                     "aspect_ratio": _r,
                     "predominant_color": ""
                  }
                  //
                  _thumbnailPath = "uploads/" + _fn + "_thumbnail." + _extension;
                  image.quality(0.25).scale(0.8).write(_thumbnailPath)

                  function predominantColor_callback(color) {
                     _metadata["predominant_color"] = color;
                     _tf = {
                        "fieldname": "media",
                        "originalname": ___file.originalname,
                        "encoding": ___file.encoding,
                        "mimetype": ___file.mimetype,
                        "destination": ___file.destination,
                        "filename": _fn + "_thumbnail." + _extension,
                        "path": _thumbnailPath,
                        "size": ___file.size,
                        "metadata": _metadata

                     }
                     saveToS3(_tf, uploadThumbnailCallback)
                     __file = ___file;
                     __file["metadata"] = _metadata;
                     saveToS3(___file, uploadFileCallback)
                  }

                  ImageTools.getPredominantColor(_thumbnailPath, predominantColor_callback);
               });
            }

         }
         if (req.files.length == 0) {
            if (_f.hasOwnProperty("activity")) {
               uploadFote();
            }
         }
      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }

   }

   _Cookies.validateCookie(idToken, validate_cookie);


});

function saveToS3(file, ufc) {
   var params = {
      localFile: './uploads/' + file.filename,
      s3Params: {
         Bucket: "fotesapp",
         Key: "fotes/" + file.filename,
         ACL: 'public-read'
      },
   };
   var uploader = s3Client.uploadFile(params);

   uploader.on('error', function (err) {
      console.error("unable to upload:", err.stack);
   });
   uploader.on('progress', function () {
      console.log("progress", uploader.progressMd5Amount,
          uploader.progressAmount, uploader.progressTotal);
   });
   uploader.on('end', function () {
      // console.log("done uploading");
      _url = "https://s3.amazonaws.com/fotesapp/fotes/" + file.filename
      file["url"] = _url
      ufc(file)
   });
}

//update profile photo
app.post('/profile/update_photo', upload.fields([{name: 'file', maxCount: 1}]), function (req, res) {
   var cookies = new Cookies(req, res);

   var Users = require('./models/users');

   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie{
         var _link = "";
         var uid = result[1];
         var params = {
            localFile: req.files.file[0].path,
            s3Params: {
               Bucket: "fotesapp",
               Key: "profiles/" + uid + ".png",
               ACL: 'public-read',
            },
         };
         var uploader = s3Client.uploadFile(params);
         uploader.on('error', function (err) {
            console.error("unable to upload:", err.stack);
         });
         uploader.on('progress', function () {
            console.log("progress", uploader.progressMd5Amount,
                uploader.progressAmount, uploader.progressTotal);
         });
         uploader.on('end', function () {
            console.log("done uploading");
            _link = "https://s3.amazonaws.com/fotesapp/profiles/" + uid + ".png";

            function update_photo_callback(result_callback) {
               res.status(200).send({"sucess": result_callback});
            }

            Users.update_photo(uid, _link, update_photo_callback);

         });

      }
   }

   // validate cookie
   _Cookies.validateCookie(idToken, validate_cookie);

});
//update profile photo
app.post('/profile/update_profile', function (req, res) {
   var cookies = new Cookies(req, res);
   var Users = require('./models/users');
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   var description = req.body.description;

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie{
         var _link = "";
         var uid = result[1];

         function description_callback(result_callback) {
            res.status(200).send({"sucess": result_callback});
         }

         Users.update_description(uid, description, description_callback);
      } else {
         return res.send({"success": false, "error": "Invalid auth"});

      }
   }

   // validate cookie
   _Cookies.validateCookie(idToken, validate_cookie);

});
//add like
app.post('/fotes/like', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");

   var _idFote = req.body.idFote;

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie
         var uid = result[1];
         var user = result[2];

         function callbackLike(_r) {
            if (_r[2] > 0) {
               function callback(isOwnFote) {
                  console.log("isOwnFote:" + isOwnFote);
                  if (!isOwnFote) {
                     FCM.notifyLike(admin, user, _idFote)
                  }
               }

               Fotes.isOwnFote(_idFote, uid, callback)
            }
            return res.status(200).send({"sucess": _r[0], "fotes": _r[1]});
         }

         Fotes.addLike(_idFote, uid, callbackLike);
      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);
});
//remove likes
app.post('/fotes/unlike', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");

   var _idFote = req.body.idFote;

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie
         var uid = result[1];

         function callbackLike(result) {
            res.status(200).send({"sucess": result[0], "fotes": result[1]});
         }

         Fotes.removeLike(_idFote, uid, callbackLike);
      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);
});
app.post('/fotes/comment', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");

   var _idFote = req.body.idFote;
   var _comment = req.body.comment;
   if (_comment.trim() == "") {
      return res.send({"success": false, "error": "Message can not be empty."});
      return 1;
   }

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie
         var uid = result[1];

         function callbackComment(result) {
            return res.status(200).send({"success": result[0], "fotes": result[1]});
         }

         Comments.comment(_idFote, uid, _comment, callbackComment);

         function callback(isOwnFote) {
            console.log("isOwnFote:" + isOwnFote);
            if (!isOwnFote) {
               FCM.notifyComment(admin, result[2], _idFote, _comment)
            }
         }

         Fotes.isOwnFote(_idFote, uid, callback)


      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);
});
app.get('/fotes/:foteId/', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   foteId = req.params.foteId;

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie
         function callback(results) {
            res.status(201).json(results.reverse());
         }

         Fotes.getFote(foteId, callback)


      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }

   }

   _Cookies.validateCookie(idToken, validate_cookie);

});
app.post('/fotes/:foteId/event/interact', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   foteId = req.params.foteId;
   var interaction = req.body.interaction;
   _validInteractions = ["going", "not_going", "interested"];
   if (!_validInteractions.includes(interaction)) {
      return res.status(401).send({"success": false, "error": "Invalid interaction"});
      return 1;
   }

   function validate_cookie(result) {
      if (result[0]) { //if valid cookie
         var uid = result[1];


         // get fote
         function fote_callback(foteResult) {
            if (foteResult.length == 0) {
               return res.send({"success": false, "error": "Invalid fote_id"});
            } else {
               function callbackInteraction(result) {
                  return res.status(200).send({"success": result});
               }

               Events.interact(foteId, uid, interaction, callbackInteraction);
               _msg = {
                  "creation_date": Date.now(),
                  "interaction": interaction
               };
               FCM.notifyEvent(admin, result[2], foteResult[0].creator_user[0].username, _msg)
            }
         }

         Fotes.getFoteInfo(foteId, fote_callback);
      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);
});
app.post('/fotes/:foteId/delete', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   foteId = req.params.foteId;

   function validate_cookie(result) {
      if (result[0]) { //if valid cookie
         var uid = result[1];

         // get fote
         function fote_callback(foteResult) {
            if (foteResult.length == 0) {
               return res.send({"success": false, "error": "Invalid fote_id"});
            } else {
               function delete_callback(result) {
                  return res.status(200).send({"success": result});
               }

               Fotes.delete(foteId, uid, delete_callback);
            }
         }

         Fotes.getFoteInfoWithUid(foteId, uid, fote_callback);
      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);
});
app.post('/fotes/:foteId/task/interact', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   foteId = req.params.foteId;
   var interaction = req.body.interaction;
   _validInteractions = ["not_interested", "interested"];
   if (!_validInteractions.includes(interaction)) {
      return res.status(401).send({"success": false, "error": "Invalid interaction"});
      return 1;
   }

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie
         var uid = result[1];

         function fote_callback(foteResult) {
            if (foteResult.length == 0) {
               return res.send({"success": false, "error": "Invalid fote_id"});
            } else {

               function callbackInteraction(resultI) {
                  //Create conversation
                  if (uid != foteResult[0].uid) {
                     function msg_callback() {

                     }

                     if (foteResult[0].media[0].mimetype == "image/jpeg") {
                        _activity = {
                           "type": "image",
                           "url": foteResult[0].media[0].url,
                           "fote_id": foteResult[0]._id.toString()
                        }
                     } else {
                        _activity = {
                           "type": null,
                           "url": null,
                           "fote_id": foteResult[0]._id.toString()
                        }
                     }
                     Dms.sendMessageToUid(result[2], foteResult[0].creator_user[0], _activity, "task", admin, msg_callback)

                  }
                  //return result
                  return res.status(200).send({"success": resultI});

               }

               // interact
               Tasks.interact(foteId, uid, interaction, callbackInteraction);
            }
         }

         // get the Fote
         Fotes.getFoteInfo(foteId, fote_callback);
         // FCM.notifyComment(admin,result[2],_idFote,_comment)

      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);
});

app.post('/fotes/:foteId/trip/interact', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   foteId = req.params.foteId;
   var interaction = req.body.interaction;
   _validInteractions = ["not_interested", "interested"];
   if (!_validInteractions.includes(interaction)) {
      return res.status(401).send({"success": false, "error": "Invalid interaction"});
      return 1;
   }

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie
         var uid = result[1];

         function fote_callback(foteResult) {
            if (foteResult.length == 0) {
               return res.send({"success": false, "error": "Invalid fote_id"});
            } else {

               function callbackInteraction(resultI) {
                  //Create conversation
                  if (uid != foteResult[0].uid) {
                     function msg_callback() {

                     }

                     if (foteResult[0].media[0].mimetype == "image/jpeg") {
                        _activity = {
                           "type": "image",
                           "url": foteResult[0].media[0].url,
                           "fote_id": foteResult[0]._id.toString()
                        }
                     } else {
                        _activity = {
                           "type": null,
                           "url": null,
                           "fote_id": foteResult[0]._id.toString()
                        }
                     }
                     Dms.sendMessageToUid(result[2], foteResult[0].creator_user[0], _activity, "trip", admin, msg_callback)

                  }
                  //return result
                  return res.status(200).send({"success": resultI});

               }

               // interact
               Trips.interact(foteId, uid, interaction, callbackInteraction);
            }
         }

         // get the Fote
         Fotes.getFoteInfo(foteId, fote_callback);
         // FCM.notifyComment(admin,result[2],_idFote,_comment)

      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);
});
app.get('/foteinfo/:foteId/', function (req, res) {
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   foteId = req.params.foteId;

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie
         function callback(results) {
            res.status(201).json(results.reverse());
         }

         Fotes.getFoteInfo(foteId, callback)


      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }

   }

   _Cookies.validateCookie(idToken, validate_cookie);

});
app.get('/places/search/', function (req, res) {
   _lat = req.param('lat');
   _lon = req.param('lon');
   _name = req.param('name');

   function search_response(r) {
      return res.send({"success": true, "places": r});
   }

   if (_name == null) {
      console.log("near");
      GPlaces.search(_lat, _lon, _name, search_response);
   } else {
      console.log("name");
      GPlaces.searchByName(_name, search_response);

   }

});
app.get('/places/details/:place_id', function (req, res) {
   _place_id = req.params.place_id;

   function search_response(r) {
      return res.send({"success": true, "place": r});
   }

   GPlaces.placeDetails(_place_id, search_response);

});
app.get('/fotes/search_by_place_id/:place_id', function (req, res) {
   _place_id = req.params.place_id;

   function search_response(r) {
      return res.send({"success": true, "fotes": r});
   }

   Fotes.getFotesByPlaceId(_place_id, search_response);

});
app.get('/profile/user/:id', function (req, res) {
   let uid = req.params.id;
   UsersFunc.getUserById(uid, res, (result) => {
      res.status(200).json(result);
   });
});
app.get('/users/:user_id/fotes', function (req, res) {
   uid = req.params.user_id;

   function search_response(r) {
      function latestPlace(place) {
         r["latest_place"] = place;

         function followers_callback(f) {

            r.forEach(function (fote) {
               fote.user[0]["followers_full"] = f;
            });

            function following_callback(f) {
               r.forEach(function (fote) {
                  fote.user[0]["following_full"] = f;
               });
               return res.send({"success": true, "fotes": r, "latest_place": place});

            }

            Users.following(uid, following_callback)
         }

         Users.followers(uid, followers_callback)


      }

      Fotes.getLatestPosition(uid, latestPlace)

   }

   Fotes.getFotesByUserId(uid, search_response);

});
app.post('/users/:user_id/follow', function (req, res) {
   uid = req.params.user_id;
   var users = require('./models/users');
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");

   function validate_cookie(result) {

      if (result[0]) {//if valid cookie
         _uid = result[1];
         me = result[2];

         if (uid == _uid) {
            return res.send({"success": false, "error": "You can not follow yourself"});

         } else {
            //validate User
            function get_user_callback(user) {
               if (user == null) {
                  return res.send({"success": false, "error": "Invalid uid"});
               } else {
                  // follow
                  function follow_callback(result) {
                     FCM.notifyFollow(admin, me, uid)
                     return res.send({"success": result});
                  }

                  Users.follow(uid, _uid, follow_callback)
               }
            }

            Users.getUserById(uid, get_user_callback)
         }

      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);


});
app.post('/users/:user_id/block', function (req, res) {
   uid = req.params.user_id;
   var users = require('./models/users');
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");

   function validate_cookie(result) {

      if (result[0]) {//if valid cookie
         _uid = result[1];
         me = result[2];
         if (uid == _uid) {
            return res.send({"success": false, "error": "You can not block yourself"});
         } else {
            //validate User
            function get_user_callback(user) {
               console.log("BLOCKING2");
               console.log(user);

               if (user == null) {
                  return res.send({"success": false, "error": "Invalid uid"});
               } else {
                  // follow
                  function block_callback(result) {
                     return res.send({"success": result});
                  }

                  Users.block(_uid, uid, block_callback)
               }
            }

            Users.getUserById(uid, get_user_callback)
         }

      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);


});
app.post('/users/:user_id/unblock', function (req, res) {
   uid = req.params.user_id;
   var users = require('./models/users');
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");

   function validate_cookie(result) {

      if (result[0]) {//if valid cookie
         _uid = result[1];
         me = result[2];
         if (uid == _uid) {
            return res.send({"success": false, "error": "You can not unblock yourself"});
         } else {
            //validate User
            function get_user_callback(user) {
               if (user == null) {
                  return res.send({"success": false, "error": "Invalid uid"});
               } else {
                  // follow
                  function block_callback(result) {
                     return res.send({"success": result});
                  }

                  Users.unblock(_uid, uid, block_callback)
               }
            }

            Users.getUserById(uid, get_user_callback)
         }

      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);


});
app.post('/users/:user_id/unfollow', function (req, res) {
   uid = req.params.user_id;
   var users = require('./models/users');
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");

   function validate_cookie(result) {

      if (result[0]) {//if valid cookie
         _uid = result[1];
         if (uid == _uid) {
            return res.send({"success": false, "error": "You can not unfollow yourself"});

         } else {
            //validate User
            function get_user_callback(user) {
               if (user == null) {
                  return res.send({"success": false, "error": "Invalid uid"});
               } else {
                  // follow
                  function follow_callback(result) {
                     return res.send({"success": result});
                  }

                  Users.unfollow(uid, _uid, follow_callback)
               }
            }

            Users.getUserById(uid, get_user_callback)
         }

      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);


});
// ENDPOINTS END
/*var server = https.createServer(options, app);

_httpsPort = 4001;
server.listen(_httpsPort, function () {
   console.log('Fotes up and running at  port: %s', _httpsPort);
});*/
// Dms
app.post('/dms/create', function (req, res) {
   var users = require('./models/users');
   uidb = req.body.uid;
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   console.log("create");
   console.log(uidb);

   function validate_cookie(result) {

      if (result[0]) {//if valid cookie
         _uid = result[1]
         if (_uid == uidb) {
            console.log("same")
            return res.send({"success": false, "error": "Can't create a dm with yourself."});
         } else {
            console.log("not same")

            function get_user_callback(userB) {
               if (userB == null) {
                  console.log('userb null')
                  return res.send({"success": false, "error": "Invalid uid"});
               } else {
                  console.log("userb ok")

                  function dms_callback(result) {
                     res.status(200).json({"success": true, "response": result})
                  }

                  Dms.create(result[2], userB, dms_callback);
               }
            }

            console.log("searching ub")
            users.getUserById(uidb, get_user_callback)

         }
      }
      else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);
});

app.get('/dms/', function (req, res) {
   var users = require('./models/users');
   uidb = req.body.uid;
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");

   function validate_cookie(result) {

      if (result[0]) {//if valid cookie
         _uid = result[1]

         function dms_callback(result) {
            console.log(result.length);
            result.forEach(function (c) {
               _title = "";
               _conversation_image = null;
               c.participants.forEach(function (p) {
                  if (p.uid != _uid) {
                     _title = p.name;
                     if (p.hasOwnProperty("photo")) {
                        _conversation_image = p.photo;
                     }
                  }
               });
               c["title"] = _title;
               c["conversation_image"] = _conversation_image;
            });

            res.status(200).json({"success": true, "response": result})

         }

         Dms.getConversations(result[2], dms_callback);
      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);
});
app.post('/dms/:dmid/delete_msg', function (req, res) {
   var users = require('./models/users');
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   dmid = req.params.dmid;
   _timestamp = req.body.timestamp;


   function validate_cookie(result) {

      if (result[0]) {//if valid cookie
         _uid = result[1]
         _user = result[2]

         function dms_callback(dm) {
            if (dm.length == 0) {
               return res.status(404).send({"success": false, "error": "Invalid dmid"});
            } else {
               function del_callback(result) {
                  res.status(200).json({"success": true, "response": result})
               }

               Dms.deleteMsg(dmid, _uid, _timestamp, del_callback);
            }
         }

         Dms.getConversation(_uid, dmid, dms_callback);
      } else {
         return res.status(401).send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);

});
app.post('/dms/:dmid/send', upload.array('media', 1), function (req, res) {
   var users = require('./models/users');
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   dmid = req.params.dmid;
   message = req.body.message;
   let reply = req.body.reply;

   function validate_cookie(result) {

      if (result[0]) {//if valid cookie
         _uid = result[1]
         _user = result[2]
         thumbnailsArray = [];
         filesArray = []
         uploadedThumbnails = 0;
         uploadedFiles = 0;


         //-----SEND MESSAGE-----------------------------------------------------//
         function sendMessage() {
            _message = {
               "type": "text",
               "message": message,
               "uid": _uid,
               "dm_id": dmid,
               "media": filesArray,
               "thumbnails": thumbnailsArray
            }
            if (reply) {
               _message.reply = JSON.parse(reply);
               _message.is_reply = true;
            }
            if (filesArray.length > 0) {
               _media = filesArray[0]
            } else {
               _media = []
            }
            if (thumbnailsArray.length > 0) {
               _thumbnails = thumbnailsArray[0]
            } else {
               _thumbnails = []
            }
            _messageFCM = {
               "type": "text",
               "message": message,
               "uid": _uid,
               "dm_id": dmid,
               "media": JSON.stringify(_media),
               "thumbnails": JSON.stringify(_thumbnails)

            }
            if (reply) {
               _messageFCM.reply = JSON.parse(reply);
               _messageFCM.is_reply = true;
            }

            function dms_callback(dm) {
               if (dm.length == 0) {
                  return res.status(404).send({"success": false, "error": "Invalid dmid"});
               } else {
                  function dms_callback(result) {
                     res.status(200).json({"success": true, "response": result})
                     // FCM
                     _receiverUserName = null;
                     _messageFCM["creation_date"] = _message["creation_date"]
                     console.log(JSON.stringify(dm[0].participants));
                     console.log("-==-=-=MESSAGE==-=-=-=");
                     console.log(_messageFCM);
                     console.log("-==-=-=MESSAGE==-=-=-=");

                     if (dm[0].participants[0]._id == _uid) {
                        // send to userB
                        _receiverUserName = dm[0].participants[1].username;
                     } else {
                        // send to userA
                        _receiverUserName = dm[0].participants[0].username;
                     }
                     FCM.notifyDM(admin, _user, _receiverUserName, _messageFCM)

                  }

                  Dms.sendMessage(dmid, _message, dms_callback);
               }
               //
               // res.status(200).json({"success":true,"response":result})

            }

            Dms.getConversation(_uid, dmid, dms_callback);
         }

         //----------------------------------------------------------------------//
         function uploadFileCallback(link) {
            uploadedFiles += 1;
            filesArray.push(link)
            onFileUploaded();
         }

         function onFileUploaded() {
            if (req.files.length == uploadedFiles) {
               if (req.files.length == uploadedThumbnails) {
                  sendMessage();
               }
            }
         }

         function uploadThumbnailCallback(link) {
            uploadedThumbnails += 1;
            thumbnailsArray.push(link)
            onFileUploaded();

         }

         if (req.files == null) {
            sendMessage();
         } else {
            // process media
            if (req.files.length != 0) {
               ___file = req.files[0]
               if (___file.mimetype == "video/quicktime") {
                  // create video thumbnail
                  _extension = "png";
                  _fn = ___file.filename.split(".")[0];
                  _thumbnailPath = "uploads/" + _fn + "_thumbnail." + _extension;
                  extractFrame({
                     input: ___file.path,
                     output: _thumbnailPath,
                     offset: 1000 // seek offset in milliseconds
                  }).then(function (val) {
                     _tf = {
                        "fieldname": "media",
                        "originalname": ___file.originalname,
                        "encoding": ___file.encoding,
                        "mimetype": "image/png",
                        "destination": ___file.destination,
                        "filename": _fn + "_thumbnail." + _extension,
                        "path": _thumbnailPath,
                        "size": ___file.size,
                     }
                     saveToS3(_tf, uploadThumbnailCallback)
                  })
                  saveToS3(___file, uploadFileCallback)
               } else {
                  console.log("generate thumbnail")
                  console.log(___file.mimetype)
                  // create image thumbnail
                  jimp.read(___file.path, function (err, image) {
                     console.log(err);
                     _extension = mime.extension(___file.mimetype);
                     _fn = ___file.filename.split(".")[0];
                     _thumbnailPath = "uploads/" + _fn + "_thumbnail." + _extension;
                     _w = image.bitmap.width;
                     _h = image.bitmap.height;
                     _r = _w / _h;
                     _metadata = {
                        "width": _w,
                        "height": _h,
                        "aspect_ratio": _r
                     }
                     image.quality(0.25).scale(0.8).write(_thumbnailPath)

                     function predominantColor_callback(color) {
                        _metadata["predominant_color"] = color;
                        _tf = {
                           "fieldname": "media",
                           "originalname": ___file.originalname,
                           "encoding": ___file.encoding,
                           "mimetype": ___file.mimetype,
                           "destination": ___file.destination,
                           "filename": _fn + "_thumbnail." + _extension,
                           "path": _thumbnailPath,
                           "size": ___file.size,
                           "metadata": _metadata
                        }
                        saveToS3(_tf, uploadThumbnailCallback)
                        _file = ___file;
                        _file["metadata"] = _metadata;
                        saveToS3(_file, uploadFileCallback)
                     }

                     ImageTools.getPredominantColor(___file.path, predominantColor_callback);

                  });

               }
            }

         }


      } else {
         return res.status(401).send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);
});
app.post('/dms/:dmid/delete', upload.array('media', 1), function (req, res) {
   var users = require('./models/users');
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   dmid = req.params.dmid;

   function validate_cookie(result) {
      if (result[0]) { //if valid cookie
         _uid = result[1];

         function dms_callback(dm) {
            if (dm.length == 0) {
               return res.status(404).send({"success": false, "error": "Invalid dmid"});
            } else {

               function delete_conversation_callback(dcc) {
                  if (dcc) {
                     res.status(401).json({"success": true, "conversation_deleted": dcc})
                  } else {
                     res.status(200).json({"success": false, "conversation_deleted": dcc})
                  }
               }

               Dms.deleteConversation(_uid, dmid, delete_conversation_callback);


            }
         }

         Dms.getConversation(_uid, dmid, dms_callback);

      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);
});
//
app.get('/dms/:dmid', function (req, res) {
   var users = require('./models/users');
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   dmid = req.params.dmid;

   function validate_cookie(result) {

      if (result[0]) {//if valid cookie
         _uid = result[1]

         function dms_callback(result) {
            _title = "";
            _conversation_image = null;
            result[0].participants.forEach(function (p) {
               if (p.uid != _uid) {
                  _title = p.name;
                  if (p.hasOwnProperty("photo")) {
                     _conversation_image = p.photo;
                  }
               }
            });
            result[0]["title"] = _title;
            result[0]["conversation_image"] = _conversation_image;
            res.status(200).json({"success": true, "response": result})

         }

         Dms.getConversation(_uid, dmid, dms_callback);
      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);
});
// / end dms
app.post('/subscribers_list/subscribe', function (req, res) {
   email = req.body.email;

   function callback(subscription) {
      return res.send({"success": true});
   }

   Subscribers.subscribe(email, callback)
});
app.post('/fotes/:foteId/report', function (req, res) {
   var users = require('./models/users');
   var cookies = new Cookies(req, res);
   var _Cookies = require('./models/cookies');
   var idToken = cookies.get("ftoken");
   foteId = req.params.foteId;

   function validate_cookie(result) {
      if (result[0]) {//if valid cookie
         _uid = result[1];

         function callback(subscription) {
            return res.send({"success": true});
         }

         Reports.report(_uid, foteId, "FOTE", callback)
      } else {
         return res.send({"success": false, "error": "Invalid auth"});
      }
   }

   _Cookies.validateCookie(idToken, validate_cookie);
});

app.use((req, res, next) => {
   //logger.log('the url you are trying to reach is not hosted on our server', 'error');
   const err = new Error('Not Found');
   err.status = 404;
   res.status(err.status).json({ type: 'error', message: 'the url you are trying to reach is not hosted on our server' });
   next(err);
});

/*app.get('/', (request, response)=>{

   /!*db.collection('collectionName').doc('documentName').set(JSON.parse({
      "name":"girl"
   })).then(()=>{
      console.log("data has been added into the collection")
   });*!/

   response.send(`${Date.now()}`);
});

app.get('/name', (request, response)=>{
   response.send("Taskeen");
});*/

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.app = functions.https.onRequest(app);
