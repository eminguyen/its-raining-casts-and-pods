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
  response.render('index');
});

app.listen(port, function() {
  console.log('we are gucci');
});

/* twilio stuff */
const twilio = require('twilio');
const client = new twilio(config.twilioSid, config.twilioToken);
<<<<<<< HEAD

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

// const storageRef = firebase.storage().ref() --> leads to an error
