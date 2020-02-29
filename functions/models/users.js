const fs = require('fs');
const jwt = require('jsonwebtoken');
// bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

const Cookies = require('./cookies');


const queries = require('../database/queries.js');

self = module.exports = {
    getUserByEmail: function (email, callback) {

        const options = [{key: 'email', operator: '==', value: email}];
        queries.getByCondition('users', options).then((result) => {
            return (result.empty) ? callback(true, "User not found") : callback(false, result[0]);
        }).catch(() => {
            return callback(true, "Internal Server Error");
        });
    },
    changePassword: function (email, password, callback) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(password, salt, function (err, hash) {


                const options = [{key: 'email', operator: '==', value: email}];
                const data = {password: hash, source: "fotes.co"};

                queries.updateByCondition("users", options, data).then(() => {
                    queries.deleteByCondition("password_reset_requests", options).then(() => {
                        callback(false, docs);
                    }).catch(error => {
                        callback(true, "Internal Server Error");
                    })

                }).catch(error => {
                    throw error;
                });

            });
        });
    },


    /******************************************************************NOT FIXED START*****************************************************/
    saveRequestPassword: function (item, callback) {


        const options = [{key: "email", operator: '==', value: item.email}];
        const data = {"email": 1};

        queries.add(data).catch(error => {
            console.log("Some thing went wrong", error);
        });


        /*MongoClient.connect(url, function (err, db) {
            let updateQuery = {"email": item.email};
            db.collection("password_reset_requests").createIndex({"email": 1}, {unique: true})
            db.collection("password_reset_requests").updateOne(updateQuery, item, {upsert: true}, function (err, docs) {
                if (err) {
                    callback(true, "Internal Server Error");
                } else {
                    callback(false, item)
                }
            });
        });*/
    },
    /******************************************************************NOT FIXED END*****************************************************/


    verifyTokenRecoverPassword: function (token, callback) {
        const options = [{key: 'token', operator: '==', value: token}];

        queries.getByCondition("password_reset_requests", options).then((results) => {

            return results.empty ? callback(true, "Invalid token") : callback(false, results[0]);

        }).catch(() => {
            callback(true, "Internal Server Error");
        });
    },
    getUserById: function (user_id, return_callback) {

        const options = [{key: 'uid', operator: '==', value: user_id}];
        queries.getByCondition("users", options).then((results) => {

            return_callback(results[0]);

        })
    },
    getUserByIdProfile: function (user_id, return_callback) {

        const options = [{key: 'uid', operator: '==', value: user_id}];

        queries.getByCondition("users", options).then((results) => {

            return_callback(results[0]);

        });
    },
    getUserByFbId: function (fb_id, return_callback) {

        const options = [{key: 'fb_id', operator: '==', value: fb_id}];

        queries.getByCondition("users", options).then((results) => {

            results.empty ? return_callback(null) : return_callback(results[0]);

        });
    },
    create: function (user, create_callback) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(user.password, salt, function (err, hash) {
                // Store hash in your password DB.
                const _cd = Date.now();
                user["password"] = hash;
                user["creation_date"] = _cd;
                user["username"] = user["username"].toLowerCase();

                // check if the user exists

                const options = [{key: 'email', operator: '==', value: user.email}];

                queries.getByCondition('users', options).then((results) => {

                    if (results.empty) {

                        const userNameQueryOptions = [{key: 'username', operator: '==', value: user.username}];
                        queries.getByCondition('users', userNameQueryOptions).then((snapshot) => {

                            if (snapshot.empty) {

                                queries.add('users', user).then(() => {

                                    queries.updateByCondition('users', options, {"uid": user._id.toString()}).then(() => {
                                        create_callback([true]);
                                    }).catch(() => {
                                        create_callback([false]);
                                    })

                                }).catch(() => {
                                    create_callback([false]);
                                })

                            } else {
                                create_callback([false, {"error": "Username is already taken."}]);
                            }

                        }).catch(() => {
                            create_callback([false]);
                        })
                    } else {
                        create_callback([false, {"error": "Email is already used."}]);
                    }

                }).catch(() => {
                    create_callback([false, {"error": "Service unavailable"}]);
                });

            });
        });
    },
    login: function (email, pwd, login_callback) {
        //check if credentials match

        const options = [{key: 'email', operator: '==', value: email}, {
            key: 'source',
            operator: '==',
            value: 'fotes.co'
        }];

        queries.getByCondition("users", options).then((results) => {

            if (results.empty) {
                login_callback([false, {"reason": "Invalid email."}]);
            } else {
                bcrypt.compare(pwd, results[0].password, function (err, res) {
                    if (!res) {
                        login_callback([false, {"reason": "Invalid password."}]);
                    } else {
                        //  create jwt
                        token = jwt.sign({
                            exp: Math.floor(Date.now() / 1000),
                            data: results[0].uid
                        }, 'secret');

                        //save token in cookies collection so the user can login
                        function cookie_callback(cre) {
                            //send it all back to main
                            login_callback([true, {"reason": "Password valid"}, token]);
                        }


                        module.exports.update_last_seen(results[0].uid);
                        Cookies.setCookie(results[0].uid, token, cookie_callback);

                    }
                });
            }

        }).catch(() => {
            login_callback([false]);
        });
    },
    loginFb: function (fb_id, login_callback) {
        //check if credentials match
        const options = [{key: 'fb_id', operator: '==', value: fb_id}, {
            key: 'source',
            operator: '==',
            value: 'facebook.com'
        }];

        queries.getByCondition("users", options).then((results) => {

            if (results.empty) {
                login_callback([false, {"reason": "Invalid Facebook Login"}]);
            } else {

                const token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000),
                    data: results[0].uid
                }, 'secret');

                //save token in cookies collection so the user can login
                function cookie_callback(cre) {
                    //send it all back to main
                    login_callback([true, {"reason": "Fb Login Valid"}, token]);
                }

                Cookies.setCookie(results[0].uid, token, cookie_callback);

            }

        }).catch(() => {

        });
    },


    /******************************************************************NOT FIXED START*****************************************************/
    search: function (username, user, results_callback) {
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
        console.log("USERSEARCH" + user);
        /*MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            query = {
                "$and": [
                    {"username": new RegExp(username, 'i')},
                    {"uid": {"$ne": user.uid}},
                    {"uid": {"$nin": _full_blocked_list}}
                ]


            }
            fields = {"email": 0, "password": 0, "_id": 0}
            db.collection("users").find(query, fields).limit(20).toArray(function (err, result) {
                if (err) throw err;
                //console.log("->"+result);
                // res.json(result);-
                results_callback(result);
                db.close();
            });


        });*/
    },
    /******************************************************************NOT FIXED END*****************************************************/


    checkEmail: function (email, results_callback) {
        const options = [{key: 'email', operator: '==', value: email}];

        queries.getByConditionAndLimit("users", options, 10).then((results) => {

            results_callback(results.length);

        }).catch(error => {
            throw error;
        });

    },
    saveTokenEmailVerification: function (uid, token, update_callback) {

        const options = [{key: 'users', operator: '==', value: uid}];
        const data = {"token_email_verification": token};
        queries.updateByCondition("users", options, data).then((results) => {
            return update_callback(false, "Token saved");
        }).catch(() => {
            return update_callback(true, "Error");
        });
    },
    verifyTokenEmail: function (token, update_callback) {

        const options = [{key: 'token_email_verification', operator: '==', value: token}];

        queries.updateByCondition("users", options, {"is_account_verified": true}).then(results => {
            return update_callback(false, "Account verified");
        }).catch(error => {
            return update_callback(true, "Error");
        });
    },
    checkUsername: function (username, results_callback) {
        const options = [{key: 'username', operator: '==', value: username}];
        queries.getByConditionAndLimit("users", options, 10).then(results => {

            results_callback(results.length);

        }).catch(error => {
            throw error;
        });
    },


    /******************************************************************NOT FIXED START*****************************************************/
    followers: function (uid, results_callback) {
        _queryFollowers = [
            {
                "$match":
                    {
                        "uid": {"$in": []}
                    }
            },
            {
                "$project": {
                    "email": 0,
                    "password": 0,
                    "notification_token": 0

                }
            }
        ];
        /*MongoClient.connect(url, function (err, db) {
            //Delete function
            Array.prototype.remove = function () {
                var what, a = arguments, L = a.length, ax;
                while (L && this.length) {
                    what = a[--L];
                    while ((ax = this.indexOf(what)) !== -1) {
                        this.splice(ax, 1);
                    }
                }
                return this;
            };
            //Delete function over
            query = {"uid": uid}
            fields = {"password": 0, "_id": 0}
            db.collection("users").find(query, fields, function (err, docs) {
                if (!err) {
                    docs.toArray(function (err, results) {
                        if (results.length == 0) {
                            results_callback([])
                        } else if (results[0].followers == null) {
                            results_callback([])
                        } else {
                            _followers = results[0].followers;
                            //obtain blockedlist and reduce followers list
                            user = results[0];
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


                            _full_blocked_list.forEach(function (b) {
                                _i = _followers.indexOf(b);
                                if (_i != -1) {
                                    _followers.splice(_i, 1); //remove users that are blocked
                                }
                            });

                            _queryFollowers[0]["$match"]["uid"]["$in"] = _followers;

                            db.collection("users").aggregate(_queryFollowers, function (err, fdocs) {
                                results_callback(fdocs)
                            });

                        }
                    });
                }
            });

        });*/
    },

    following: function (uid, results_callback) {
        _queryFollowing = [
            {
                "$match":
                    {
                        "followers": {"$in": [uid]}
                    }
            },
            {
                "$match":
                    {
                        "block_list": {"$nin": [uid]}
                    }
            },
            {
                "$match":
                    {
                        "blocked_by": {"$nin": [uid]}
                    }
            },
            {
                "$project": {
                    "email": 0,
                    "password": 0,
                    "notification_token": 0

                }
            }
        ];
        /*MongoClient.connect(url, function (err, db) {
            db.collection("users").aggregate(_queryFollowing, function (err, fdocs) {
                results_callback(fdocs)
            });

        });*/
    },

    /******************************************************************NOT FIXED END*****************************************************/

    //update user photo
    update_photo: function (user_id, photo, update_callback) {
        const options = [{key: 'uid', operator: '==', value: user_id}];
        queries.updateByCondition("users", options, {"photo": photo}).then(results => {
            return update_callback("Profile photo updated");
        });
    },

    //update user photo
    update_description: function (user_id, photo, update_callback) {
        const options = [{key: 'uid', operator: '==', value: user_id}];
        queries.updateByCondition("users", options, {"description": photo}).then(results => {
            return update_callback("Description updated");
        });
    },

    //update user photo
    update_last_seen: function (user_id) {

        const options = [{key: 'uid', operator: '==', value: user_id}];
        queries.updateByCondition("users", options, {"last_seen": Date.now()}).catch(error => {
            console.log(error);
        });
    },

    //update user photo
    update_token: function (user_id, token, update_callback) {
        const options = [{key: 'uid', operator: '==', value: user_id}];

        queries.updateByCondition("users", options, {"notification_token": token}).then(() => {
            return update_callback("Notification token updated");
        });
    },

    //follow
    follow: function (user_id, follower_uid, follow_callback) {

        const options = [{key: 'uid', operator: '==', value: user_id}];

        queries.updateByCondition("users", options, {"followers": follower_uid}).then(() => {
            return follow_callback(true);
        });
    },

    //follow
    unfollow: function (user_id, follower_uid, follow_callback) {

        const options = [{key: 'uid', operator: '==', value: user_id}];

        queries.updateByCondition("users", options, {"followers": follower_uid}).then(() => {
            return follow_callback(true);
        });
    },
    // BLOCK // UNBLOCK
    block: function (user_id, block_uid, block_callback) {

        const query = [{key: '_id', operator: '==', value: new ObjectID(user_id)}];
        const query2 = [{key: '_id', operator: '==', value: new ObjectID(block_uid)}];

        queries.updateByCondition("users", query, {"block_list": block_uid}).then(() => {

            queries.updateByCondition("users", query2, {"blocked_by": user_id}).then(() => {

                block_callback(true);

            }).catch(() => {
                block_callback(false);
            });

        }).catch(() => {
            block_callback(false);
        });
    },
    unblock: function (user_id, block_uid, block_callback) {
        /*query = {"_id": new ObjectID(user_id)};
        query2 = {"_id": new ObjectID(block_uid)};*/


        const query = [{key: '_id', operator: '==', value: new ObjectID(user_id)}];
        const query2 = [{key: '_id', operator: '==', value: new ObjectID(block_uid)}];

        queries.updateByCondition("users", query, {"block_list": block_uid}).then(() => {

            queries.updateByCondition("users", query2, {"blocked_by": user_id}).then(() => {

                block_callback(true);

            }).catch(() => {
                block_callback(false);
            });

        }).catch(() => {
            block_callback(false);
        });


        /*MongoClient.connect(url, function (err, db) {
            db.collection("users").update(query, {"$pull": {"block_list": block_uid}}, function (err, records) {
                if (err) {
                    block_callback(false);
                } else {
                    db.collection("users").update(query2, {"$pull": {"blocked_by": user_id}}, function (err, records) {
                        if (err) {
                            block_callback(false);
                        } else {
                            block_callback(true);

                        }
                    });
                }
            });
        });*/
    },
    get_blocked_list: function (uid, results_callback) {
        _queryBlocked = [
            {
                "$match":
                    {
                        "uid": {"$in": []}
                    }
            },
            {
                "$project": {
                    "email": 0,
                    "password": 0,
                    "notification_token": 0

                }
            }
        ]
        /*MongoClient.connect(url, function (err, db) {
            query = {"uid": uid}
            fields = {"password": 0, "_id": 0, "blocked_by": 0}
            db.collection("users").find(query, fields, function (err, docs) {
                if (!err) {
                    docs.toArray(function (err, results) {
                        if (results.length == 0) {
                            results_callback([])
                        } else if (results[0].block_list == null) {
                            results_callback([])
                        } else {
                            _queryBlocked[0]["$match"]["uid"]["$in"] = results[0].block_list;
                            db.collection("users").aggregate(_queryBlocked, function (err, bdocs) {
                                results_callback(bdocs)
                            });

                        }
                    });
                }
            });

        });*/
    },


}
