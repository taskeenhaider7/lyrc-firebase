const Users = require('./users');
const queries = require('../database/queries.js');
module.exports = {
    //TYPES
    // LIKE
    // COMMENT
    // FOLLOW
    addNotification: function (receiverUid, senderUid, type, content_id, notification) {
        _notification = {
            "receiver_uid": receiverUid,
            "sender_uid": senderUid,
            "type": type,
            "content_id": content_id,
            "notification": notification,
            "content_oid": new ObjectID(content_id),
            "creation_date": Date.now(),
        };
        queries.add("fotes_notifications", _notification).catch(error => {
            console.log("err:" + error);
        });
    },
    getNotifications: function (user, return_callback) {

        /*_blocked_list    = [];
      _blocked_by_list = [];
      if (user.hasOwnProperty("block_list")){
        _blocked_list = user.block_list;
      }
      if (user.hasOwnProperty("blocked_by")){
        _blocked_by_list = user.blocked_by;
      }

      function onlyUnique(value, index, self) {
          return self.indexOf(value) === index;
      }
      _full_blocked_list = _blocked_list.concat(_blocked_by_list);
      _full_blocked_list.filter(onlyUnique);
        _query = [
                           {
                              "$match":
                              {
                                  "receiver_uid":user.uid
                              }
                           },
                           {
                              "$match":
                              {
                                  "sender_uid": {
                                    "$ne":user.uid
                                  }

                              }
                           },
                           {
                              "$lookup":{
                              from:"users",
                                  localField:"sender_uid",
                                  foreignField:"uid",
                                  as:"sender_user"
                              }
                          },
                             {
                              "$lookup":{
                              from:"fotes",
                                  localField:"content_oid",
                                  foreignField:"_id",
                                  as:"fote"
                              }
                          }

                      ];
        MongoClient.connect(url, function(err, db) {
          db.collection("fotes_notifications").aggregate(_query, function (err, docs) {
            if(!err){
                return_callback(docs);
            }
            console.log(err);
          });

        });*/

    }

};
