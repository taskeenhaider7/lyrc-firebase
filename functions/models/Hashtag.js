module.exports = {
  addHashtags:function(hashtags,callback){
    let newHash = hashtags.map((item)=>{
        let name = item;
        if(item !== "#"){
            name = item.charAt(0) === '#' ? item.substring(1): item;
        }
        return {
            value: item,
            name: name
        };
    });
    MongoClient.connect(url, function(err, db) {
        db.collection("hashtags").createIndex( { "name": 1 }, { unique: true } );
        db.collection("hashtags").insertMany(newHash, { ordered: false })
            .then(records=>{
                callback(false,records);
                db.close();
            })
            .catch(err =>{
                callback(true,null);
                db.close();
            });
    });
  },
  getHashtagsByWord: function(word, callback){
    /*MongoClient.connect(url, function(err, db) {
        let query = {
            name : { $regex: new RegExp('.*'+word+'.*',"i") }
        };
        db.collection("hashtags").find(query).limit(10).toArray(function(err, result){
            if(err){
                console.log("error to find hashtags by word");
                console.log(err);
                callback(true, null);
                db.close();
            }else{
                console.log("result to find hashtags by word");
                console.log(result);
                callback(false, result);
                db.close();
            }
        });
    });*/
  },
  getPostByHashtags: function(user, hashtag, page, perPage, callback){
    let blocked_list    = [];
    let blocked_by_list = [];
    if (user.hasOwnProperty("block_list")){
      blocked_list = user.block_list;
    }
    if (user.hasOwnProperty("blocked_by")){
      blocked_by_list = user.blocked_by;
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    let full_blocked_list = blocked_list.concat(blocked_by_list);
    full_blocked_list.filter(onlyUnique);
    /*MongoClient.connect(url, function(err, db) {
        let query = {
            "$and":[
                {
                    hashtags: hashtag
                },
                {
                    "uid": {
                        "$nin": full_blocked_list
                    }
                }
            ]
        };
        db.collection("fotes").find(query).sort({"creation_date": -1}).skip((perPage * page) - perPage).limit(perPage).toArray(function(err, result){
            if(err){
                console.log("error to find fotes by hashtags");
                console.log(err);
                callback(true, null);
                db.close();
            }else{
                console.log("result to find fotes by hashtags");
                console.log(result);
                callback(false, result);
                db.close();
            }
        });
    });*/
  }
}
