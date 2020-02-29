const queries = require('../database/queries.js');

module.exports = {
    comment: function (idFote, userId, comment, makecomment_callback) {
        const _cd = Date.now();
        const _comment = {"uid": new ObjectID(userId), "comment": comment, "fote_id": new ObjectID(idFote)};
        _comment["creation_date"] = _cd;

        queries.add("comments", _comment).then(() => {
            makecomment_callback([true, _comment]);
        }).catch(() => {
            makecomment_callback([false, null]);
        });
    }
};
