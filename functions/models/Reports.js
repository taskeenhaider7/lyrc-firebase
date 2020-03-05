const queries = require("../database/queries");

module.exports = {
    report: function (reported_by_uid, content_id, content_type, reportCallback) {
        report = {
            "reported_by_oid": new ObjectID(reported_by_uid),
            "reported_by_uid": reported_by_uid,
            "content_id": new ObjectID(content_id),
            "content_type": "FOTE",
            "report_date": Date.now()
        };

        queries.add("reports", report).then(snapshot => {
            reportCallback([true, report]);
        }).catch(error => {
            reportCallback([false, null]);
        });
    }
};
