// Fotes.js
// Handles some Image processing tools
// Swiffshot Technologies Inc. 2018 - All rights reserved
// Author: Darien Miranda <panzerfausten@gmail.com>
// ========
var histogram = require('histogram');
var Color = require('color');

module.exports = {
  getPredominantColor:function(path,process_callback){
    fileName = path;
    console.log(fileName)
    idata = null
    histogram(fileName || Buffer, function (err, data) {
        idata= data;
        r = Math.max.apply(Math,idata.red)
        r = idata.red.indexOf(r)

        g = Math.max.apply(Math,idata.green)
        g = idata.green.indexOf(g)

        b = Math.max.apply(Math,idata.blue)
        b = idata.blue.indexOf(b)

        var color = Color({r: r, g: g, b: b})
        process_callback(color.lightness(22).hex())
    });




  }
};
