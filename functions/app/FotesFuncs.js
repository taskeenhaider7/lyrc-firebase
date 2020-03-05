const Jimp = require("jimp");
const mime  = require('mime');
const ImageTools = require('../models/ImageTools');

/*var s3Client = s3.createClient({
  maxAsyncS3: 20,     // this is the default
  s3RetryCount: 3,    // this is the default
  s3RetryDelay: 1000, // athis is the default
  multipartUploadThreshold: 20971520, // this is the default (20 MB)
  multipartUploadSize: 15728640, // this is the default (15 MB)
  s3Options: {
    accessKeyId: "AKIAIVCQM6HXBRBCMTVQ",
    secretAccessKey: "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",
    // any other options are passed to new AWS.S3()
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
  },
});*/
const Fotes = require('../models/Fotes');
const Hashtag = require('../models/Hashtag');

exports.createFote = function(user, fote_req, files, res, callback){
    let fote = null;
    if(!fote_req){
        return res.status(400).json({"message": 'Missing parameters', "parameters": "fote"});
    }else{
        fote = JSON.parse(fote_req);
    }
    if(!validateFote(fote)) return res.status(400).json({"message": 'Missing parameters', "parameters": "fote"});
    if(files.length === 0) return res.status(400).json({"message": 'Missing parameters', "parameters": "files"});

    let photo_fote = null;
    if(files['photo_fote']){
        photo_fote = files['photo_fote'][0];
    }
    if(!photo_fote) return res.status(400).json({message: 'Missing parameters', "parameters": "photo_fote"});
    let audio_fote = null;
    if(files['audio_fote']){
        audio_fote = files['audio_fote'][0];
    }
    //new field audio on model database
    Jimp.read(photo_fote.path)
      .then(photo =>{
        let extension = mime.extension(photo_fote.mimetype);
        let file_name  = photo_fote.filename.split(".")[0];
        let width   = photo.bitmap.width;
        let height  = photo.bitmap.height;
        let ratio   = width / height;
        let metadata = {
          "width":width,
          "height":height,
          "aspect_ratio":ratio,
          "predominant_color":""
        };
        let thumbnailPath = "uploads/" + file_name + "_thumbnail." + extension;
        photo.quality(0.25).scale(0.8).write(thumbnailPath);
        ImageTools.getPredominantColor(photo_fote.path,(colorPred)=>{
          metadata["predominant_color"] = colorPred;
          let thumbnail = {
            "fieldname":"media",
            "originalname": photo_fote.originalname,
            "encoding":photo_fote.encoding,
            "mimetype":photo_fote.mimetype,
            "destination":photo_fote.destination,
            "filename":file_name + "_thumbnail." + extension,
            "path":thumbnailPath,
            "size": photo_fote.size,
            "metadata":metadata
          };
          photo_fote.metadata = metadata;
          uploadFiles(photo_fote, thumbnail, audio_fote, (err, resp)=>{
            if(err) return res.status(500).json({"message": "Internal Server Error"});
            fote["media"]         = [resp.photo_fote];
            fote["thumbnails"]    = [resp.thumbnail];
            fote["audio_caption"] = [resp.audio_fote];
            fote["creation_date"] = Date.now();
            fote["uid"]           = user[1];
            fote["type"] = "audio_caption";
            let lat = fote.location.latitude;
            let lon = fote.location.longitude;
            if(lat == null){
              lat = 0;
              lon = 0;
            }
            fote["location_index"] = [lat,lon];
            Fotes.create(fote,(sFote)=>{
              let status = sFote[0] ? 201:401;
              console.log("result Fotes.create");
              console.log(sFote[1]);
              if(status === 201){
                if(fote.hashtags){
                  Hashtag.addHashtags(fote.hashtags, (err, hashes)=>{
                    return res.status(status).send(sFote[1]);
                  });
                }else{
                  return res.status(status).send(sFote[1]);
                }
              }else{
                return res.status(status).send(sFote[1]);
              }
            });
          });
        });
      })
      .catch(err=>{
        console.log("error jimp image");
        console.log(err);
        return res.status(500).json({"message": 'Internal Server Error'});
      })

    //https://medium.com/@salonimalhotra1ind/uploading-a-file-multiple-to-amazon-web-services-aws-s3-bucket-with-node-js-in-express-8e268ab12422
    //return callback({fote:{"something": "something"}});
}
function uploadFiles(photo_fote, thumbnail, audio_fote, callback){
  let obj = {};
  saveToS3(photo_fote, (err, res)=>{
    if(err) return callback(true, null);
    obj.photo_fote = res;
    saveToS3(thumbnail, (err,res)=>{
      if(err) return callback(true, null);
      obj.thumbnail = res;
      if(audio_fote){
        saveToS3(audio_fote, (err, res)=>{
          if(err) return callback(true, null);
          obj.audio_fote = res;
          return callback(false, obj);
        });
      }else{
        return callback(false, obj);
      }
    });
  });
}
function validateFote(fote){
  let _isValid = true;
  fote.hasOwnProperty("note") ? _isValid=true : _isValid=false;
  fote.hasOwnProperty("location") ? _isValid=true : _isValid=false;
  fote.hasOwnProperty("hashtags") ? _isValid=true : _isValid=false;
  fote.hasOwnProperty("type") ? _isValid=true : _isValid=false;
  fote.hasOwnProperty("date") ? _isValid=true : _isValid=false;
  return _isValid;
}
function saveToS3(file,ufc){
  var params = {
    localFile: './uploads/'+file.filename,
    s3Params: {
      Bucket: "fotesapp",
      Key: "fotes/"+file.filename,
      ACL:'public-read'
    },
  };
  var uploader = s3Client.uploadFile(params);

  uploader.on('error', function(err) {
     console.error("unable to upload:", err.stack);
     ufc(true, null)
  });
  uploader.on('end', function() {
    // console.log("done uploading");
    let url = "https://s3.amazonaws.com/fotesapp/fotes/" +file.filename
    file["url"] = url
    ufc(false, file);
  });
}
