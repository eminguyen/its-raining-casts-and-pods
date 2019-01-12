/* config file */
global.config = require('./config.json');

/* express stuff */
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

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
const storageRef = firebase.storage().ref();



// store number & audio files
