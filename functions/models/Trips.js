// Fotes.js
// Manages Events
// Swiffshot Technologies Inc. 2018 - All rights reserved
// Author: Darien Miranda <panzerfausten@gmail.com>
// ========
var ObjectID = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var _mongo_pwd = '8130c87a1ecbfa7e82836d38c2a010f7';
var url = "mongodb://fotes:"+_mongo_pwd+"@34.226.107.202:27017/fotes?authMechanism=SCRAM-SHA-1";
var Users = require('./users');

module.exports = {
  interact : function(foteId,uid,interaction,interaction_callback){
    MongoClient.connect(url, function(err, db) {
      _searchQuery ={
        "_id": ObjectID(foteId),
        "activity.type":"trip"
      }
      // pull from all fields
      _pullQuery =
      {
        '$pull':
          {
            'activity.interested':
            {
              '$in': [ uid ]
            },
             'activity.not_interested':
            {
              '$in': [ uid ]
            },

          }

      };
      db.collection("fotes").update(_searchQuery,_pullQuery,
         function(err, records){
           // and now push
           _pushQuery ={
             "$push":{}
           };
           _pushQuery["$push"]["activity."+interaction] = uid
           db.collection("fotes").update(_searchQuery,_pushQuery,
              function(err,records){
                interaction_callback(true)
              })
         });
    });
  }
};
