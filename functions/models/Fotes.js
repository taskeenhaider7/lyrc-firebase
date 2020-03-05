const queries = require('../database/queries.js');
module.exports = {
    getLatestPosition: function (uid, position_callback) {

        queries.getRecordByDocumentId("fotes", uid).then(docs => {
            if (!docs.empty) {

                docs.forEach(doc=>{
                    try {
                        _city =doc.data().place.name;
                        position_callback(_city);
                    } catch (ex) {
                        position_callback("");
                    }
                });

            } else {
                position_callback("");
            }

        }).catch(() => {
            position_callback("");
        });
    },
    addLike: function (idFote, userId, addLike_callback) {

        const data = {
            likes_by: fireStore.FieldValue.arrayUnion(userId)
        };

        queries.updateByDocumentId("fotes", idFote, data).then(docs => {

            if (!docs.empty) {
                _jp = JSON.parse(JSON.stringify(docs[0].data));
                _nModified = _jp.nModified;
                addLike_callback([true, idFote, _nModified]);
            } else {
                addLike_callback([false, null, 0]);
            }

        }).catch(() => {
            addLike_callback([false, null, 0]);
        });
    },
    removeLike: function (idFote, userId, removeLike_callback) {

        const pullData = {
            'likes_by': fireStore.FieldValue.arrayRemove({
                userId
            })
        };
        queries.updateByDocumentId("fotes", idFote, pullData).then(() => {
            removeLike_callback([true, idFote]);
        }).catch(() => {
            removeLike_callback([false, null]);
        });
    },
    create: function (fote, create_callback) {

        queries.add("fotes", fote).then(() => {
            create_callback([true, fote]);
        }).catch(() => {
            create_callback([false, null]);
        });
    },
    getFoteInfo: function (fote_id, return_callback) {
        queries.getRecordByDocumentId("fotes", fote_id).then(fote => {

            if (!fote.empty) {
                queries.getRecordByDocumentId("users", fote.uid).then(user => {

                    const foteData = fote[0].data;
                    const userData = user[0].data;

                    const result = foteData.concat(userData);

                    return_callback(result);
                })
            }
        });
    },
    getFoteInfoWithUid: function (fote_id, uid, return_callback) {
        /*query = [
            {
                "$match": {
                    "_id": new ObjectID(fote_id),
                    "uid": uid
                },
            },
            {
                "$lookup": {
                    from: "users",
                    localField: "uid",
                    foreignField: "uid",
                    as: "creator_user"
                }
            },
            {
                "$project": {
                    "creator_user.password": 0,
                    "creator_user.email": 0,
                    "creator_user.notification_token": 0
                }
            }


        ];



        MongoClient.connect(url, function (err, db) {
            db.collection("fotes").aggregate(query, function (err, docs) {
                if (!err) {
                    return_callback(docs);
                }
            });

        });*/
    },
    createIndex: function () {
        // create 2D index
        /*MongoClient.connect(url, function (err, db) {
            function indexCallback(err, name) {
            }

            db.createIndex("fotes", {"location_index": "2d"}, indexCallback);
        });*/
    },
    getFotesByPlaceId: function (place_id, return_callback) {
        /*_query = [
            {
                "$match":
                    {"place.place_id": place_id}
            },
            {
                "$lookup":
                    {
                        from: "users",
                        localField: "uid",
                        foreignField: "uid",
                        as: "user"
                    }

            },
            {
                "$project": {
                    "user.password": 0,
                    "user.email": 0,
                }
            }


        ];


        MongoClient.connect(url, function (err, db) {
            db.collection("fotes").aggregate(_query, function (err, docs) {
                if (!err) {
                    return_callback(docs)
                } else {
                    return_callback([])

                }
            });

        });*/

    },
    getFotesByUserId: function (uid, return_callback) {
        /*_queryFotesByUserId = [
            {
                "$match":
                    {"uid": uid}
            },
            {
                "$lookup":
                    {
                        from: "users",
                        localField: "uid",
                        foreignField: "uid",
                        as: "user"
                    }

            },
            {
                "$project": {
                    "user.password": 0,
                    "user.email": 0,
                }
            }


        ];
        console.log(_query);
        MongoClient.connect(url, function (err, db) {
            db.collection("fotes").aggregate(_queryFotesByUserId, function (err, docs) {
                console.log(err)
                if (!err) {
                    return_callback(docs)
                } else {
                    return_callback([])

                }
            });

        });*/
    },
    isOwnFote: function (fote_id, uid, return_callback) {
        /*query = {"uid": uid, "_id": new ObjectID(fote_id)};
        MongoClient.connect(url, function (err, db) {
            db.collection("fotes").find(query).toArray(function (err, result) {
                if (result.length == 1) {
                    return_callback(true);
                } else {
                    return_callback(false);

                }
            })
        });*/

    },
    getFote: function (fote_id, return_callback) {


        /*query = [
            {
                "$match": {
                    "_id": new ObjectID(fote_id)
                },
            },
            {
                "$lookup": {
                    from: "comments",
                    localField: "_id",
                    foreignField: "fote_id",
                    as: "comments"
                }
            },
            {
                "$unwind": {
                    path: "$comments"
                }
            },
            {
                "$lookup": {
                    from: "users",
                    localField: "comments.uid",
                    foreignField: "_id",
                    as: "user"
                }

            },
            {
                "$project": {
                    "user.password": 0,
                    "user.email": 0,
                    "user.notification_token": 0
                }
            }
        ];
        MongoClient.connect(url, function (err, db) {
            db.collection("fotes").aggregate(query, function (err, docs) {
                if (!err) {
                    return_callback(docs);
                }
            });

        });*/

    },
    feed: function (user, following_list, return_callback) {
        /*following_list.push("5c1252baa42cb27b658e2641");
        following_list.push(user.uid);

        _blocked_list = []
        _blocked_by_list = []
        if (user.hasOwnProperty("block_list")) {
            _blocked_list = user.block_list;
        }
        if (user.hasOwnProperty("blocked_by")) {
            _blocked_by_list = user.blocked_by;
        }

        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }

        _full_blocked_list = _blocked_list.concat(_blocked_by_list);
        _full_blocked_list.filter(onlyUnique);

        query = [
            {
                "$match":
                    {
                        "uid": {"$in": following_list},
                    }
            },
            {
                "$match":
                    {
                        "uid": {"$nin": _full_blocked_list},
                    }
            },

            {
                "$lookup":
                    {
                        from: "users",
                        localField: "uid",
                        foreignField: "uid",
                        as: "user"
                    }

            },
            {
                "$lookup":
                    {
                        from: "comments",
                        localField: "_id",
                        foreignField: "fote_id",
                        as: "comments",
                    }

            },
            {
                "$unwind": {
                    "path": "$comments",
                    "preserveNullAndEmptyArrays": true

                }
            },
            {
                "$lookup":
                    {
                        from: "users",
                        localField: "comments.uid",
                        foreignField: "_id",
                        as: "comments_user",
                    }

            },
            {
                "$project": {
                    "_id": 1,
                    "uri": 1,
                    "note": 1,
                    "date": 1,
                    "backgroundColor": 1,
                    "location": 1,
                    "hashtags": 1,
                    "thumbnail": 1,
                    "audio_caption": 1,
                    "is_public": 1,
                    "place": 1,
                    "user_tags": 1,
                    "media": 1,
                    "thumbnails": 1,
                    "creation_date": 1,
                    "uid": 1,
                    "location_index": 1,
                    "likes_by": 1,
                    "type": 1,
                    "activity": 1,
                    "user._id": 1,
                    "user.name": 1,
                    "user.username": 1,
                    "user.description": 1,
                    "user.source": 1,
                    "user.creation_date": 1,
                    "user.uid": 1,
                    "user.photo": 1,
                    "user.notification_token": 1,
                    "user.followers": 1,
                    "comments": 1,
                    "comments_user": 1,
                    "comments_with_user": 1,
                    "font": 1,
                    "fontIndex": 1,
                    "metrics": 1,
                    "is_following":
                        {

                            "$in": ["$uid", following_list]

                        }
                }
            }


        ];
        console.log(JSON.stringify(query));
        MongoClient.connect(url, function (err, db) {

            db.collection("fotes").aggregate(query, function (err, docs) {
                console.log(err);
                if (!err) {
                    _result = {}
                    docs.forEach(function (fote) {
                        if (_result[fote._id] == null) {
                            _result[fote._id] = fote;
                            _c = fote.comments;
                            if (_result[fote._id].comments_user[0] != null) {
                                _c["username"] = fote.comments_user[0].username;
                                _c["name"] = fote.comments_user[0].name;
                                _result[fote._id]["comments_with_user"] = [_c];
                            } else {
                                _result[fote._id]["comments_with_user"] = [];
                            }
                        } else {
                            if (_result[fote._id].comments_user[0] != null) {
                                _c["username"] = fote.comments_user[0].username;
                                _c["name"] = fote.comments_user[0].name;
                                _result[fote._id]["comments_with_user"].push(_c);
                            }
                        }
                    });
                    _resultArray = [];
                    _keys = Object.keys(_result);
                    _keys.forEach(function (k) {
                        _resultArray.push(_result[k]);
                    })
                    return_callback(_resultArray);
                }
            });

        });*/
    },
    delete: function (foteId, uid, delete_callback) {
        /*MongoClient.connect(url, function (err, db) {
            _searchQuery = {
                "_id": ObjectID(foteId),
                "uid": uid
            }

            db.collection("fotes").deleteOne(_searchQuery,
                function (err, records) {
                    err ? delete_callback(false) : delete_callback(true);

                });
        });*/
    }
};
