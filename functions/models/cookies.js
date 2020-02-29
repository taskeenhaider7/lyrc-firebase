const Users = require('./users');
const queries = require('../database/queries.js');


module.exports = {
    //NULL_USER: -9999999999,
    //mongodb
    setCookie: function (user_id, ftoken, return_cookie) {

        const data = {"user_id": user_id, "ftoken": ftoken, "creation_date": new Date()};
        queries.updateByCondition("cookies", [{key: "user_id", operator: '==', value: user_id}], data).catch(error => {
            console.log(error);
            return_cookie(error);
        });
    },

    validateCookie: function (ftoken, return_cookie) {

        if (!ftoken){
            return_cookie([false, null, null]);
        }else {

            const option = [{key: "ftoken", operator: '==', value: ftoken}];
            queries.getByCondition("cookies", option).then(snapshot => {
                if (snapshot.empty) {
                    return_cookie([false, null, null]);
                } else {

                    const result = snapshot[0];

                    Users.getUserById(result.user_id, (user) => {
                        if (user == null) {
                            return_cookie([false, null, null]);
                        } else {
                            Users.update_last_seen(result.user_id);
                            return_cookie([true, result.user_id, user]);
                        }
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
