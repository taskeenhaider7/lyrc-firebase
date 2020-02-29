const User = require('../models/users');

exports.getUserById = function(id_user, res, callback){
    if(!id_user) return res.status(400).json({"message": "Missing parameters"});
    User.getUserByIdProfile(id_user, (result)=>{
        return callback({"success": true, "user": result});
    });
};
