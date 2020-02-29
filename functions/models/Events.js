const queries = require('../database/queries.js');

const Users = require('./users');

module.exports = {
    interact: function (foteId, uid, interaction, interaction_callback) {


        const query = [{key: 'activity.type', operator: '==', value: "event"}];
        const pullData = {
            'activity.going': fireStore.FieldValue.arrayRemove({
                uid
            }),
            'activity.not_going': fireStore.FieldValue.arrayRemove({
                uid
            }),
            'activity.interested': fireStore.FieldValue.arrayRemove({
                uid
            })
        };

        const pushData = {};
        pushData["activity." + interaction] = fireStore.FieldValue.arrayUnion(uid);

        queries.updateByDocumentIdAndCondition('fotes', query, pullData).then(() => {


            queries.updateByDocumentIdAndCondition('fotes', query, pushData).then(() => {

                interaction_callback(true);

            }).catch(() => {

                interaction_callback(false);

            });

        }).catch(() => {

            interaction_callback(false);

        });
    }
};
