const User = require('../models/users');
const Hashtag = require('../models/Hashtag');

exports.findByWord = function (word_key, user, callback) {
    if (!word_key) return callback(400, { "status": false, "message": "Missing parameters" });
    if (word_key.length < 2) return callback(200, { "status": true, "result": [] });
    User.search(word_key, user, (users) => {
        let usersF = users ? users : [];
        usersF = usersF.length > 1 ? usersF.slice(0, 10) : usersF;
        Hashtag.getHashtagsByWord(word_key, (err, hashes) => {
            let hash = hashes ? hashes : [];
            let result = usersF.concat(hash);
            return callback(200, { "status": true, "result": result });
        });
    })
}
exports.getFotesByHashtag = function (hashtag, user, page, callback) {
    if (!hashtag) return callback(400, { "status": false, "message": "Missing parameters" });
    let search_page = page || 1;
    search_page = parseInt(search_page);
    let perPage = 25;
    Hashtag.getPostByHashtags(user, '#'+hashtag, search_page, perPage, (err, posts) => {
        if(err){
            return callback(500, { "status": false, "message": "Internal Server Error" });
        }else{
            return callback(200, { "status": true, "posts": posts });
        }
    });
}