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

// Path joins the current directory name with views (aka current directory + views)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('index');
});

/* firebase stuff */
const firebase = require("firebase");

const fbSettings = {
  apiKey: config.firebaseKey,
  authDomain: config.firebaseAuth,
  databaseURL:config.firebaseDB,
  storageBucket: config.firebaseSB,
};
firebase.initializeApp(fbSettings);

const databaseRef = firebase.database().ref('podcasts/');


// /* google cloud stuff */
const gcloud = require('@google-cloud/storage');
let storage = new gcloud.Storage();

// Add to the database
firebase.database().ref('podcasts/testurl1/').set({
  'link': 'fakeaudio'
});

// Iterate through the database and convert each link into a web page
databaseRef.once('value')
  .then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      let url = childSnapshot.key;
      let audio = childSnapshot.val().link;
      app.get(`/${url}`, function(request, response) {
        response.render('test');
      });

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

/* socket io */
/*
const server = http.Server(app);
server.listen(port);
const socketIo = require('socket.io');
const io = socketIo(server);

io.on('connection', (socket) => {
  socket.emit('hello', {
    greeting: 'Hello world'
  })
})*/

upload();

console.log('${filename} uploaded to bucket');
