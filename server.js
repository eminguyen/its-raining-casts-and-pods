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
let gstorage = new gcloud.Storage();

listIds = []

const bucketName = 'sb-hacks-19-videos';

// Iterate through the database and convert each link into a web page
databaseRef.once('value')
  .then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      let id = childSnapshot.val().id;
      let description = childSnapshot.val().description;
      let title = childSnapshot.val().title;
      listIds.push(
      {name: id,
      title: title,
      description: description});

      let filename = id;
      let destFilename = `public/videos/${filename}`;
      let options = {
        // The path to which the file should be downloaded, e.g. "./file.txt"
        destination: destFilename,
      };

      // Downloads the files
      async function download() {
        await gstorage
          .bucket(bucketName)
          .file(filename)
          .download(options);
      }

      download();

      app.get(`/${id}`, function(request, response) {
        response.render('podcast', {
          id: id,
        });
      });
    });
  });

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/videos/')
  },
  filename: function (req, file, cb) {
    cb(null, 'podcast-'+ Date.now())
  }
})
const upload = multer({storage: storage})

app.post('/public/videos/', upload.single('video'),function(req, res) {
    console.log(req.file);
    firebase.database().ref(`/${req.file.filename}`).set({
        'title': `Podcast: ${req.file.filename.substring(8)}`,
        'description': 'Feel free to change the description!',
        'id': req.file.filename
    });
    listIds.push({
      title: `Podcast: ${req.file.filename.substring(8)}`,
      description: 'Feel free to change the description!',
      name: req.file.filename
    });
    app.get(`/${req.file.filename}`, function(request, response) {
      response.render('podcast', {
        id: req.file.filename,
      });
    });

    // Uploads files
    async function uploading(){
      await gstorage.bucket(bucketName).upload(`./public/videos/${req.file.filename}`, function(err, file){
        if (!err) {
        console.log('your file is now in your bucket.');
      } else {
        console.log('Error uploading file: ' + err);
      }
      });
    }

    uploading();

    res.send(req.file);
});

module.exports = app;
