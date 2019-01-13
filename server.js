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



/* Recording audio */

//
// const mic = require('mic');
// const fs = require('fs');
// const url = require('url');
//
// const micInstance = new mic({
//   rate: '16000',
//   channels: '1',
//   debug: true,
//   exitOnSilence: 6,
//   fileType: 'mp3'
// });
//
// const micInputStream = micInstance.getAudioStream();
// const outputFileStream = fs.createWriteStream('test.mp3', {encoding: "binary"});
//
// micInputStream.pipe(outputFileStream);
//
// micInputStream.on('data', function(data) {
//   console.log("Received Input Stream: " + data.length);
// });
// micInputStream.on('error', function(err){
//   console.log("Error in Input Stream: " + err);
// })
//
// micInputStream.on('startComplete', function(){
//   console.log("Got SIGNAL startComplete");
//   setTimeout(function() {
//     micInstance.pause();
//   }, 5000);
//   setTimeout(function() {
//     micInstance.stop();
//   }, 5000);
// });
//
// micInputStream.on('stopComplete', function() {
//     console.log("Got SIGNAL stopComplete");
//     outputFileStream.end();
// });
//
// micInputStream.on('pauseComplete', function() {
//     console.log("Got SIGNAL pauseComplete");
//     setTimeout(function() {
//         micInstance.resume();
//     }, 5000);
// });
//
// micInputStream.on('resumeComplete', function() {
//     console.log("Got SIGNAL resumeComplete");
//     setTimeout(function() {
//         micInstance.stop();
//     }, 5000);
// });
//
// micInputStream.on('silence', function() {
//     console.log("Got SIGNAL silence");
// });
//
// micInputStream.on('processExitComplete', function() {
//     console.log("Got SIGNAL processExitComplete");
// });

// micInstance.start();



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
firebase.database().ref('podcasts/').set({
  'podcast1': {
    'id': 'fakelink1',
  },
  'podcast2': {
    'id': 'fakelink2',
  }
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
let filename = 'testlecture.mp3';
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

/* speech-to-text */
async function main(){
  const speech = require('@google-cloud/speech')  ;
  const fs = require('fs');

  const client = new speech.SpeechClient();
  // name of file to transcribe
  const fileName = 'public/videos/testAudio.mp3'

  // reads local audio files
  const file = fs.readFileSync(fileName);
  const audioBytes = file.toString('base64');
  const model = 'video'

  const speechConfig = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
    // model: model
  };

  const audio = {
    content: fs.readFileSync(fileName).toString('base64'),
  };

  const request = {
    config: speechConfig,
    audio: audio,
  };

  // Detects speech in the audio file
  client
    .recognize(request)
    .then(data => {
      console.log(data);
      const response = data[0];
      console.log(response);
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      console.log(`Transcription: `, transcription);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

main();

/* translation */
// const {Translate} = require('@google-cloud/translate');
// const projectId = config.projectID;
// const translate = new Translate({
//   projectId: projectId
// });
//
// // text to translate
// const text = 'Hello, world!';
// // target language
// const target = 'ru';

// Translates the text into the target language. "text" can be a string for
// translating a single piece of text, or an array of strings for translating
// multiple texts.
// let [translations] = await translate.translate(text, target);
// translations = Array.isArray(translations) ? translations : [translations];
// console.log('Translations:');
// translations.forEach((translation, i) => {
//   console.log(`${text[i]} => (${target}) ${translation}`);
// });
