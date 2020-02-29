// Fotes.js
// Manages website subscribers list
// Swiffshot Technologies Inc. 2018 - All rights reserved
// Author: Darien Miranda <panzerfausten@gmail.com>
// ========
var ObjectID = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var _mongo_pwd = '8130c87a1ecbfa7e82836d38c2a010f7';
var url = "mongodb://fotes:"+_mongo_pwd+"@34.226.107.202:27017/fotes?authMechanism=SCRAM-SHA-1";
module.exports = {
  subscribe:function(email,addSubscriberCallback){
    subscriber = {"email":email};
    MongoClient.connect(url, function(err, db) {
      db.collection("subscribers").insert(subscriber, function(err, records){
        if(err){
          addSubscriberCallback([false,null]);
        }else{
          addSubscriberCallback([true,subscriber]);
        }
      });
    });
  }
};
