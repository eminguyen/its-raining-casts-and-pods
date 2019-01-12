/* config file */
global.config = require('./config.json');

/* express stuff */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Declare an instance of express
const app = express();
const port = 3000;

app.use(bodyParser());
app.use(cors());

// Path joins the current directory name with views (aka current directory + views)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('index', {
    foo: 'bar',
    key: 'value'
  });
});

app.get('/test', function(request, response) {
  response.render('test');
});

app.listen(port, function() {
  console.log('we are gucci');
});

/* twilio stuff */
const twilio = require('twilio');
const client = new twilio(config.twilioSid, config.twilioToken);

// client.messages.create({
//     body: 'hello world',
//     to: config.receiverNumber,  // Text this number
//     from: config.senderNumber // From a valid Twilio number
// })
// .then((message) => console.log(message.sid))
// .done();

/* firebase stuff */
const firebase = require("firebase");

const fbSettings = {
  apiKey: config.firebaseKey,
  authDomain: config.firebaseAuth,
  databaseURL:config.firebaseDB,
  storageBucket: config.firebaseSB,
};
firebase.initializeApp(fbSettings);

const databaseRef = firebase.database().ref();


// /* google cloud stuff */
const gcloud = require('@google-cloud/storage');
let storage = new gcloud.Storage();

const bucketName = 'sb-hacks-19-videos';
const filename = 'videos/test.mp4';

async function upload(){
  await storage.bucket(bucketName).upload(filename, function(err, file){
    if (!err) {
    console.log('your file is now in your bucket.');
  } else {
    console.log('Error uploading file: ' + err);
  }
  });
}

upload();

console.log('${filename} uploaded to bucket');
