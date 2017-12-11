    var express = require('express');
    var app = express();
    var bodyParser = require('body-parser');
    var multer = require('multer');
    var request = require('request');
    var reqPromise = require('request-promise');
    var i2b = require("imageurl-base64");
    const fs = require('fs');
    const vision = require('node-cloud-vision-api');
    vision.init({auth: 'AIzaSyAvfk4Y0PbsSpnRAmFb3ljnlzIKwW9SqmA'});
    var convert = require('color-convert');
    var nearestColorSettings = {
      red: '#ff0000',
      yellow: '#ffff00',
      blue: '#0000ff',
      white: '#FFFFFF',
      black: '#000000',
      grey: '#808080',
      green: '#00FF00',
      brown: '#964B00',
      purple: '#660099',
      silver: '#C0C0C0',
      orange: '#FF681F',
      pink: '#FFC0CB',
      gold: '#FFD700'
    };
    var returnObj = {
      immurl: '',
      item: []
    };
    var nearestColor = require('nearest-color').from(nearestColorSettings);

    //cloudinary library for image manipulation
    var cloudinary = require('cloudinary');
    cloudinary.config({
      cloud_name: 'ulichitr',
      api_key: '438813316157917',
      api_secret: 'WrUvy1lfCqwYLVLHV4GkDrSVqmE'
    });
    app.use(function(req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    var binaryData;
    /** Serving from the same express Server
    No cors required */
    app.use(express.static('../client'));
    app.use(bodyParser.json());


    /** API path that will upload the files */
    app.post('/upload', function(req, res) {
      returnObj.immurl=req.body.imgURL;
      returnObj.item.length = 0;
        console.log(req.body.imgURL);
        i2b(req.body.imgURL, function(err, data){
          binaryData = data;
        });
        fs.unlinkSync('/Users/pavanulichi/Applications/style-detector/client/myjsonfile.json');
        var queryParameters = { url: req.body.imgURL};
        // deepomaticDataFetch('280123426', queryParameters.url);
        //   setTimeout(function() { fs.appendFile('../client/myjsonfile.json', JSON.stringify(returnObj), 'utf8') }, 3000);//real action
          setTimeout(function(){res.json(returnObj)}, 6000);
        var options = {
          uri: 'https://api.deepomatic.com/v0.6/detect/fashion',
          qs: queryParameters,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1.1; A1 Build/LMY47V) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.116 Mobile Safari/537.36',
            'X-APP-ID': '290955901846',
            'X-API-KEY': 'f47f721aeff242ac8ccb48dc93ad92c3'
            },
          json: true
        };
        reqPromise(options)
          .then(function(body){
            console.log("promising really!");
            // console.log(repos);
            if(body.status == "error"){

            }
            else {
              var rr_data = body.task_id;
              console.log(rr_data);
              setTimeout(function() { deepomaticDataFetch(rr_data, queryParameters.url) }, 2000);
              setTimeout(function() { fs.appendFile('../client/myjsonfile.json', JSON.stringify(returnObj), 'utf8') }, 5000);//real action
              // sendGenericMessageForFavoriteItems(sid, rr_array);
          }
          })
          .catch(function(err){
            console.log("api call failed deepomatic");
            console.log(response.status);
          });
    });
function deepomaticDataFetch(id, imgurl_here){
  var reqUrl = "https://api.deepomatic.com/v0.6/tasks/" + id;
  console.log("task id " + id);
  var options = {
    uri: reqUrl,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1.1; A1 Build/LMY47V) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.116 Mobile Safari/537.36',
      'X-APP-ID': '290955901846',
      'X-API-KEY': 'f47f721aeff242ac8ccb48dc93ad92c3'
      },
    json: true
  };
  reqPromise(options)
    .then(function(body){
      if(body.status == "error"){

      }
      else {
        var image_width = body.task.data.width;
        var image_height = body.task.data.height;
        var cornerX_array = [];
        var cornerY_array = [];
        var width_array = [];
        var height_array = [];
        var boxes = body.task.data.boxes;
        var result = Object.keys(boxes).map(function(key) {
          return (key);
        });
        result.forEach(i=>{
          // console.log("Element");
          // console.log(i);
          // console.log(boxes[i][0]);
          cornerX_array.push(((boxes[i][0]['xmin'])*image_width).toFixed());
          cornerY_array.push(((boxes[i][0]['ymin'])*image_height).toFixed());
          width_array.push((((boxes[i][0]['xmax'])-(boxes[i][0]['xmin']))*image_width).toFixed());
          height_array.push((((boxes[i][0]['ymax'])-(boxes[i][0]['ymin']))*image_height).toFixed());
        });
        // console.log('cornerX_array' + cornerX_array);
        // console.log('cornerY_array' + cornerY_array);
        // console.log('width_array' + width_array);
        // console.log('height_array' + height_array);
        for (var i = 0; i < result.length; i++) {
          console.log(result[i] + " " + cornerX_array[i] + " " + cornerY_array[i] + " " + width_array[i] + " " + height_array[i]);
          cloudVisionApi(imgurl_here, result[i], (cloudinary.url(imgurl_here,{ type: 'fetch', height: height_array[i], width: width_array[i], x: cornerX_array[i], y:cornerY_array[i], crop: "crop"})));
        }
        //cloudVisionApi(imgurl_here);
    }
    return "hii";
    })
    .catch(function(err){
      console.log("api call failed deepData");
      console.log(response.status);
    });
}

