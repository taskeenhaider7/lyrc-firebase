// Reports.js
// Manages user's content reports.
// Swiffshot Technologies Inc. 2018 - All rights reserved
// Author: Darien Miranda <panzerfausten@gmail.com>
// ========
var ObjectID = require('mongodb').ObjectID;
var MongoClient = require('mongodb').MongoClient;
var _mongo_pwd = '8130c87a1ecbfa7e82836d38c2a010f7'
var url = "mongodb://fotes:"+_mongo_pwd+"@34.226.107.202:27017/fotes?authMechanism=SCRAM-SHA-1";
module.exports = {
  report:function(reported_by_uid,content_id,content_type,reportCallback){
    report = {
              "reported_by_oid":new ObjectID(reported_by_uid),
              "reported_by_uid":reported_by_uid,
              "content_id":new ObjectID(content_id),
              "content_type":"FOTE",
              "report_date":Date.now()
            };
    MongoClient.connect(url, function(err, db) {
      db.collection("reports").insert(report, function(err, records){
        if(err){
          reportCallback([false,null]);
        }else{
          reportCallback([true,report]);
        }
      });
    });
  }
};
