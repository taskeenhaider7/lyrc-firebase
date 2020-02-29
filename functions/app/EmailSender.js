const nodemailer = require('nodemailer');

exports.sendEmail = function(header, body, callback){
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'team@swifflabs.com',
            clientId: '470268663822-nt32tkktmgof811so7ehtjj2jv7at43o.apps.googleusercontent.com',
            clientSecret: 'N84crZzuhqYKYpnL9VI9SelL',
            refreshToken: '1/rsYfgAvm9BibkCMfvBEqtKkFwdCEjSm4y4uUaayVIPd7pvic2fdy50zU4Hab_V5Q'
        }
    });
    let mailOptions = {
        from: 'Lyrc <team@swifflabs.com>',
        to: header.email,
        subject: header.subject,
        html: body
    }
    transporter.sendMail(mailOptions, function(error, response){
        console.log("error send email");
        console.log(error);
        console.log("response send email");
        console.log(response);
        if(error) return callback(true, response);
        return callback(false, null);
    });
}