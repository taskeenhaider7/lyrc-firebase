module.exports = {
  interact : function(foteId,uid,interaction,interaction_callback){
    /*MongoClient.connect(url, function(err, db) {
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
    });*/
  }
};
