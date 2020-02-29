const FotesNotifications = require('./FotesNotifications');
const queries = require('../database/queries.js');

module.exports = {
    notifyUserIsTagged: function (admin, senderUser, username) {

        const _data = {"type": "TAGGED"};
        const options = [{key: "username", operator: '==', value: username}];
        queries.getByCondition("users", options).then(docs => {
            if (!docs.empty) {
                docs.data.toArray(function (err, results) {
                    if (results.length > 0) {
                        if (results[0].hasOwnProperty("notification_token")) {
                            const _notification_token = results[0].notification_token;
                            //
                            const _body = senderUser.username + " tagged you in a Post!";

                            const message = {
                                notification: {
                                    body: _body,
                                    title: "Fotes",
                                },
                                data: _data,
                                token: _notification_token
                            };
                            if (senderUser.uid !== results[0].uid) {
                                // Send a message to the device corresponding to the provided
                                // registration token.
                                admin.messaging().send(message)
                                    .then((response) => {
                                        // Response is a message ID string.
                                        console.log('Successfully sent message:', response);
                                    })
                                    .catch((error) => {
                                        console.log('Error sending message:', error);
                                    });
                            }

                        }
                    }

                    //
                });
            }
        });
    },
    notifyEvent: function (admin, senderUser, username, _message) {
        _data = _message;
        _data["creation_date"] = String(_data["creation_date"]);
        _data["type"] = "EVENT";


        const options = [{key: "username", operator: '==', value: username}];
        queries.getByCondition("users", options).then(docs => {
            if (!docs.empty) {
                docs.data.toArray(function (err, results) {
                    if (results.length > 0) {
                        if (results[0].hasOwnProperty("notification_token")) {
                            _notification_token = results[0].notification_token;
                            _body = senderUser.username + "  is {interaction}  to join your event.";

                            _body = _body.replace("{interaction}", _message["interaction"]);

                            const message = {
                                notification: {
                                    body: _body,
                                    title: "Fotes",
                                },
                                data: _data,
                                token: _notification_token
                            };
                            console.log(_notification_token);
                            if ((senderUser.uid !== results[0].uid) && (_message["interaction"] !== "not_going")) {
                                // Send a message to the device corresponding to the provided
                                // registration token.
                                admin.messaging().send(message)
                                    .then((response) => {
                                        // Response is a message ID string.
                                        console.log('Successfully sent message:', response);
                                    })
                                    .catch((error) => {
                                        console.log('Error sending message:', error);
                                    });
                            }

                        }
                    }

                    //
                });
            }
        });
    },
    notifyDM: function (admin, senderUser, username, _message) {
        _data = _message;
        _data["creation_date"] = String(_data["creation_date"]);
        _data["type"] = "DM";
        _data["media"] = String(_data["media"]);
        _data["thumbnails"] = String(_data["thumbnails"]);
        _aps = {"alert": "", "badge": "1", "sound": "default"};


        const options = [{key: "username", operator: '==', value: username}];
        queries.getByCondition("users", options).then(docs => {

            if (docs.empty) {
                docs.data.toArray(function (err, results) {
                    if (results.length > 0) {
                        if (results[0].hasOwnProperty("notification_token")) {
                            _notification_token = results[0].notification_token;
                            //
                            _body = senderUser.username + ": " + _message.message;

                            const message = {
                                notification: {
                                    body: _body,
                                    title: "Lyrc",
                                },
                                apns: {payload: {aps: {badge: 1}}},
                                data: _data,
                                token: _notification_token
                            };

                            if (senderUser.uid !== results[0].uid) {
                                // Send a message to the device corresponding to the provided
                                // registration token.
                                try {
                                    admin.messaging().send(message)
                                        .then((response) => {
                                            // Response is a message ID string.
                                            console.log('Successfully sent message:', response);
                                        })
                                        .catch((error) => {
                                            console.log('Error sending message:', error);
                                        });
                                } catch (ex) {
                                    console.log(ex)
                                }
                            }

                        }
                    }

                    //
                });
            }

        });
    },
    notifyLike: function (admin, senderUser, foteId) {

        const _data = {"type": "LIKE"};
        const _body = senderUser.username + " liked your Post!";

        queries.getRecordByDocumentId("fotes", foteId).then(fote => {

            if (!fote.empty) {
                queries.getRecordByDocumentId("users", fote.uid).then(user => {

                    try {
                        _notification_token = user[0].data.notification_token;
                        const message = {
                            notification: {
                                body: _body,
                                title: "Lyrc",
                            },
                            data: _data,
                            token: _notification_token
                        };
                        if (senderUser.uid !== user[0].data.uid) {
                            // sned FotesNotification
                            _receiverUid = user[0].data.uid;
                            _senderUid = senderUser.uid;

                            FotesNotifications.addNotification(_receiverUid, _senderUid, "LIKE", foteId, {});
                            // Send a message to the device corresponding to the provided
                            // registration token.
                            admin.messaging().send(message)
                                .then((response) => {
                                    // Response is a message ID string.
                                    console.log('Successfully sent message:', response);
                                })
                                .catch((error) => {
                                    console.log('Error sending message:', error);
                                });
                        }
                    } catch (ex) {
                        console.log(ex);
                        //do nothing
                    }

                })
            }

        });

    },
    notifyFollow: function (admin, senderUser, following_user_id) {

        const _data = {"type": "FOLLOW"};
        const _body = senderUser.username + " started following you.";

        const options = [{key: "username", operator: '==', value: username}];
        queries.getByCondition("users", options).then(docs => {

            if (!docs.empty) {
                try {
                    _notification_token = docs[0].data.notification_token;
                    const message = {
                        notification: {
                            body: _body,
                            title: "Lyrc",
                        },
                        data: _data,
                        token: _notification_token
                    };
                    if (senderUser.uid !== docs[0].data.uid) {
                        // sned FotesNotification
                        _receiverUid = docs[0].data.uid;
                        _senderUid = senderUser.uid;

                        FotesNotifications.addNotification(_receiverUid, _senderUid, "FOLLOW", null, {});
                        // Send a message to the device corresponding to the provided
                        // registration token.
                        admin.messaging().send(message)
                            .then((response) => {
                                // Response is a message ID string.
                                console.log('Successfully sent message:', response);
                            })
                            .catch((error) => {
                                console.log('Error sending message:', error);
                            });
                    }
                } catch (ex) {
                    console.log(ex);
                }

            }
        });
    },
    notifyComment: function (admin, senderUser, foteId, commentText) {
        const _data = {"type": "COMMENT"};
        let _body = senderUser.username + " commented: '{%c}'";
        _body = _body.replace("{%c}", commentText);


        queries.getRecordByDocumentId("fotes", foteId).then(fote => {

            if (!fote.empty) {
                queries.getRecordByDocumentId("users", fote.uid).then(user => {

                    try {
                        _notification_token = user[0].data.notification_token;
                        const message = {
                            notification: {
                                body: _body,
                                title: "Fotes",
                            },
                            data: _data,
                            token: _notification_token
                        };
                        if (senderUser.uid !== user[0].data.uid) {
                            // Send a message to the device corresponding to the provided
                            // registration token.
                            const _receiverUid = user[0].data.uid;
                            const _senderUid = senderUser.uid;

                            FotesNotifications.addNotification(_receiverUid, _senderUid, "COMMENT", foteId, {"comment": commentText});

                            admin.messaging().send(message)
                                .then((response) => {
                                    // Response is a message ID string.
                                    console.log('Successfully sent message:', response);
                                })
                                .catch((error) => {
                                    console.log('Error sending message:', error);
                                });
                        }


                    } catch (ex) {
                        console.log(ex);
                        //do nothing
                    }

                });
            }
        });

    },
    notify: function (admin, registrationToken, text) {
        const message = {
            notification: {
                body: text,
                title: "Fotes",
            },
            token: "eXFR56_0IjM:APA91bEQQHpesG6dJqL2GIFigGTZCF7Ffy9o0M19jqFX24i93H8K8y0xlTYakzR-8djJ2LGywNgBGbWJPDwH7So_QNJMZieRaG4U69YZ8sXmnm2s-eJWkbHJxequeBD6ZNfWefGoJi6p"
        };

        // Send a message to the device corresponding to the provided
        // registration token.
        admin.messaging().send(message)
            .then((response) => {
                // Response is a message ID string.
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.log('Error sending message:', error);
            });

    }
};
