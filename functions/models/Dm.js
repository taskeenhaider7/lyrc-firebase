const FCM = require('./FCM');
const queries = require('../database/queries.js');

self = module.exports = {

    getConversations: function (user, conversations_callback) {

        let _blocked_list = [];
        let _blocked_by_list = [];
        if (user.hasOwnProperty("block_list")) {
            _blocked_list = user.block_list;
        }
        if (user.hasOwnProperty("blocked_by")) {
            _blocked_by_list = user.blocked_by;
        }

        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }

        const _full_blocked_list = _blocked_list.concat(_blocked_by_list);
        _full_blocked_list.filter(onlyUnique);

        //const options = [{key: 'email', operator: '==', value: email}];
        queries.getByCondition("dms", [{key: 'participants', operator: 'array-contains', value: user.uid}])
            .then(snapshort => {

                if (!snapshort.empty) {

                    const docs = snapshort.filter(r => _full_blocked_list.indexOf(p) >= 0);
                    docs.forEach(d => {
                        let _last_msg = "";
                        let last_message_time = "";
                        d.messages.forEach(function (m) {
                            if (m.uid !== user.uid) {
                                _last_msg = m.message;
                                last_message_time = m.creation_date;
                            }
                            last_message_time = m.creation_date;
                        });
                        d["last_message"] = _last_msg;
                        d["last_message_time"] = last_message_time;


                    });

                    docs.sort(function compare(a, b) {
                        if (!a.last_message_time || !b.last_message_time) return 0;
                        if (a.last_message_time > b.last_message_time)
                            return -1;
                        if (a.last_message_time < b.last_message_time)
                            return 1;
                        return 0;
                    });

                    conversations_callback(docs);
                }

            }).catch(error => {
            console.log(error);
        });
    },
    getConversation: function (uid, conversationID, conversations_callback) {

        const query = [{key: 'participants', operator: 'array-contains', value: uid}];

        queries.getRecordByDocumentIdAndCondition("dms", conversationID, query)
            .then(docs => {
                conversations_callback(docs);
            })
            .catch(error => {
                console.log(error);
            });
    },
    create: function (userA, userB, create_callback) {

        uidA = userA.uid;
        uidB = userB.uid;
        console.log("uidA");
        console.log(uidA);
        _blocked_list = [];
        _blocked_by_list = [];
        if (userB.hasOwnProperty("block_list")) {
            _blocked_list = userB.block_list;
        }
        if (userA.hasOwnProperty("blocked_by")) {
            _blocked_by_list = userB.blocked_by;
        }

        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }

        _full_blocked_list = _blocked_list.concat(_blocked_by_list);
        _full_blocked_list.filter(onlyUnique);
        if (_full_blocked_list.includes(userA.uid)) {
            create_callback({"dmCreated": false, "dmId": null})
        } else {
            const _saveQuery = {
                "creator_id": uidA,
                "creation_date": Date.now(),
                "participants": [uidA, uidB],
                "messages": []
            };
            const query = [{key: 'participants', operator: 'array-contains', value: uidA},
                {key: 'participants', operator: 'array-contains', value: uidB}];
            queries.getByCondition("dms", query).then(docs => {

                if (!docs.empty) {

                    queries.add("dms", _saveQuery).then(doc => {
                        create_callback({"dmCreated": true, "dmId": doc.id})
                    }).catch(error => {
                        create_callback({"dmCreated": false, "dmId": null})
                    });

                } else {
                    create_callback({"dmCreated": false, "dmId": docs[0]._id})
                }

            }).catch(error => {

            });

        }

    },
    sendMessage: function (dmid, message, message_callback) {

        message["creation_date"] = Date.now();
        const data = {
            messages: fireStore.FieldValue.arrayUnion(message)
        };

        queries.updateByDocumentId(data).then(() => {
            console.log(dmid);
            return message_callback(message);
        });

    },
    deleteMsg: function (dmid, uid, timestamp, delete_callback) {

        const data = {
            messages: fireStore.FieldValue.arrayRemove({
                "creation_date": parseFloat(timestamp)
            })
        };

        queries.updateByDocumentId(data).then(() => {
            return delete_callback(true);
        }).catch(() => {
            delete_callback(false);
        });

    },


    //********************DOUBLE CHECK THIS FUNCTIONALITY*************************//
    deleteConversation: function (uid, dmid, delete_callback) {

        const option = [{key: "_id", operator: '==', value: new ObjectID(dmid)}];
        queries.deleteByCondition('dms', option).then(() => {
            return delete_callback(true);
        }).catch(() => {
            return delete_callback(false)
        });

    },
    sendMessageToUid(user, userB, activity, activity_type, admin, message_callback) {
        function create_c_callback(c) {
            const _dmId = c.dmId;
            let _m = "{name} is interested in doing your {activity_type}";
            _m = _m.replace("{name}", user.name);
            _m = _m.replace("{activity_type}", activity_type);
            const message = {
                "type": "text",
                "message": _m,
                "dm_id": _dmId.toString(),
                "creation_date": Date.now(),
                "activity_type": activity.type,
                "activity_url": activity.url,
                "activity_fote_id": activity.fote_id,
                "uid": user.uid
            };
            const _message = {
                "type": "text",
                "message": _m,
                "dm_id": _dmId.toString(),
                "activity_type": activity.type,
                "activity_url": activity.url,
                "activity_fote_id": activity.fote_id,
                "uid": user.uid


            };
            message["activity"] = activity;
            self.sendMessage(_dmId, message, message_callback);
            FCM.notifyDM(admin, user, userB.username, _message)

        }

        self.create(user.uid, userB.uid, create_c_callback);
    }
};
