const queries = require("../database/queries");

module.exports = {
    subscribe: function (email, addSubscriberCallback) {
        subscriber = {"email": email};

        queries.add("subscribers", subscriber).then(snapshot => {
            addSubscriberCallback([true, subscriber]);
        }).catch(error => {
            addSubscriberCallback([false, null]);
        });
    }
};
