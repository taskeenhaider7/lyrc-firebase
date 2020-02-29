// Google places
// Searches for places in Google
// Swiffshot Technologies Inc. 2018 - All rights reserved
// Author: Darien Miranda <panzerfausten@gmail.com>
// ========
const request = require('request');
module.exports = {
  search:function(lat,lon,name,response_callback){
    _KEY = "AIzaSyCBVknPmd2_GTpjP0pXjHvTAqYDBNqYgA0";
    _url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key={key}&location={lat},{lon}&rankby=distance";
    _url = _url.replace("{key}",_KEY);
    _url = _url.replace("{lat}",lat);
    _url = _url.replace("{lon}",lon);
    _url = _url.replace("{name}",name);
    request(_url, function (error, response, body) {
      // console.log('body:', JSON.parse(response.body).results); // Print the HTML for the Google homepage.
      response_callback(JSON.parse(response.body).results);
    });

  },
  searchByName:function(name,response_callback){
    _KEY = "AIzaSyCBVknPmd2_GTpjP0pXjHvTAqYDBNqYgA0";
    _url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key={key}&input={name}&inputtype=textquery&rankby=distance&fields=geometry,icon,id,name,photos,place_id,reference,type"
    _url = _url.replace("{key}",_KEY);
    _url = _url.replace("{name}",name);
    request(_url, function (error, response, body) {
      // console.log(error);
      // console.log('body:', JSON.parse(response.body).candidates); // Print the HTML for the Google homepage.
      response_callback(JSON.parse(response.body).candidates);
    });

  },
  placeDetails:function(place_id,response_callback){
    _KEY = "AIzaSyCBVknPmd2_GTpjP0pXjHvTAqYDBNqYgA0";
    _url = "https://maps.googleapis.com/maps/api/place/details/json?key={key}&place_id={place_id}&fileds=formatted_phone_number,international_phone_number,opening_hours,website,rating,review"
    _url = _url.replace("{key}",_KEY);
    _url = _url.replace("{place_id}",place_id);
    // console.log(_url);
    request(_url, function (error, response, body) {
      // console.log('body:', JSON.parse(response.body).result); // Print the HTML for the Google homepage.
      response_callback(JSON.parse(response.body).result);
    });
  }
};