function cloudVisionApi(imgurl_here, prodName, url){
  console.log("cloudinary call: " + url);
  var req = new vision.Request({
  image: new vision.Image({
    url: url
    }),
  features: [
    new vision.Feature('IMAGE_PROPERTIES', 10),
    ]
  });
  // send single request
vision.annotate(req).then((res) => {
  // handling response
  var colHex = res.responses[0].imagePropertiesAnnotation.dominantColors.colors[0];
  var prodColor = nearestColor('#' + (convert.rgb.hex(colHex.color.red, colHex.color.green, colHex.color.blue))).name
  console.log(prodName);
  console.log(convert.rgb.hex(colHex.color.red, colHex.color.green, colHex.color.blue));
  console.log(prodColor);
  callSightHoundApi(imgurl_here, prodColor, prodName);
  // callRrFindApi(prodColor+" "+prodName.replace('-','+'));

  return "bkjank";
  }, (e) => {
    console.log('Error: ', e)
  });
}
function callSightHoundApi(url, prodColor, prodName){
  var jajaja;
  var blabla;

  i2b(url, function(err, data){
    if(err){

      console.log(err);
    }else {
        blabla = data.base64;

        // console.log("base64: ");
    }

});
var imgg = {image: blabla};
  var options = {
    method: 'POST',
    uri: "https://dev.sighthoundapi.com/v1/detections?type=face&faceOption=gender",
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1.1; A1 Build/LMY47V) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.116 Mobile Safari/537.36',
      'X-Access-Token': 'uwUcYk6hBR8ceiKFaqlZzz21bCbkVlXdembK',
      'Content-Type': 'application/json'
      },
      body: {
        'image': url
      },
    json: true
  };
  reqPromise(options)
    .then(function(body){
      console.log("promising really!");
      // console.log(repos);
      if(body.status == "error"){

      }
      else {
        var rr_data = body.objects[0].attributes.gender;
        console.log("user gender " + rr_data);
        if (rr_data == "male") {
          jajaja = 'men';
        }
        else {
          jajaja = 'Women';
        }
        callRrFindApi(jajaja + " " + prodColor+" "+prodName.replace('-','+'));

        // sendGenericMessageForFavoriteItems(sid, rr_array);
    }
    })
    .catch(function(err){
      console.log("api call failed hound");
      console.log(err);
    });
}

function callRrFindApi(query){
  var options = {
    uri: "https://staging.richrelevance.com/rrserver/api/find/v1/dbeab3c977a08905?facet=&query="+query+"&lang=en&start=0&rows=5&placement=generic_page.rory_search&userId=ulichi&sessionId=mysession",
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 5.1.1; A1 Build/LMY47V) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.116 Mobile Safari/537.36'
      },
    json: true
  };
  reqPromise(options)
    .then(function(body){
      rr_array = body.placements[0].docs;
      console.log("***************************");
      // returnObj.push(body.placements[0].docs[0]);
      // var json = JSON.stringify(returnObj);
      console.log((body.placements[0].docs[0]));
      var tempData = body.placements[0];
      tempData.rcs = query;
      //returnObj.item.searchTerm.push((query));
      returnObj.item.push((tempData));
      //console.log(rr_array);

      // sendGenericMessageForSearch(sid, rr_array);
      // setTimeout(function() { v2_restartAnytime(sid) }, 7000);
      // The Description is:  "descriptive string"

    })
    .catch(function(err){
      console.log("api call failed rr");
      console.log(response.status);
    });
}
// function toObject(arr) {
//   var rv = {};
//   for (var i = 0; i < arr.length; ++i)
//     rv[i] = arr[i];
//   return rv;
// }

app.listen('3000', function(){
    console.log('running on 3000...');
});
