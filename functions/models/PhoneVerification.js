// PhoneVerification.js
// Allows account to be verified via SMS
// Swiffshot Technologies Inc. 2018 - All rights reserved
// Author: Darien Miranda <panzerfausten@gmail.com>
// ========
var ObjectID = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var _mongo_pwd = '8130c87a1ecbfa7e82836d38c2a010f7'
var url = "mongodb://fotes:"+_mongo_pwd+"@34.226.107.202:27017/fotes?authMechanism=SCRAM-SHA-1";

var twilio = require('twilio');

module.exports = {
  sendSMS: function(uid,to,callback){
    console.log("sending...");
    var accountSid = 'ACd7d6f1e825016a2adf23a51bc58dfa16'; // Your Account SID from www.twilio.com/console
    var authToken = '8ef6875191933edb0225d8da3ee61bbd';   // Your Auth Token from www.twilio.com/console

    var client = new twilio(accountSid, authToken);
    var code  = Math.floor(1000 + Math.random() * 9000);
    client.messages.create({
        body: code.toString(),
        to: '+'+to,  // Text this number
        from: '+17327075461' // From a valid Twilio number
    })
    // to: '+4901794265254',  // Text this number

    .then((message) => console.log(message.sid));
    console.log("sent?");

    _vcode ={"uid":uid,"code":code,"is_verified":false}
    MongoClient.connect(url, function(err, db) {
      db.collection("verification_code").updateOne({"uid":uid},_vcode, {"upsert":true},function(err, records){
        if(err){
          callback(false);
        }else{
          callback(true);
        }
      });

    });
  },
  verify: function(uid,code,callback){
    MongoClient.connect(url, function(err, db) {
      _vcode = {"uid":uid,"code":parseInt(code),"is_verified":true}
      console.log(JSON.stringify(_vcode))
      db.collection("verification_code").updateOne({"uid":uid,"code":parseInt(code),"is_verified":false},_vcode, {"upsert":false},function(err, records){
        if(err){
          callback(false);
        }else{
          _nModified = records.result.nModified;
          if(_nModified == 0){
            callback(false);
          }else{
            callback(true);
          }
        }
      });

    });
  }

};
