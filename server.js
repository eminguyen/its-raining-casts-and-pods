/* config file */
global.config = require('./config.json');

/* express stuff */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Declare an instance of express
const app = express();
//const http = require('http');
const port = 3000;

app.use(bodyParser());
app.use(cors());
app.use(express.static(__dirname + '/public'));

// Path joins the current directory name with views (aka current directory + views)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('index', {
    list: listIds
  });
});

app.listen(port);

/* firebase stuff */
const firebase = require("firebase");

const fbSettings = {
  apiKey: config.firebaseKey,
  authDomain: config.firebaseAuth,
  databaseURL:config.firebaseDB,
  storageBucket: config.firebaseSB,
};
firebase.initializeApp(fbSettings);

const databaseRef = firebase.database().ref('/');


// /* google cloud stuff */
const gcloud = require('@google-cloud/storage');
let storage = new gcloud.Storage();

// Add to the database
firebase.database().ref('/').set({
  'podcast1': {
    'id': 'fakelink1',
  },
  'podcast2': {
    'id': 'fakelink2',
  },
  'podcast3': {
    'id': 'fakelink3',
  },
  'podcast4': {
    'id': 'fakelink4',
  },
  'podcast5': {
    'id': 'fakelink5',
  },
  'podcast6': {
    'id': 'fakelink6',
  },
  'podcast7': {
    'id': 'fakelink7',
  },
  'podcast8': {
    'id': 'fakelink8',
  },
  'podcast9': {
    'id': 'fakelink9',
  },
});

listIds = []

// Iterate through the database and convert each link into a web page
databaseRef.once('value')
  .then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      let id = childSnapshot.val().id;
      listIds.push({name: id})
      app.get(`/${id}`, function(request, response) {
        response.render('podcast', {
          id: id,
        });
      });
    });
  });

const bucketName = 'sb-hacks-19-videos';
const filename = 'fakelink1.mp4';
const destFilename = `public/videos/${filename}`;
const options = {
  // The path to which the file should be downloaded, e.g. "./file.txt"
  destination: destFilename,
};

// Downloads the files
async function download() {
  await storage
    .bucket(bucketName)
    .file(filename)
    .download(options);
}

/*async function upload(){
  await storage.bucket(bucketName).upload(filename, function(err, file){
    if (!err) {
    console.log('your file is now in your bucket.');
  } else {
    console.log('Error uploading file: ' + err);
  }
  });
}*/


download();
