const queries = require('../database/queries.js');

module.exports = {
    //NULL_USER: -9999999999,
    //mongodb
    setCookie: function (user_id, ftoken, return_cookie) {

        const data = {"user_id": user_id, "ftoken": ftoken, "creation_date": new Date()};
        const option = [{key: "user_id", operator: '==', value: user_id}];
        queries.getByCondition("cookies", option).then(snapshot => {

            if (snapshot._size > 0) {
                snapshot.forEach(doc => {
                    queries.updateByDocumentId("cookies", doc.id, data).then(doc => {

                        return_cookie(doc);

                    }).catch((error) => {
                        return_cookie(error);
                    });
                })
            } else {
                queries.add("cookies", data).then(snapshot => {

                    snapshot.forEach(doc=>{
                        return_cookie(doc);
                    });

                }).catch(error => {
                    return_cookie(error);
                });
            }

        }).catch(error => {
            return_cookie(error);
        });
    },

    validateCookie: function (ftoken, return_cookie) {
        if (!ftoken) {
            return_cookie([false, null, null]);
        } else {

            const option = [{key: "ftoken", operator: '==', value: ftoken}];
            queries.getByCondition("cookies", option).then(snapshot => {
                if (snapshot.empty) {
                    return_cookie([false, null, null]);
                } else {

                    const Users = require('./users');
                    snapshot.forEach(doc => {

                        const data = doc.data();
                        function user_callback(userResult) {
                            if (userResult === null) {
                                return_cookie([false, null, null]);
                            } else {
                                Users.update_last_seen(userResult.id);
                                const userData = userResult.data();
                                delete userData.password;
                                return_cookie([true, userResult.id, userData]);
                            }
                        }

                        Users.getUserById(data.user_id, user_callback);

                    });

                }

            }).catch(err => {
                console.log('Error getting documents', err);
            });

        }


    },

    invalidateCookie: function (ftoken, return_cookie) {
        const option = [{key: "ftoken", operator: '==', value: ftoken}];
        queries.deleteByCondition("cookies", option).then(() => {
            return_cookie(true);
        }).catch(() => {
            return_cookie(false);
        });
    },

    isUserLoggedIn: function (user_id, callback) {

        const option = [{key: "user_id", operator: '==', value: user_id}];
        queries.getByCondition("cookies", option).then(result => {

            result.empty ? callback(false) : callback(true);

        }).catch(error => {
            callback(false);
        });
    }


};
