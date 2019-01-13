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

Add to the database
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


/* speech-to-text */
async function main(){
  const speech = require('@google-cloud/speech')  ;
  const fs = require('fs');

  const client = new speech.SpeechClient();

  // name of file to transcribe (make sure to be a .flac)
  // use the command, ffmpeg -i [original flac file] -ac 1 [new mono flac]

  const fileName = 'public/videos/mono.flac'

  // reads local audio files
  const file = fs.readFileSync(fileName);
  const audioBytes = file.toString('base64');
  const model = 'video'

  const speechConfig = {
    encoding: 'FLAC',
    // sampleRateHertz: 30000,
    languageCode: 'en-US',
    // model: model
  };

  const audio = {
    content: audioBytes,
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
      transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      console.log(`Transcription: `, transcription);
      translate(transcription);
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

main();
