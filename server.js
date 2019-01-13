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
      let transcription = childSnapshot.val().transcription;
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
      console.log('DOWNLOADING');
      download();

      app.get(`/${id}`, function(request, response) {
        response.render('podcast', {
          id: id,
          transcription: transcription
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
  allSortsOfStuff(req, res);
});

async function allSortsOfStuff(req, res) {
  let transcription = await speechToText(req.file.filename);
  let id = req.file.filename;
  await firebase.database().ref(`/${id}`).set({
      'title': `Podcast: ${id.substring(8)}`,
      'description': 'Feel free to change the description!',
      'id': id,
      'transcription': transcription
  });
  await listIds.push({
    title: `Podcast: ${id.substring(8)}`,
    description: 'Feel free to change the description!',
    name: id,
  });
  await app.get(`/${id}`, function(request, response) {
    response.render('podcast', {
      id: id,
      transcription: transcription
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

  await uploading();

  await res.send(req.file);
}

module.exports = app;

/* speech-to-text */
async function speechToText(soundFile){
  const speech = require('@google-cloud/speech')  ;
  const fs = require('fs');
  const ffmpeg = require('fluent-ffmpeg');
  const client = new speech.SpeechClient();
  const fileName = `public/videos/${soundFile}`;
  await setFFMPEG();

  function setFFMPEG() {
    //make sure you set the correct path to your video file
    var proc = new ffmpeg({ source: fileName, nolog: true })
    .toFormat('flac')
    // setup event handlers
    .on('end', function() {
      console.log('converted')
    })
    .on('error', function(err) {
      console.log('an error happened: ' + err.message);
    })
    // save to file <-- the new file I want -->
    .saveToFile('output')/*`/public/outputs/${soundFile}`)*/
    return;
  }

  // reads local audio files
  const file = fs.readFileSync('output')/*`/public/outputs/${soundFile}`);*/
  const audioBytes = file.toString('base64');
  console.log('file has been converted successfully');

  const speechConfig = {
    encoding: 'FLAC',
    sampleRateHertz: 48000,
    enableAutomaticPunctuation: true,
    languageCode: 'en-US',
    model: 'video'
  };

  const audio = {
    content: audioBytes,
  };

  const request = {
    config: speechConfig,
    audio: audio,
  };

  // Detects speech in the audio file
  return client
    .recognize(request)
    .then(data => {
      console.log(data);
      const response = data[0];
      console.log(response);
      transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\t');
      console.log(transcription);
      return transcription;
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}

/* translation */
async function translate(text){
  const {Translate} = require('@google-cloud/translate');
  const projectId = config.projectID;
  const translate = new Translate({
    projectId: projectId
  });

  // target language
  const target = 'zh-CN';

  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  let [translations] = await translate.translate(text, target);
  translations = Array.isArray(translations) ? translations : [translations];
  console.log('Translations:');
  translations.forEach((translation, i) => {
    console.log(`${text[i]} => (${target}) ${translation}`);
  });
}
